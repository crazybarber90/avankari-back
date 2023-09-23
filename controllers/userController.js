const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP, mailTransport, generateEmailTemplate, plainEmailTemplate, plainEmailTemplate2, plainEmailTemplate3, generatePasswordResetTemplate } = require("../Utils/mail");
const VerificationToken = require("../models/verificationToken");
const { request } = require("express");
const { isValidObjectId } = require("mongoose");
const ResetToken = require("../models/resetToken");
const crypto = require("crypto");
const { createRandomBytes, sendError, generateCode } = require("../Utils/helper");
// const Token = require("../models/tokenModel");
// const crypto = require("crypto");
// const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");
const UserDetails = require("../models/userDetailsModel");
const { fileSizeFormatter } = require("../Utils/fileUpload");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


//GENERATE JWT TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// GOOGLE SIGN-IN CONTROLLER
const googleSignup = asyncHandler(async (req, res) => {
  // res.json({ message: "hello" });
  const { name, email, photo, accessToken } = req.body;

  if (!name || !email || !photo || !accessToken) {
    res.status(400);
    throw new Error("Invalid data provided");
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if not found
      const newUser = await User.create({
        name,
        email,
        photo,
        // You can generate a random password or use a token here
        password: "random_generated_password_or_token",
        verified: "true",
      });

      user = newUser;
    }

    // Generate a token for the user
    const token = generateToken(user._id);

    // Respond with the user's data and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      phone: user.phone,
      verified: user.verified,
      facebookUrl: user.facebookUrl,
      instagramUrl: user.instagramUrl,
      phoneNumber: user.phoneNumber,
      table: user.table,
      // user,
      token,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Server error");
  }
});

// ------------------ REGISTER USER -----------------------------------------

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  // VALIDATION
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  // CHECK IF USER EMAIL ALLREADY EXIST
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("Email has allready been registered");
  }

  // CREATE NEW USER
  const user = await User.create({
    name,
    email,
    password,
  });

  // GENERATE AND SAVE IN DB 4DIDGETS FOR MAIL CONFIRMATION  <--- verificationToken
  const OTP = generateOTP()
  const verificationToken = new VerificationToken({
    owner: user._id,
    token: OTP,
  })

  await verificationToken.save()

  mailTransport().sendMail({
    from: 'pepy90aa@gmail.com',
    to: user.email,
    subject: "Verify Your Email Account",
    html: generateEmailTemplate(OTP)
  })

  //GENERATE TOKEN F AFTER CREATE USER
  const token = generateToken(user._id);

  // SEND HTTP-only cookie to Frontend
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const {
      _id,
      name,
      email,
      photo,
      phone,
    } = user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// ------------------ LOGIN USER -----------------------------------------

const loginUser = asyncHandler(async (req, res) => {
  // res.status(200).json({ message: "hello" });
  const { email, password } = req.body;

  // VALIDATE REQUEST
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password ");
  }

  // CHECK IF USER EXIST
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User not found, please sign up");
  }

  // USER EXIST , CHECK IF PASSWORD IS CORRECT
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  //GENERATE TOKEN F AFTER CREATE USER
  const token = generateToken(user._id);

  // SEND HTTP-only cookie to Frontend
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // ovo treba PROMENITI DA NE ISTICE ZA 1dan TOKEN
    sameSite: "none",
    secure: true,
  });

  if (user && passwordIsCorrect) {
    const { _id, name, email, photo, facebookUrl, instagramUrl, phoneNumber, table, verified } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      token,
      facebookUrl,
      instagramUrl,
      phoneNumber,
      table,
      verified,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// ------------------ LOGOUT USER -----------------------------------------

const logout = asyncHandler(async (req, res) => {
  // SEND HTTP-only cookie to Frontend
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({
    message: "Succesfuly logged out",
  });
});


// ------------------ VERIFY REGISTER EMAIL -----------------------------------------

const verifyEmail = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp.trim()) {
    return res.status(400).json({ success: false, message: "Invalid request, missing parameters!" });
  }

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ success: false, message: "Invalid User id!" });
  }

  const user = await User.findById(userId)
  if (!user) {
    return res.status(401).json({ success: false, message: "User not found!" });
  }

  if (user.verified) {
    return res.status(409).json({ success: false, message: "This Account is already verified!" });
  }

  const token = await VerificationToken.findOne({ owner: user._id })
  if (!token) {
    return res.status(404).json({ success: false, message: "Verification token not found!" });
  }

  const isMatched = await token.compareToken(otp)
  if (!isMatched) {
    return res.status(400).json({ success: false, message: "Please provide a valid token!" });
  }

  user.verified = true;

  // OVO MOZDA MORA DA SE PREBACI POSLE SLANJA MAILA
  await VerificationToken.findByIdAndDelete(token._id);

  await user.save()

  mailTransport().sendMail({
    from: 'pepy90aa@gmail.com',
    to: user.email,
    subject: "Welcome Email",
    html: plainEmailTemplate(
      "Email Verified Successfully",
      "Enjoy and stay connected!"
    ),
  });

  const { _id, name, email, photo, phone, bio } = user;
  return res.status(200).json({
    success: true,
    message: "Your email is verified",
    user: {
      _id,
      name,
      email,
      photo,
      phone,
      bio,
    },
  });
});


// ------------------ FORGOT PASSWORD SEND 5 DIDGETS TO MAIL -----------------------------------------
const resetPassword = asyncHandler(async (req, res) => {
  // return console.log(":TTOOOOOOOOOOOOOOO");
  try {

    const email = req.body.email

    const existingUser = await User.findOne({ email })

    if (!existingUser) {
      console.error({ success: false, message: 'There was an Error, User not found' })
      return res.send({ success: false, message: 'If user exists , an email was sent' })
    }

    const token = await generateCode(5)
    existingUser.resettoken = token;
    existingUser.resettokenExpiration = Date.now() + 3600000;
    await existingUser.save();

    await mailTransport().sendMail({
      from: 'pepy90aa@gmail.com',
      to: existingUser.email,
      subject: "Your password token",
      html: plainEmailTemplate2(token)
    });

    return res.send({ success: true, message: "Email sent" })
  } catch (error) {
    console.error(error)
  }

});

// ------------------ RESET AND UPDATE NEW PASSWORD IN DB-----------------------------------------

const resetPasswordConfirm = asyncHandler(async (req, res) => {
  // return console.log("REQUEST IZ FUNKCIJE", req.body)

  try {
    const email = req.body.email.email
    const code = req.body.code
    const password = req.body.newPassword
    const user = await User.findOne({ email })

    if (!user || user.
      resettoken !== code.toUpperCase()) {
      // console.log("NIJE ISTO")
      return res.send({ success: false, message: "Incorect 5 didgets code" })
    }
    // if (user.resettoken !== code) {
    //   return res.status(400).send({ success: false, message: "Incorect 5 didgets code" })
    // }

    if (user.resettokenExpiration < new Date()) {
      return res.status(400).send({ success: false, message: "Token has expired" })
    }

    user.password = password;
    user.token = '';
    user.tokenExpiration = null;
    await user.save()

    await mailTransport().sendMail({
      from: 'pepy90aa@gmail.com',
      to: user.email,
      subject: "Password Reset Successfully",
      html: plainEmailTemplate3(email, password)
    });

    return res.status(200).send({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ success: false, message: "An error ocured. Please try again LATERRRRRRRR" })
  }
})


//=============================== USER DETAILS ==================================================

const updateUserDetails = asyncHandler(async (req, res) => {

  try {
    // Dohvatite podatke iz tela zahteva (credentials)
    const { city, currentPlace, donjideo, gornjideo, kosa, obuca, oci, pol } = req.body;

    // Proverite da li su city i currentPlace obavezna polja
    if (!city || !currentPlace) {
      return res.status(400).json({ message: 'City and currentPlace are required fields.' });
    }

    // Korisnički ID je već dostupan u req.user.id zahvaljujući protect middleware-u
    const userId = req.user.id;

    // Proverite da li već postoji dokument UserDetails za trenutnog korisnika
    let userDetails = await UserDetails.findOne({ owner: userId });

    if (!userDetails) {
      // Ako ne postoji, kreirajte novi dokument UserDetails
      userDetails = new UserDetails({
        city,
        currentPlace,
        donjideo,
        gornjideo,
        kosa,
        obuca,
        oci,
        pol,
        owner: userId,
      });

      await userDetails.save();
    } else {
      // Ako postoji, ažurirajte postojeći dokument
      userDetails.city = city;
      userDetails.currentPlace = currentPlace;
      userDetails.donjideo = donjideo;
      userDetails.gornjideo = gornjideo;
      userDetails.kosa = kosa;
      userDetails.obuca = obuca;
      userDetails.oci = oci;
      userDetails.pol = pol;

      await userDetails.save();
    }

    res.status(200).json({ message: 'User details updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating user details.' });
  }
});

//=============================== UPLOAD PHOTO OF USER ==================================================

const uploadUserPhoto = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  const name = user.name.trim()

  try {
    const image = req.file; // slika iz zahteva, sačuvana pomoću multer-a

    if (!image) {
      // console.log("NEMA SLIKE")
      return res.status(400).json({ success: false, message: 'Niste poslali sliku.' });
    }

    // SAVING FILE (image) TO CLOUDINARY
    const uploadOptions = {
      //folder u cloudinary 
      folder: "User_Avatar",
      //cloud name
      upload_preset: 'hfmyjqhf',
      // da za svakog usera ubacije posebnu sliku/ i da overwrittuje za istog
      public_id: `${name} - avatar`,
      allowed_formats: ['png', 'jpg', 'jpeg', 'svg', 'ico', 'jfif', 'webp']
    };

    try {
      const result = await cloudinary.uploader.upload(image.path, uploadOptions);

      //ovde mogu da obrisem buffer , multer memorija slike u binarnom obliku nako save na cloudinary
      // Postavljanjem buffer-a na null
      req.file.buffer = null;
      // console.log(req.file.buffer)

      const fileData = {
        filePath: result.secure_url,
        fileSize: fileSizeFormatter(result.bytes),
      };

      if (fileData.filePath) {
        user.photo = fileData.filePath;
        await user.save();
      }
      return res.status(200).json({ success: true, message: 'Korisnik je uspešno ažuriran.', user });
    } catch (error) {
      console.error("Greška prilikom otpremanja slike na Cloudinary", error);
      res.status(500);
      throw new Error("Slika nije mogla da bude otpremljena");
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Došlo je do greške prilikom ažuriranja korisnika.', error });
  }
});

//=============================== UPDATE SOCIALS ==================================================

const updateSocials = asyncHandler(async (req, res) => {
  // return console.log("REQ", req.body)
  // hfmyjqhf
  const userId = req.user.id;
  const user = await User.findById(userId);
  try {
    const { facebookUrl, instagramUrl, phoneNumber } = req.body;

    if (facebookUrl) {
      user.facebookUrl = facebookUrl;
    }
    if (instagramUrl) {
      user.instagramUrl = instagramUrl;
    }
    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }

    await user.save();
    return res.status(200).json({ success: true, message: 'Korisnik je uspešno ažuriran.', user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Došlo je do greške prilikom ažuriranja korisnika.', error });
  }
});

//=============================== UPDATE TABLICE ==================================================

const updateTable = asyncHandler(async (req, res) => {
  // return console.log("TABLE ", req.body)
  // hfmyjqhf
  const userId = req.user.id;
  const user = await User.findById(userId);
  try {
    const { table } = req.body;

    if (table) {
      user.table = table;
    }

    // MORAM DA PROVERIM DA LI POSTOJE TE TABLE U BAZI
    // DA RADIM TRIM NA SVE OSIM BROJEVA I SLOVA
    // DA NAPISEM PORUKU AKO POSTOJE TAKVE TABLE , DA KONTAKTIRA TEHNICKU PODRSKU
    await user.save();
    return res.status(200).json({ success: true, message: 'Korisnik je uspešno ažuriran.', user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Došlo je do greške prilikom ažuriranja korisnika.', error });
  }
});

//=============================== SEARCH BY TABLE ==================================================

const searchByTable = asyncHandler(async (req, res) => {

  try {
    const { table } = req.body;
    // Trazenje korisnika koji imaju datu tablicu
    const usersWithTable = await User.find({ table });

    // Ako nema korisnika sa datom tablicom
    if (usersWithTable.length === 0) {
      return res.status(404).json({ success: false, message: 'Nema korisnika sa trazenom tablicom.' });
    }

    // Dodavanje is userdetails => user objektu i vracanje na front
    const usersWithDetails = await Promise.all(usersWithTable.map(async (user) => {
      const userDetails = await UserDetails.findOne({ owner: user._id });
      return {
        ...user._doc, // Sve osnovne informacije o korisniku
        currentPlace: userDetails.currentPlace, // Dodatne informacije
        city: userDetails.city,
      };
    }));

    // Ako ima korisnika sa datom tablicom, vratite ih kao niz u odgovoru
    return res.status(200).json({ success: true, users: usersWithDetails });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Došlo je do greške prilikom pretrage korisnika.', error });
  }
});


//=============================== SEARCH USER ==================================================

//DOBAR
// const searchUser = asyncHandler(async (req, res) => {
//   console.log('REQQQQQQQQ', req.body);

//   // Provera da li postoje city i currentPlace u req.body
//   const { city, currentPlace, ...otherParams } = req.body;
//   if (!city || !currentPlace) {
//     return res.status(400).json({ error: 'Grad i Mesto su obavezni parametri.' });
//   }
//   try {
//     // Konstruišite osnovni upit sa gradom i trenutnim mestom
//     const searchParams = { city, currentPlace };

//     // Dodajte ostale unete parametre koji postoje u UserDetails dokumentu
//     for (const key in otherParams) {
//       if (otherParams.hasOwnProperty(key)) {
//         searchParams[key] = otherParams[key];
//       }
//     }

//     // Upit prema userDetails kolekciji da bi se pronašli odgovarajući useri preko objekta koji dolazi iz searcha
//     const userDetails = await UserDetails.find(searchParams);

//     // Izvlacenje vlasnika (ownera) iz pronađenih userDetails dokumenata
//     const owners = userDetails.map(userDetail => userDetail.owner);

//     if (owners.length === 0) {
//       // Ako nema pronađenih korisnika, vraćamo odgovarajuću poruku sa statusom 404
//       console.log("NEMA KORISSNIKA")
//       return res.status(404).json({ message: 'Nema pronadjenih korisnika.' });
//     }

//     // Koriscenje vlasnika da bih pronašao odgovarajuće korisnike u user kolekciji
//     const users = await User.find({ _id: { $in: owners } });

//     // Vraca pronađene korisnika kao response
//     console.log("VRACENI USERRIIIIIIIIIII", users)
//     return res.status(200).json({ success: true, users });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: 'Došlo je do greške prilikom pretrage korisnika.', error });
//   }
// });

const searchUser = asyncHandler(async (req, res) => {
  console.log('REQQQQQQQQ', req.body);

  // Provera da li postoje city i currentPlace u req.body
  const { city, currentPlace, ...otherParams } = req.body;
  if (!city || !currentPlace) {
    return res.status(400).json({ error: 'Grad i Mesto su obavezni parametri.' });
  }
  try {
    // Konstruišite osnovni upit sa gradom i trenutnim mestom
    const searchParams = { city, currentPlace };

    // Upit prema userDetails kolekciji da bi se pronašli odgovarajući useri preko objekta koji dolazi iz searcha
    const userDetails = await UserDetails.find(searchParams);

    // Izvlacenje vlasnika (ownera) iz pronađenih userDetails dokumenata
    const owners = userDetails.map(userDetail => userDetail.owner);

    if (owners.length === 0) {
      // Ako nema pronađenih korisnika, vraćamo odgovarajuću poruku sa statusom 404
      console.log("NEMA KORISNIKA")
      return res.status(404).json({ message: 'Nema pronadjenih korisnika.' });
    }

    // Filter za proveru podudaranja parametara koji postoje u dokumentima UserDetails
    const filteredUsers = owners.filter(ownerId => {
      const userDetailsForOwner = userDetails.find(userDetail => userDetail.owner.toString() === ownerId.toString());

      for (const key in otherParams) {
        if (otherParams.hasOwnProperty(key)) {
          if (userDetailsForOwner[key] !== undefined && userDetailsForOwner[key] !== otherParams[key]) {
            return false;
          }
        }
      }

      return true;
    });

    if (filteredUsers.length === 0) {
      // Ako nema korisnika koji ispunjavaju uslov, vraćamo odgovarajuću poruku o grešci
      return res.status(404).json({ message: 'Nema korisnika koji ispunjavaju uslov.' });
    }

    // Koriscenje vlasnika da bih pronašao odgovarajuće korisnike u user kolekciji
    const users = await User.find({ _id: { $in: filteredUsers } });

    // Vraca pronađene korisnika kao response
    console.log("VRACENI USERRIIIIIIIIIII", users)
    return res.status(200).json({ success: true, users });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Došlo je do greške prilikom pretrage korisnika.', error });
  }
});

module.exports = {
  googleSignup,
  registerUser,
  loginUser,
  resetPassword,
  logout,
  verifyEmail,
  resetPasswordConfirm,
  updateUserDetails,
  uploadUserPhoto,
  updateSocials,
  updateTable,
  searchByTable,
  searchUser,
};

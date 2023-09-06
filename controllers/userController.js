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
const User = require("../models/userModel")
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
      // Other user fields...
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
      gender,
      hair,
      eyes,
      braces,
      shirt,
      pants,
      chest,
      sneakers,
      boots,
      sandal,
      city,
      place,
      bio,
    } = user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      //-------------------
      gender,
      hair,
      eyes,
      braces,
      shirt,
      pants,
      chest,
      sneakers,
      boots,
      sandal,
      city,
      place,
      //-------------------
      bio,
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
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
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

// ------------------ FORGOT PASSWORD SEND MAIL -----------------------------------------
// const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;
//   // if (!email) return res.status(400).json({ success: false, message: "Please provide a valid email!" });
//   if (!email) return sendError(res, "Please provide a valid email!");

//   // return res.send("USER")
//   // USER
//   const user = await User.findOne({ email })
//   // if (!user) return res.status(400).json({ success: false, message: "User not found, Invalid request!" });
//   if (!user) return sendError(res, "User not found, Invalid request!");;

//   // TOKEN
//   const token = await ResetToken.findOne({ owner: user._id });
//   // if (token) return res.status(400).json({ success: false, message: "Only after one hour you can request for another token!" });
//   if (token) return sendError(res, "Only after one hour you can request for another token!");

//   const randomBytes = await createRandomBytes()

//   const resetToken = new ResetToken({ owner: user._id, token: randomBytes })

//   await resetToken.save()

//   mailTransport().sendMail({
//     from: 'pepy90aa@gmail.com',
//     to: user.email,
//     subject: "Password Reset Email",
//     html: generatePasswordResetTemplate(
//       `http://192.168.0.13:4000/api/users/reset-password?token=${randomBytes}&id=${user._id}`
//     ),
//   });

//   res.json({ success: true, message: "Password reset link sent to your email" })
// });


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
  console.log("USERRRRRRRRRRRRRRRRRRRRR", req.body)

  try {
    const email = req.body.email.email
    const code = req.body.code
    const password = req.body.newPassword
    const user = await User.findOne({ email })

    console.log("USERRRRRRRRRRRRRRRRRRRRR", user)

    if (!user || user.
      resettoken !== code.toUpperCase()) {
      console.log("NIJE ISTO")
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

module.exports = {
  googleSignup,
  registerUser,
  loginUser,
  // forgotPassword,
  resetPassword,
  logout,
  verifyEmail,
  resetPasswordConfirm,
};

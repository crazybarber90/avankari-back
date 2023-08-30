const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const Token = require("../models/tokenModel");
// const crypto = require("crypto");
// const sendEmail = require("../utils/sendEmail");

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


// const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password, photo, googleSignIn ,accessToken } = req.body;
  
//   if (!name || !email) {
//     res.status(400);
//     throw new Error("Please provide name and email");
//   }

//   if (!googleSignIn) {
//     if (!password || password.length < 6) {
//       res.status(400);
//       throw new Error("Password must be at least 6 characters");
//     }

//     const userExist = await User.findOne({ email });
//     if (userExist) {
//       res.status(400);
//       throw new Error("Email is already registered");
//     }
//   }

//   const userFields = {
//     name,
//     email,
//     photo,
//   };

//   if (!googleSignIn) {
//     userFields.password = password;
//   }

//   const user = await User.create(userFields);

//   const token = generateToken(user._id);

//   res.cookie("token", token, {
//     path: "/",
//     httpOnly: true,
//     expires: new Date(Date.now() + 1000 * 86400),
//     sameSite: "none",
//     secure: true,
//   });

//   if (user) {
//     const {
//       _id,
//       name,
//       email,
//       photo,
//       phone,
//       gender,
//       hair,
//       eyes,
//       braces,
//       shirt,
//       pants,
//       chest,
//       sneakers,
//       boots,
//       sandal,
//       city,
//       place,
//       bio,
//     } = user;
//     res.status(201).json({
//       _id,
//       name,
//       email,
//       photo,
//       phone,
//       //-------------------
//       gender,
//       hair,
//       eyes,
//       braces,
//       shirt,
//       pants,
//       chest,
//       sneakers,
//       boots,
//       sandal,
//       city,
//       place,
//       //-------------------
//       bio,
//       token,
//     });
//   } else {
//     res.status(400);
//     throw new Error("Invalid user data");
//   }
// });


// const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password, photo, googleSignIn, accessToken } = req.body;

//   if (!name || !email) {
//     res.status(400);
//     throw new Error("Please provide name and email");
//   }

//   if (!googleSignIn) {
//     if (!password || password.length < 6) {
//       res.status(400);
//       throw new Error("Password must be at least 6 characters");
//     }

//     const userExist = await User.findOne({ email });
//     if (userExist) {
//       res.status(400);
//       throw new Error("Email is already registered");
//     }
//   }

//   const userFields = {
//     name,
//     email,
//     photo,
//   };

//   if (!googleSignIn) {
//     userFields.password = password;
//   }

//   const user = await User.create(userFields);
//   const token = generateToken(user._id);

//   res.cookie("token", token, {
//     path: "/",
//     httpOnly: true,
//     expires: new Date(Date.now() + 1000 * 86400),
//     sameSite: "none",
//     secure: true,
//   });

//   res.status(201).json({
//     _id: user._id,
//     name: user.name,
//     email: user.email,
//     photo: user.photo,
//     phone: user.phone,
//     gender: user.gender,
//     hair: user.hair,
//     eyes: user.eyes,
//     braces: user.braces,
//     shirt: user.shirt,
//     pants: user.pants,
//     chest: user.chest,
//     sneakers: user.sneakers,
//     boots: user.boots,
//     sandal: user.sandal,
//     city: user.city,
//     place: user.place,
//     bio: user.bio,
//     token,
//   });
// });




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
    expires: new Date(Date.now() + 1000 * 86400),
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

module.exports = {
  googleSignup,
  registerUser,
  loginUser,
  logout,
};

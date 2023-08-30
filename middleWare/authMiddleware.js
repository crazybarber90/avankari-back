const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(402);
      throw new Error("Not authorized, please login");
    }

    // VERIFY TOKEN
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // GET USER ID FROM TOKEN
    user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(402);
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(402);
    throw new Error("Not authorized, please login");
  }
});

module.exports = protect;

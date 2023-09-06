const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { sendError } = require("../Utils/helper");
const { isValidObjectId } = require("mongoose");
const User = require("../models/userModel");
const ResetToken = require("../models/resetToken");

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

const isResetTokenValid = asyncHandler(async (req, res, next) => {
  const { token, id } = req.query // get token and id from URL

  if (!token || !id) return sendError(res, "Invalid request!")

  if (!isValidObjectId(id)) return sendError(res, "Invalid User!")

  const user = await User.findById(id)
  if (!user) return sendError(res, "User not found!")

  const resetToken = await ResetToken.findOne({ owner: user._id })
  if (!resetToken) return sendError(res, "Reset token not found!")

  const isValid = await resetToken.compareToken(token)
  if (!isValid) return sendError(res, "Reset token is not valid!")

  req.user = user;
  next()

})

// module.exports = protect;


module.exports = {
  protect,
  isResetTokenValid,
};

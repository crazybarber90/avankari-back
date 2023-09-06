const express = require("express");
const router = express.Router();
// const protect = require("../middleWare/authMiddleware");

const {
  googleSignup,
  registerUser,
  loginUser,
  logout,
  verifyEmail,
  // forgotPassword,
  resetPassword,
  resetPasswordConfirm
} = require("../controllers/userController");
const { isResetTokenValid } = require("../middleWare/authMiddleware");

// WHEN WE CREATE ROUTE FILE , WE MUST REQUIRE THAT IN SERVER.JS

router.post("/googleSignUp", googleSignup);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.get("/logout", logout);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", isResetTokenValid, resetPassword);
router.post("/resetPassword", resetPassword);
router.post("/resetPasswordConfirm", resetPasswordConfirm);

module.exports = router;

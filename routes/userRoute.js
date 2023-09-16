const express = require("express");
const router = express.Router();

const {
  googleSignup,
  registerUser,
  loginUser,
  logout,
  verifyEmail,
  resetPassword,
  resetPasswordConfirm,
  updateUserDetails,
  uploadUserPhoto,
  updateSocials
} = require("../controllers/userController");

const { protect } = require("../middleWare/authMiddleware");
const { upload } = require("../Utils/fileUpload");
// WHEN WE CREATE ROUTE FILE , WE MUST REQUIRE THAT IN SERVER.JS

router.post("/googleSignUp", googleSignup);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.get("/logout", logout);

router.post("/resetPassword", resetPassword);
router.post("/resetPasswordConfirm", resetPasswordConfirm);
router.post("/update-user", protect, updateUserDetails);
// adding photo, and social networks
router.put("/upload-user-photo", protect, upload.single("image"), uploadUserPhoto);
router.post("/update-socials", protect, updateSocials);

module.exports = router;

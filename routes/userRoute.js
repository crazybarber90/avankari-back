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
  updateSocials,
  updateTable,
  searchByTable,
  searchUser,
  SendSupportEmail,
  removeNetworks,
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
router.post("/update-table", protect, updateTable);

//SEARCH
router.post("/search-by-table", protect, searchByTable);
router.post("/search-user", protect, searchUser);
router.post("/remove-networks", protect, removeNetworks);

//SEND MAIL TO ADMIN
router.post("/send-support-email", protect, SendSupportEmail);


module.exports = router;

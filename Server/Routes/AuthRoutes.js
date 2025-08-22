const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const { protect } = require("../Middleware/AuthMiddleware");
const {
  login,
  register,
  getAllUsers,
  updateUser,
  deleteUser,
  updateProfileImage,
  getProfileImage,
  logout,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);
router.post("/logout", protect, logout);
router.get("/users", getAllUsers);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);
router.put("/profile/image", protect, upload.single("image"), updateProfileImage);
router.get("/image/:filename", getProfileImage);

module.exports = router;

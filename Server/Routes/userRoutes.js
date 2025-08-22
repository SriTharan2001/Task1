const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const { protect } = require("../Middleware/AuthMiddleware");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfileImage,
  getProfileImage,
} = require("../controllers/authController");

// User CRUD routes
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

// Profile image routes
router.put("/profile-image", protect, upload.single("profileImage"), updateProfileImage);
router.get("/profile-image/:filename", getProfileImage);

module.exports = router;

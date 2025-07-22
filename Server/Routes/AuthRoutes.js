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
} = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/profile/image", protect, upload.single("image"), updateProfileImage);

// ✅ Get image
router.get("/image/:filename", getProfileImage);

module.exports = router;

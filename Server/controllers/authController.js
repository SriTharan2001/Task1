const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const { getGFS } = require("../config/db"); // ✅ gfs access

let gfs;
const conn = mongoose.connection;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Register
exports.register = async (req, res) => {
  const { email, password, role, userName } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashed, role, userName });
    await user.save();

    res.json({ user: { ...user.toObject(), id: user._id }, message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login
// controllers/authController.js (or similar)

 // Adjust the path as needed

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    if (role && user.role !== role)
      return res.status(403).json({ success: false, message: "Role mismatch" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        userId: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        picture: user.picture || null, // ✅ send profile pic
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Serve profile image
exports.getProfileImage = (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "../uploads", filename);
  res.sendFile(imagePath);
};


// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
  res.status(200).json({ message: "Password reset request received" });
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("userName email role _id");
    res.json(users.map((user) => ({ ...user.toObject(), id: user._id })));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  const { userName, email, password, role } = req.body;
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.userName = userName || user.userName;
    user.email = email || user.email;
    user.role = role || user.role;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile image
exports.updateProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    user.picture = req.file.filename;
    await user.save();

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Image upload failed" });
  }
};

// Get profile image
exports.getProfileImage = async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../uploads", filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Image not found" });
  }
  res.sendFile(filePath);
};

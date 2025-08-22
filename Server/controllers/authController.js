const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const { getGFS } = require("../config/db"); // ✅ gfs access
const ActiveSession = require("../Models/ActiveSession");
const SessionLog = require("../Models/SessionLog");
const UAParser = require("ua-parser-js");

let gfs;
const conn = mongoose.connection;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Register - TC001, TC002, TC003
exports.register = async (req, res) => {
  const { email, password, role, userName } = req.body;
  
  // TC003: Validate required fields
  if (!email || !password || !role || !userName) {
    return res.status(400).json({ 
      message: "Missing required fields: email, password, role, and userName are required" 
    });
  }
  
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      // TC002: Return 400 for duplicate email
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, role, userName });
    await user.save();

    // TC001: Return 201 Created with proper response format
    res.status(201).json({
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
      message: "User created successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login
// controllers/authController.js (or similar)
// Add this model:

exports.login = async (req, res) => {
  const { email, password, role, browser } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (user.role !== role)
      return res.status(403).json({ success: false, message: "Unauthorized role" });

    // 🔥 Remove any existing active sessions for this user
    await ActiveSession.deleteMany({ userId: user._id });

    // ✅ Generate new token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 💾 Save new active session
    await ActiveSession.create({ userId: user._id, token });

    // 🧠 Update user's last login and browser info
    user.sessionToken = token;
    user.lastLogin = new Date();
    user.browserInfo = browser;
    await user.save();

    return res.json({
      success: true,
      token,
      user: {
        userName: user.userName,
        email: user.email,
        role: user.role,
        userId: user._id,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
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

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ ...user.toObject(), id: user._id });
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
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" }); // ✅ matches TC012
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// Update profile image
exports.updateProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file)
      return res.status(400).json({ message: "No image uploaded" });

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

exports.logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ success: false, message: "No token found" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Remove all sessions for safety
    await ActiveSession.deleteMany({ userId: decoded.userId });

    // ✅ Clear browser info properly
    await User.findByIdAndUpdate(decoded.userId, {
      $set: { browserInfo: null, lastLogin: null },
    });

    // ✅ Mark logout in session log
    await SessionLog.updateMany(
      { userId: decoded.userId, logoutTime: null },
      { $set: { logoutTime: new Date() } }
    );

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

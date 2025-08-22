const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "Admin", "Manager", "Viewer"],
    default: "user",
  },
  picture: { type: String },
  sessionToken: { type: String, default: null },
  lastLogin: { type: Date },
  browserInfo: { type: String }, // Store "Chrome", "Firefox", etc.
});

module.exports = mongoose.model("User", userSchema);

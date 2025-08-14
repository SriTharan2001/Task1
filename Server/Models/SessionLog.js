const mongoose = require("mongoose");

const sessionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  ip: String,
  device: String,
  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date, default: null },
});

module.exports = mongoose.model("SessionLog", sessionLogSchema);

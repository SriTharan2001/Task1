const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const ActiveSession = require("../Models/ActiveSession");

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Check that token is active
    const active = await ActiveSession.findOne({
      userId: decoded.userId,
      token,
    });

    if (!active) {
      return res.status(401).json({ message: "Session expired or logged in elsewhere" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
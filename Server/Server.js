const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// ✅ Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger (optional)
// ... your Swagger config remains

// Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use("/api/auth", require("./Routes/AuthRoutes.js"));
app.use("/api/auth", require("./Routes/passwordResetRoute.js"));
app.use("/api/expenses", require("./Routes/expenseRoutes.js"));
app.use("/api/summary", require("./Routes/summaryRoutes.js"));

// Serve React frontend
app.use(express.static(path.join(__dirname, "../Client")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/index.html"));
});

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

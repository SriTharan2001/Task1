const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

// DB Connection
const connectDB = require("./config/db.js");
// Only connect to DB if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS + Body Parser + Session
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

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TypeScreept API",
      version: "1.0.0",
      description: "API Documentation for your React + Node.js Project",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./Routes/*.js"], // Point to your route files with Swagger comments
};
 
const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Socket.IO setup
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
app.use("/api/users", require("./Routes/userRoutes.js"));
app.use("/api/expenses", require("./Routes/expenseRoutes.js"));
app.use("/api/summary", require("./Routes/summaryRoutes.js"));

// Serve React frontend (in production or development)
app.use(express.static(path.join(__dirname, "../Client")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/index.html"));
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📘 Swagger docs at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;

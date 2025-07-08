
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

// Swagger packages
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: "your-secret-key", // Use a strong, random secret in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense Tracker API",
      version: "1.0.0",
      description: "API documentation for Expense Tracker backend",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
        },
      },
    },
  },
  apis: ["./Routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../Client")));

// Attach io to req
const http = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(http, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use("/api/expenses", require("./Routes/expenseRoutes"));
app.use("/api/summary", require("./Routes/summaryRoutes"));
app.use("/api/auth", require("./Routes/AuthRoutes"));
app.use("/api/auth", require("./Routes/passwordResetRoute"));

// app.js or server.js
const expenseRoutes = require('./Routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);
app.use('./api/daily' , require('./Routes/expenseRoutes.js'));
app.use('./api/monthly' , require('./Routes/expenseRoutes.js'));
app.use('./api/total' , require('./Routes/expenseRoutes.js'));

// Catch-all to serve React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/index.html"));
});

// Start server
http.listen(PORT, () => {
  console.log(`✅ Server with Socket.IO running on port ${PORT}`);
});

// Optional: Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("🔌 Client connected via Socket.IO");

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected");
  });
});
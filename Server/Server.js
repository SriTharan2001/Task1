// const express = require("express");
// const cors = require("cors");
// const session = require('express-session');
// const connectDB = require("./config/db");
// const path = require("path"); // Import the path module
// const { login, validateToken } = require("./controllers/LoginController");

// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// connectDB();
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Your React app's URL
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
// app.use(express.json());

// // Session middleware
// app.use(session({
//   secret: 'your-secret-key', // Replace with a strong, random secret
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // Set to true in production if using HTTPS
// }));

// // Serve static files from the React app
// app.use(express.static(path.join(__dirname, "../Client")));

// // Routes
// app.use("/api/expenses", require("./Routes/expenseRoutes"));
// app.use("/api/summary", require("./Routes/summaryRoutes"));
// // ...existing code...
// app.use("/api/auth", require("./Routes/AuthRoutes"));
// // ...existing code...
// app.use("/api/auth", require("./Routes/passwordResetRoute"));

// // The "catchall" handler: for any request that doesn't
// // match one above, send back React's index.html file.
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../Client/index.html"));
// });
// app.get("/api/expenses", async (req, res) => {
//   const userId = req.user?.id; // இதுதான் முக்கியம்
//   if (!userId) return res.status(400).json({ error: "User ID not found" });

//   const expenses = await Expense.find({ userId });
//   res.json(expenses);
// });

// const server = app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
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

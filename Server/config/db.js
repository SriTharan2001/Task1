const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
require("dotenv").config();

let gfs;

const connectDB = async () => {
  try {
const conn = await mongoose.connect(process.env.MONGO_URI, {
    });

    console.log("✅ MongoDB Connected");

    mongoose.connection.once("open", () => {
      gfs = Grid(mongoose.connection.db, mongoose.mongo);
      gfs.collection("uploads");
      console.log("✅ GridFS Initialized");
    });

  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

// ✅ Default export should only be connectDB
module.exports = connectDB;

// ✅ Export gfs separately if needed
module.exports.getGFS = () => gfs;

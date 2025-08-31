const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.info("MongoDB reconnected");
    });
  } catch (error) {
    console.error("Initial MongoDB connection error:", error);
    process.exit(1); // Exit the app if initial connection fails
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carepulse_hms';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning]: Could not connect to MongoDB at ${mongoURI} (${error.message}).`);
    console.warn(`[HMS Notice]: Ensure MongoDB is running on your system or provide a valid MONGODB_URI in BACKEND/.env (e.g. MongoDB Atlas).`);
    return false;
  }
};

module.exports = connectDB;

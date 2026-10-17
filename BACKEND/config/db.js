const mongoose = require('mongoose');

const RETRY_DELAY_MS = 15000;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carepulse_hms';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return true;
  } catch (error) {
    // Log only the host: the full URI contains the database password
    const host = mongoURI.replace(/^mongodb(\+srv)?:\/\/([^@]*@)?/, '').split('/')[0];
    console.warn(`[MongoDB Warning]: Could not connect to MongoDB at ${host} (${error.message}).`);
    console.warn(`[HMS Notice]: Ensure MongoDB is running on your system or provide a valid MONGODB_URI in BACKEND/.env (e.g. MongoDB Atlas).`);
    return false;
  }
};

/**
 * Keep retrying until the database is reachable (e.g. Atlas IP access list still
 * propagating), then run onConnected once. The HTTP server keeps running meanwhile.
 */
const connectWithRetry = async (onConnected) => {
  while (!(await connectDB())) {
    console.warn(`[HMS Notice]: Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
  if (onConnected) await onConnected();
};

module.exports = connectDB;
module.exports.connectWithRetry = connectWithRetry;

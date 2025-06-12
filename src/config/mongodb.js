const mongoose = require('mongoose');
const env = require('./env'); // Import centralized env

// MONGODB_URI is now accessed via env.MONGODB_URI
// The check for MONGODB_URI is now done in env.js, so it can be removed from here.
// if (!env.MONGODB_URI) {
//   console.error('FATAL ERROR: MONGODB_URI environment variable is not set.');
//   throw new Error('FATAL ERROR: MONGODB_URI environment variable is not set.');
// }

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      // Modern Mongoose versions have good defaults,
      // but you can add options here if needed, e.g.:
      // useNewUrlParser: true, // Not needed in Mongoose 6+
      // useUnifiedTopology: true, // Not needed in Mongoose 6+
      // serverSelectionTimeoutMS: 5000, // Example: Timeout after 5s instead of 30s
    });
    console.log('MongoDB Connected Successfully.');

    // Listen for Mongoose connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error after initial connect:', err);
      // Depending on the error, you might want to implement more robust handling
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected.');
      // Optionally, you could try to reconnect here or alert administrators
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    console.error('Application will now exit.');
    throw new Error(`Failed to connect to MongoDB: ${err.message}`); // Exit process on initial connection failure
  }
};

module.exports = connectDB;

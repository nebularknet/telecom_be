const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI environment variable is not set.');
  process.exit(1); // Exit if URI is not set
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
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
    process.exit(1); // Exit process on initial connection failure
  }
};

module.exports = connectDB;

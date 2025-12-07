const mongoose = require("mongoose");
require("dotenv").config();

/**
 * MongoDB connection configuration
 * @notice Configures and manages MongoDB connection via Mongoose
 * @dev Uses mongoose for database operations
 */
let connectionStatus = 0; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting

/**
 * Establishes MongoDB connection
 * @dev Initializes provider, wallet and contract instances
 * 
 * Required environment variables:
 * - MONGODB_URI: MongoDB connection URI (e.g., mongodb://localhost:27017/done_food_delivery)
 * 
 * @returns {Promise<void>} Promise that resolves when connection is established
 */
async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected");
      return;
    }

    connectionStatus = 2;

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);

    mongoose.connection.on('connected', () => {
      connectionStatus = 1;
      console.log(`MongoDB connected successfully to: ${mongoose.connection.host}`);
      console.log(`Database: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      connectionStatus = 0;
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on('disconnected', () => {
      connectionStatus = 0;
      console.log("MongoDB disconnected");
    });

    process.on('SIGINT', async () => {
      await disconnectDB();
      process.exit(0);
    });

  } catch (error) {
    connectionStatus = 0;
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

/**
 * Closes MongoDB connection properly
 * @dev Used during application shutdown to close connection gracefully
 * 
 * @returns {Promise<void>} Promise that resolves when connection is closed
 */
async function disconnectDB() {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log("MongoDB already disconnected");
      return;
    }

    connectionStatus = 3;

    await mongoose.connection.close();

    connectionStatus = 0;

    console.log("MongoDB disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
}

/**
 * Gets current connection status
 * @dev Possible states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
 * 
 * @returns {number} Connection state (0, 1, 2, or 3)
 */
function getConnectionStatus() {
  return mongoose.connection.readyState;
}

/**
 * Checks if MongoDB is connected
 * @returns {boolean} True if connected (readyState === 1), false otherwise
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Gets mongoose instance
 * @returns {Object} Mongoose instance
 */
function getMongoose() {
  return mongoose;
}

/**
 * Gets mongoose connection
 * @returns {Object} Mongoose connection object
 */
function getConnection() {
  return mongoose.connection;
}

/**
 * Gets database name
 * @returns {string} Database name
 */
function getDatabaseName() {
  return mongoose.connection.name;
}

/**
 * Gets connection URI (password masked)
 * @returns {string} Masked URI
 */
function getConnectionURI() {
  const uri = process.env.MONGODB_URI || "";
  return uri.replace(/:[^:@]+@/, ":****@");
}

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  isConnected,
  getMongoose,
  getConnection,
  getDatabaseName,
  getConnectionURI,
  mongoose
};

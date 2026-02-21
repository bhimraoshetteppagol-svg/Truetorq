// MongoDB Connection Configuration
// This file establishes a connection to MongoDB
// DO NOT import this in frontend components - this is for backend use only

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://admin:admin@evolutionapi.ipbubyl.mongodb.net/?appName=EvolutionAPI';

let isConnected = false;

/**
 * Connects to MongoDB database
 * @returns Promise<void>
 */
export const connectToMongoDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      // MongoDB connection options
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    isConnected = true;
    console.log('✅ Successfully connected to MongoDB');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    isConnected = false;
    throw error;
  }
};

/**
 * Disconnects from MongoDB database
 * @returns Promise<void>
 */
export const disconnectFromMongoDB = async (): Promise<void> => {
  if (!isConnected) {
    console.log('MongoDB is not connected');
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Gets the current connection status
 * @returns boolean
 */
export const getConnectionStatus = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};

// Export mongoose for schema definitions
export { mongoose };



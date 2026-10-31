import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Robust resolution of the root .env file regardless of current working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Helper to mask sensitive credentials in connection string for logging
 */
const maskMongoUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
};

/**
 * Connect to MongoDB database with Mongoose
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('====================================================');
      console.error('[MongoDB Error] Neither MONGODB_URI nor MONGO_URI was found in the root .env file.');
      console.error('Please configure your MongoDB connection string in .env and try again.');
      console.error('====================================================');
      process.exit(1);
    }

    console.log(`[MongoDB] Connecting to: ${maskMongoUri(mongoUri)}`);
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

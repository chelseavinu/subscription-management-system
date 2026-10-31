const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/brightloop_subscriptions';
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'brightloop_subscriptions'
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    console.warn(`[Database Warning] Running in offline or local mode. Please verify your MONGODB_URI in .env`);
  }
};

module.exports = connectDB;

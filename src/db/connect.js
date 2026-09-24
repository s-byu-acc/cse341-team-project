import mongoose from 'mongoose';

let isConnected = false;

const connectToDb = async (options = {}) => {
  // Return existing connection if already connected
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection.db;
  }

  const connectionString = options.connectionString || process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error('MONGODB_URI is required in your environment variables.');
  }

  // Set database name (kizuna-rail-db)
  const dbName = process.env.MONGODB_DB_NAME || 'kizuna-rail-db';

  // Connect cleanly using Mongoose
  await mongoose.connect(connectionString, {
    dbName: dbName,
  });

  isConnected = true;
  console.log(`Connected to database: ${mongoose.connection.name}`);
  return mongoose.connection.db;
};

const getDb = () => {
  if (!isConnected && mongoose.connection.readyState !== 1) {
    throw new Error('Database not initialized. Call connectToDb first.');
  }
  return mongoose.connection.db;
};

const closeDb = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
};

export { closeDb, connectToDb, getDb };
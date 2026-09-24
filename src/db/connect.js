import mongoose from 'mongoose';

const connectToDb = async (options = {}) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.db;
  }

  const connectionString = options.connectionString || process.env.MONGODB_URI;
  const databaseName = options.databaseName || process.env.MONGODB_DB_NAME || 'trips';

  if (!connectionString) {
    throw new Error('MONGODB_URI is required.');
  }

  await mongoose.connect(connectionString, { dbName: databaseName });
  return mongoose.connection.db;
};

const getDb = () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new Error('Database not initialized. Call connectToDb first.');
  }
  return mongoose.connection.db;
};

const closeDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export { closeDb, connectToDb, getDb };

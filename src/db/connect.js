import mongoose from 'mongoose';

const connectToDb = async (options = {}) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.db;
  }

  const connectionString = options.connectionString || process.env.MONGODB_URI;
  const databaseName = options.databaseName || process.env.MONGODB_DB_NAME || 'kizuna-rail-db';

  if (!connectionString) {
    throw new Error('MONGODB_URI is required.');
  }

  try {
    await mongoose.connect(connectionString, {
      dbName: databaseName,
      serverSelectionTimeoutMS: 10000
    });
    console.log(`Connected to MongoDB database "${databaseName}".`);
    return mongoose.connection.db;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw new Error('Unable to connect to MongoDB. Check the MongoDB URI and server availability.');
  }
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

import mongoose from 'mongoose';
import TicketClass from './schemas/ticket-classes.js';

let connectionPromise;

const connectToMongo = async () => {
  if (mongoose.connection.readyState === 1) return;

  connectionPromise ??= mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || 'practice'
  });

  await connectionPromise;
};

export async function getAllTicketClasses() {
  await connectToMongo();
  return TicketClass.find().lean().exec();
}

export async function getTicketClassesForDay(day) {
  await connectToMongo();
  return TicketClass.find({ availableDays: day.toLowerCase() }).lean().exec();
}
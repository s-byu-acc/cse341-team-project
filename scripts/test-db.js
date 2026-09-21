import { closeDb, connectToDb } from '../src/db/connect.js';

try {
  const db = await connectToDb();
  await db.command({ ping: 1 });
  console.log(`MongoDB connection succeeded: ${db.databaseName}`);
} catch (error) {
  console.error(`MongoDB connection failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await closeDb();
}
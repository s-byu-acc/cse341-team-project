import app from './app.js';
import { connectToDb } from './src/db/connect.js';

/**
 * Declare Important Variables
 */
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

/**
 * Configure Express middleware
 */

// Start Database and Server
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectToDb();
    console.log('✓ Successfully connected to MongoDB');

    // 2. Start WebSocket Server in Development Mode (Live reload)
    if (NODE_ENV.includes('dev')) {
      const ws = await import('ws');
      try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });
        wsServer.on('listening', () => console.log(`WebSocket running on port ${wsPort}`));
      } catch (wsErr) {
        console.error('WebSocket error:', wsErr);
      }
    }

    // 3. Start Express Application
    app.listen(PORT, () => {
      console.log(`Server running at http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();

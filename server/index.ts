import dotenv from 'dotenv';
import { createApp } from './app';
import { initDatabase } from './db';

// Load environment variables (.env)
dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

async function bootstrap() {
  console.log('⚡ Starting standalone Scudrop Backend Server...');

  // Initialize Database connection (MongoDB with fallback to local JSON storage)
  await initDatabase();

  const app = createApp();

  app.listen(PORT, HOST, () => {
    console.log(`✅ Standalone Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📂 Uploaded files: http://localhost:${PORT}/uploads/`);
  });
}

bootstrap().catch((error) => {
  console.error('❌ Standalone backend failed to start:', error);
  process.exit(1);
});

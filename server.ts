import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/app';
import { initDatabase } from './server/db';

dotenv.config();

/**
 * Root Server Entry Point
 * Mounts the standalone Express app and integrates Vite middleware in development
 * or serves the compiled frontend in production on container port 3000.
 */
async function start() {
  const PORT = 3000;

  // Initialize backend database (MongoDB or local JSON storage)
  await initDatabase();

  // Create standalone backend Express instance
  const app = createApp();

  // Frontend Serving (Vite middleware in dev, static files in production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Scudrop Dev Server running:`);
    console.log(`   ➜ Local:   http://localhost:${PORT}`);
    console.log(`   ➜ Network: http://127.0.0.1:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start unified server:', err);
  process.exit(1);
});

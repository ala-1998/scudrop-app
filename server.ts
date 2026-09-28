import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/app';
import { initDatabase } from './server/db';

dotenv.config();

/**
 * Root Server Entry Point
 * Handles dynamic PORT binding for cloud hosts like Render
 * and gracefully serves API routes when frontend is hosted separately on Vercel.
 */
async function start() {
  // Prise en compte dynamique du port de Render (process.env.PORT) avec fallback sur 3000
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Initialize backend database (MongoDB or local JSON storage)
  await initDatabase();

  // Create standalone backend Express instance
  const app = createApp();

  // Frontend Serving (Vite middleware in dev, static files in production IF dist exists)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Vérification de l'existence du dossier dist pour éviter l'erreur ENOENT sur Render
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      // Endpoint de fallback quand le Backend tourne en mode API seule
      app.get('/', (_req, res) => {
        res.json({ status: 'ok', message: 'Scudrop Backend API is running' });
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Scudrop Server running on port ${PORT}:`);
    console.log(`   ➜ Local:   http://localhost:${PORT}`);
    console.log(`   ➜ Network: http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { orderRouter } from './routes/orderRoutes';
import { expenseRouter } from './routes/expenseRoutes';
import { statsRouter } from './routes/statsRoutes';
import { authRouter } from './routes/authRoutes';

/**
 * Creates and configures the standalone Express Application.
 * This can be run independently (via server/index.ts) or integrated
 * with Vite development middleware (via root server.ts).
 */
export function createApp(): Express {
  const app = express();

  // Ensure uploads directory exists for order proof screenshots
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Cross-Origin Resource Sharing (CORS)
  // Allows the separate frontend (e.g. Vercel, Netlify, localhost:5173) to call this backend
  const clientUrl = process.env.CLIENT_URL;
  app.use(
    cors({
      origin: clientUrl ? [clientUrl, 'http://localhost:5173', 'http://localhost:3000'] : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body Parsing Middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Static Assets (Uploaded Proof Images)
  app.use('/uploads', express.static(uploadsDir));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Scudrop FR API',
      timestamp: new Date().toISOString(),
      architecture: 'standalone-backend',
    });
  });

  // Business Logic API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/expenses', expenseRouter);
  app.use('/api/stats', statsRouter);

  return app;
}

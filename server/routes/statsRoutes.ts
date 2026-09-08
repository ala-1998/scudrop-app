import { Router, Request, Response } from 'express';
import { dbService } from '../db';

export const statsRouter = Router();

// GET global KPIs and aggregated Clients Overview
statsRouter.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const analytics = await dbService.getDashboardAnalytics();
    res.json(analytics);
  } catch (err: any) {
    console.error('Erreur analytique dashboard:', err);
    res.status(500).json({ error: err.message || 'Erreur calcul des statistiques' });
  }
});

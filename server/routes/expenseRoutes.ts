import { Router, Request, Response } from 'express';
import { dbService } from '../db';

export const expenseRouter = Router();

// GET all expenses
expenseRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const expenses = await dbService.getExpenses();
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erreur récupération frais' });
  }
});

// POST create expense
expenseRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { reference, description, amountEuro, exchangeRate, date } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'La description du frais est requise.' });
    }

    const created = await dbService.createExpense({
      reference,
      description,
      amountEuro,
      exchangeRate,
      date,
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erreur création frais' });
  }
});

// PUT update expense
expenseRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { reference, description, amountEuro, exchangeRate, date } = req.body;
    const updated = await dbService.updateExpense(req.params.id, {
      reference,
      description,
      amountEuro,
      exchangeRate,
      date,
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erreur mise à jour frais' });
  }
});

// DELETE expense
expenseRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await dbService.deleteExpense(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Frais introuvable' });
    }
    res.json({ message: 'Frais supprimé avec succès' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erreur suppression frais' });
  }
});

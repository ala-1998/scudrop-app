import { Router, Request, Response } from 'express';
import { dbService } from '../db';
import { upload } from '../upload';

export const orderRouter = Router();

// GET all orders
orderRouter.get('/', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const search = req.query.search as string;
    const orders = await dbService.getOrders({ status, search });
    res.json(orders);
  } catch (err: any) {
    console.error('Erreur récupération commandes:', err);
    res.status(500).json({ error: err.message || 'Erreur interne' });
  }
});

// GET single order
orderRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await dbService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erreur interne' });
  }
});

// POST create order (with Multer screenshot file upload)
orderRouter.post('/', upload.single('screenshot'), async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.clientName || !body.phoneNumber) {
      return res.status(400).json({ error: 'Le nom du client et le numéro de téléphone sont requis.' });
    }

    let screenshotUrl = body.screenshot || '';
    if (req.file) {
      screenshotUrl = `/uploads/${req.file.filename}`;
    }

    const created = await dbService.createOrder({
      clientName: body.clientName,
      phoneNumber: body.phoneNumber,
      description: body.description,
      reference: body.reference,
      orderDate: body.orderDate,
      screenshot: screenshotUrl,
      invoicedPriceForeign: body.invoicedPriceForeign,
      invoicedPriceRate: body.invoicedPriceRate,
      spentPriceForeign: body.spentPriceForeign,
      spentPriceRate: body.spentPriceRate,
      transportForeign: body.transportForeign,
      transportRate: body.transportRate,
      advanceTND: body.advanceTND,
      deliveryStatus: body.deliveryStatus,
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error('Erreur création commande:', err);
    res.status(500).json({ error: err.message || 'Erreur création commande' });
  }
});

// PUT update order
orderRouter.put('/:id', upload.single('screenshot'), async (req: Request, res: Response) => {
  try {
    const body = req.body;
    let screenshotUrl = body.screenshot;
    if (req.file) {
      screenshotUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await dbService.updateOrder(req.params.id, {
      clientName: body.clientName,
      phoneNumber: body.phoneNumber,
      description: body.description,
      reference: body.reference,
      orderDate: body.orderDate,
      screenshot: screenshotUrl,
      invoicedPriceForeign: body.invoicedPriceForeign,
      invoicedPriceRate: body.invoicedPriceRate,
      spentPriceForeign: body.spentPriceForeign,
      spentPriceRate: body.spentPriceRate,
      transportForeign: body.transportForeign,
      transportRate: body.transportRate,
      advanceTND: body.advanceTND,
      deliveryStatus: body.deliveryStatus,
    });

    res.json(updated);
  } catch (err: any) {
    console.error('Erreur mise à jour commande:', err);
    res.status(500).json({ error: err.message || 'Erreur mise à jour commande' });
  }
});

// PATCH toggle delivery status
orderRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['En cours de livraison', 'Livré'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    const updated = await dbService.updateOrder(req.params.id, { deliveryStatus: status });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erreur changement statut' });
  }
});

// DELETE order
orderRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await dbService.deleteOrder(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    res.json({ message: 'Commande supprimée avec succès' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erreur suppression commande' });
  }
});

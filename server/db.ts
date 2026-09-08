import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { OrderModel, IOrder } from './models/Order';
import { ExpenseModel, IExpense } from './models/Expense';

export interface OrderInput {
  clientName: string;
  phoneNumber: string;
  description?: string;
  reference?: string;
  orderDate?: string | Date;
  screenshot?: string;
  invoicedPriceForeign?: number | string;
  invoicedPriceRate?: number | string;
  spentPriceForeign?: number | string;
  spentPriceRate?: number | string;
  transportForeign?: number | string;
  transportRate?: number | string;
  advanceTND?: number | string;
  deliveryStatus?: 'En cours de livraison' | 'Livré';
}

export interface ExpenseInput {
  description: string;
  amountEuro?: number | string;
  exchangeRate?: number | string;
  date?: string | Date;
}

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'scudrop-db.json');

interface LocalDbSchema {
  orders: Array<{
    _id: string;
    clientName: string;
    phoneNumber: string;
    description: string;
    reference: string;
    orderDate: string;
    screenshot: string;
    invoicedPriceForeign: number;
    invoicedPriceRate: number;
    invoicedPriceTND: number;
    spentPriceForeign: number;
    spentPriceRate: number;
    spentPriceTND: number;
    transportForeign: number;
    transportRate: number;
    transportTND: number;
    advanceTND: number;
    remainingTND: number;
    gainTND: number;
    deliveryStatus: 'En cours de livraison' | 'Livré';
    createdAt: string;
    updatedAt: string;
  }>;
  expenses: Array<{
    _id: string;
    description: string;
    amountEuro: number;
    exchangeRate: number;
    amountTND: number;
    date: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

let isMongoConnected = false;

export async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      console.log('Tentative de connexion à MongoDB...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      isMongoConnected = true;
      console.log('Connecté avec succès à MongoDB via Mongoose!');
      await seedMongoIfEmpty();
      return;
    } catch (err) {
      console.warn('MongoDB non joignable, basculement automatique sur le stockage local persistant:', (err as Error).message);
    }
  } else {
    console.log('Aucun MONGODB_URI spécifié. Mode autonome persistant actif.');
  }

  // Local file-based storage initialization
  initLocalDb();
}

function calculateOrderFields(input: Partial<OrderInput>) {
  const invForeign = Number(input.invoicedPriceForeign) || 0;
  const invRate = Number(input.invoicedPriceRate) || 3.35;
  const invTND = Number((invForeign * invRate).toFixed(3));

  const spentForeign = Number(input.spentPriceForeign) || 0;
  const spentRate = Number(input.spentPriceRate) || 3.35;
  const spentTND = Number((spentForeign * spentRate).toFixed(3));

  const transForeign = Number(input.transportForeign) || 0;
  const transRate = Number(input.transportRate) || 3.35;
  const transTND = Number((transForeign * transRate).toFixed(3));

  const adv = Number(input.advanceTND) || 0;
  const advanceTND = Number(adv.toFixed(3));
  const totalBilled = Number((invTND + transTND).toFixed(3));
  const remainingTND = Number(Math.max(0, totalBilled - advanceTND).toFixed(3));

  const gainTND = Number((invTND + transTND - spentTND).toFixed(3));

  return {
    invoicedPriceForeign: invForeign,
    invoicedPriceRate: invRate,
    invoicedPriceTND: invTND,
    spentPriceForeign: spentForeign,
    spentPriceRate: spentRate,
    spentPriceTND: spentTND,
    transportForeign: transForeign,
    transportRate: transRate,
    transportTND: transTND,
    advanceTND,
    remainingTND,
    gainTND,
  };
}

function calculateExpenseFields(input: Partial<ExpenseInput>) {
  const euro = Number(input.amountEuro) || 0;
  const rate = Number(input.exchangeRate) || 3.35;
  const amountTND = Number((euro * rate).toFixed(3));
  return {
    amountEuro: euro,
    exchangeRate: rate,
    amountTND,
  };
}

function readLocalDb(): LocalDbSchema {
  if (!fs.existsSync(dbFilePath)) {
    initLocalDb();
  }
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(raw) as LocalDbSchema;
  } catch (err) {
    console.error('Erreur lecture DB locale, réinitialisation:', err);
    return initLocalDb();
  }
}

function writeLocalDb(data: LocalDbSchema) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

function initLocalDb(): LocalDbSchema {
  if (fs.existsSync(dbFilePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
      if (existing.orders && existing.expenses) {
        return existing;
      }
    } catch {
      // re-seed
    }
  }

  const initialData: LocalDbSchema = {
    orders: [
      {
        _id: 'ord_101',
        clientName: 'Karim Ben Salem',
        phoneNumber: '+216 98 450 123',
        description: 'Vêtements & Baskets Zara / Nike',
        reference: 'CMD-2026-001',
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        screenshot: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        invoicedPriceForeign: 240,
        invoicedPriceRate: 3.35,
        invoicedPriceTND: 804.0,
        spentPriceForeign: 175,
        spentPriceRate: 3.35,
        spentPriceTND: 586.25,
        transportForeign: 30,
        transportRate: 3.35,
        transportTND: 100.5,
        advanceTND: 904.5,
        remainingTND: 0,
        gainTND: 318.25,
        deliveryStatus: 'Livré',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'ord_102',
        clientName: 'Sonia Trabelsi',
        phoneNumber: '+216 22 890 654',
        description: 'Lot cosmétiques Sephora & Parfums',
        reference: 'CMD-2026-002',
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        screenshot: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
        invoicedPriceForeign: 185,
        invoicedPriceRate: 3.38,
        invoicedPriceTND: 625.3,
        spentPriceForeign: 130,
        spentPriceRate: 3.38,
        spentPriceTND: 439.4,
        transportForeign: 25,
        transportRate: 3.38,
        transportTND: 84.5,
        advanceTND: 200,
        remainingTND: 509.8,
        gainTND: 270.4,
        deliveryStatus: 'En cours de livraison',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'ord_103',
        clientName: 'Mohamed Ali Gharbi',
        phoneNumber: '+216 55 120 789',
        description: 'Matériel électronique & écouteurs Sony',
        reference: 'CMD-2026-003',
        orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        screenshot: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        invoicedPriceForeign: 320,
        invoicedPriceRate: 3.36,
        invoicedPriceTND: 1075.2,
        spentPriceForeign: 245,
        spentPriceRate: 3.36,
        spentPriceTND: 823.2,
        transportForeign: 35,
        transportRate: 3.36,
        transportTND: 117.6,
        advanceTND: 300,
        remainingTND: 892.8,
        gainTND: 369.6,
        deliveryStatus: 'En cours de livraison',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'ord_104',
        clientName: 'Karim Ben Salem',
        phoneNumber: '+216 98 450 123',
        description: 'Montre Seiko & accessoires',
        reference: 'CMD-2026-004',
        orderDate: new Date().toISOString(),
        screenshot: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
        invoicedPriceForeign: 150,
        invoicedPriceRate: 3.35,
        invoicedPriceTND: 502.5,
        spentPriceForeign: 105,
        spentPriceRate: 3.35,
        spentPriceTND: 351.75,
        transportForeign: 20,
        transportRate: 3.35,
        transportTND: 67.0,
        advanceTND: 150,
        remainingTND: 419.5,
        gainTND: 217.75,
        deliveryStatus: 'En cours de livraison',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    expenses: [
      {
        _id: 'exp_101',
        description: 'Abonnement boîte postale & plateforme transit',
        amountEuro: 45,
        exchangeRate: 3.35,
        amountTND: 150.75,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'exp_102',
        description: 'Emballages bulles, cartons et rubans adhésifs',
        amountEuro: 30,
        exchangeRate: 3.35,
        amountTND: 100.5,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  writeLocalDb(initialData);
  return initialData;
}

async function seedMongoIfEmpty() {
  if (!isMongoConnected) return;
  const count = await OrderModel.countDocuments();
  if (count === 0) {
    const defaultData = initLocalDb();
    for (const ord of defaultData.orders) {
      await OrderModel.create({
        clientName: ord.clientName,
        phoneNumber: ord.phoneNumber,
        description: ord.description,
        reference: ord.reference,
        orderDate: new Date(ord.orderDate),
        screenshot: ord.screenshot,
        invoicedPriceForeign: ord.invoicedPriceForeign,
        invoicedPriceRate: ord.invoicedPriceRate,
        invoicedPriceTND: ord.invoicedPriceTND,
        spentPriceForeign: ord.spentPriceForeign,
        spentPriceRate: ord.spentPriceRate,
        spentPriceTND: ord.spentPriceTND,
        transportForeign: ord.transportForeign,
        transportRate: ord.transportRate,
        transportTND: ord.transportTND,
        gainTND: ord.gainTND,
        deliveryStatus: ord.deliveryStatus,
      });
    }
    for (const exp of defaultData.expenses) {
      await ExpenseModel.create({
        description: exp.description,
        amountEuro: exp.amountEuro,
        exchangeRate: exp.exchangeRate,
        amountTND: exp.amountTND,
        date: new Date(exp.date),
      });
    }
  }
}

// ----------------- DB Service Methods -----------------

export const dbService = {
  isMongo: () => isMongoConnected,

  async getOrders(filter?: { status?: string; search?: string }) {
    if (isMongoConnected) {
      const q: any = {};
      if (filter?.status && filter.status !== 'Tous') {
        q.deliveryStatus = filter.status;
      }
      if (filter?.search) {
        const regex = new RegExp(filter.search, 'i');
        q.$or = [{ clientName: regex }, { phoneNumber: regex }, { reference: regex }, { description: regex }];
      }
      const docs = await OrderModel.find(q).sort({ orderDate: -1, createdAt: -1 }).lean();
      return docs.map((d: any) => ({ ...d, _id: d._id.toString() }));
    }

    const db = readLocalDb();
    let result = [...db.orders];
    if (filter?.status && filter.status !== 'Tous') {
      result = result.filter((o) => o.deliveryStatus === filter.status);
    }
    if (filter?.search) {
      const s = filter.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.clientName.toLowerCase().includes(s) ||
          o.phoneNumber.toLowerCase().includes(s) ||
          o.reference.toLowerCase().includes(s) ||
          o.description.toLowerCase().includes(s)
      );
    }
    result.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    return result;
  },

  async getOrderById(id: string) {
    if (isMongoConnected) {
      return await OrderModel.findById(id).lean();
    }
    const db = readLocalDb();
    return db.orders.find((o) => o._id === id) || null;
  },

  async createOrder(data: OrderInput) {
    const calculated = calculateOrderFields(data);
    const orderData = {
      clientName: data.clientName.trim(),
      phoneNumber: data.phoneNumber.trim(),
      description: data.description?.trim() || '',
      reference: data.reference?.trim() || `CMD-${Date.now().toString().slice(-4)}`,
      orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
      screenshot: data.screenshot || '',
      deliveryStatus: data.deliveryStatus || 'En cours de livraison',
      ...calculated,
    };

    if (isMongoConnected) {
      const doc = await OrderModel.create(orderData);
      return doc.toObject();
    }

    const db = readLocalDb();
    const newOrder = {
      _id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...orderData,
      orderDate: orderData.orderDate.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.orders.unshift(newOrder);
    writeLocalDb(db);
    return newOrder;
  },

  async updateOrder(id: string, data: Partial<OrderInput>) {
    const existing = await this.getOrderById(id);
    if (!existing) {
      throw new Error('Commande introuvable');
    }

    const merged = {
      clientName: data.clientName !== undefined ? data.clientName.trim() : (existing as any).clientName,
      phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber.trim() : (existing as any).phoneNumber,
      description: data.description !== undefined ? data.description.trim() : (existing as any).description,
      reference: data.reference !== undefined ? data.reference.trim() : (existing as any).reference,
      orderDate: data.orderDate ? new Date(data.orderDate) : (existing as any).orderDate,
      screenshot: data.screenshot !== undefined ? data.screenshot : (existing as any).screenshot,
      deliveryStatus: data.deliveryStatus || (existing as any).deliveryStatus,
      invoicedPriceForeign: data.invoicedPriceForeign ?? (existing as any).invoicedPriceForeign,
      invoicedPriceRate: data.invoicedPriceRate ?? (existing as any).invoicedPriceRate,
      spentPriceForeign: data.spentPriceForeign ?? (existing as any).spentPriceForeign,
      spentPriceRate: data.spentPriceRate ?? (existing as any).spentPriceRate,
      transportForeign: data.transportForeign ?? (existing as any).transportForeign,
      transportRate: data.transportRate ?? (existing as any).transportRate,
      advanceTND: data.advanceTND !== undefined ? data.advanceTND : (existing as any).advanceTND,
    };

    const calculated = calculateOrderFields(merged);
    const finalData = { ...merged, ...calculated };

    if (isMongoConnected) {
      const updated = await OrderModel.findByIdAndUpdate(id, finalData, { new: true }).lean();
      return updated;
    }

    const db = readLocalDb();
    const index = db.orders.findIndex((o) => o._id === id);
    if (index === -1) throw new Error('Commande introuvable');

    const updated = {
      ...db.orders[index],
      ...finalData,
      orderDate: new Date(finalData.orderDate).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.orders[index] = updated;
    writeLocalDb(db);
    return updated;
  },

  async deleteOrder(id: string) {
    if (isMongoConnected) {
      const deleted = await OrderModel.findByIdAndDelete(id).lean();
      return !!deleted;
    }
    const db = readLocalDb();
    const index = db.orders.findIndex((o) => o._id === id);
    if (index === -1) return false;
    db.orders.splice(index, 1);
    writeLocalDb(db);
    return true;
  },

  // Expenses
  async getExpenses() {
    if (isMongoConnected) {
      const docs = await ExpenseModel.find().sort({ date: -1, createdAt: -1 }).lean();
      return docs.map((d: any) => ({ ...d, _id: d._id.toString() }));
    }
    const db = readLocalDb();
    return [...db.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async createExpense(data: ExpenseInput) {
    const calc = calculateExpenseFields(data);
    const expenseData = {
      description: data.description.trim(),
      amountEuro: calc.amountEuro,
      exchangeRate: calc.exchangeRate,
      amountTND: calc.amountTND,
      date: data.date ? new Date(data.date) : new Date(),
    };

    if (isMongoConnected) {
      const doc = await ExpenseModel.create(expenseData);
      return doc.toObject();
    }

    const db = readLocalDb();
    const newExp = {
      _id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...expenseData,
      date: expenseData.date.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.expenses.unshift(newExp);
    writeLocalDb(db);
    return newExp;
  },

  async updateExpense(id: string, data: Partial<ExpenseInput>) {
    if (isMongoConnected) {
      const existing = await ExpenseModel.findById(id);
      if (!existing) throw new Error('Frais introuvable');
      if (data.description !== undefined) existing.description = data.description.trim();
      if (data.amountEuro !== undefined) existing.amountEuro = Number(data.amountEuro);
      if (data.exchangeRate !== undefined) existing.exchangeRate = Number(data.exchangeRate);
      if (data.date !== undefined) existing.date = new Date(data.date);
      const saved = await existing.save();
      return saved.toObject();
    }

    const db = readLocalDb();
    const index = db.expenses.findIndex((e) => e._id === id);
    if (index === -1) throw new Error('Frais introuvable');

    const curr = db.expenses[index];
    const euro = data.amountEuro !== undefined ? Number(data.amountEuro) : curr.amountEuro;
    const rate = data.exchangeRate !== undefined ? Number(data.exchangeRate) : curr.exchangeRate;
    const amountTND = Number((euro * rate).toFixed(3));

    const updated = {
      ...curr,
      description: data.description !== undefined ? data.description.trim() : curr.description,
      amountEuro: euro,
      exchangeRate: rate,
      amountTND,
      date: data.date ? new Date(data.date).toISOString() : curr.date,
      updatedAt: new Date().toISOString(),
    };
    db.expenses[index] = updated;
    writeLocalDb(db);
    return updated;
  },

  async deleteExpense(id: string) {
    if (isMongoConnected) {
      const deleted = await ExpenseModel.findByIdAndDelete(id).lean();
      return !!deleted;
    }
    const db = readLocalDb();
    const idx = db.expenses.findIndex((e) => e._id === id);
    if (idx === -1) return false;
    db.expenses.splice(idx, 1);
    writeLocalDb(db);
    return true;
  },

  // Aggregated KPIs & Client Overviews
  async getDashboardAnalytics() {
    const orders = await this.getOrders();
    const expenses = await this.getExpenses();

    // 1. Total Prix Facturé (TND)
    const totalInvoicedTND = Number(
      orders.reduce((sum, o) => sum + (Number(o.invoicedPriceTND) || 0), 0).toFixed(3)
    );

    // 2. Total Transport Facturé (TND)
    const totalTransportTND = Number(
      orders.reduce((sum, o) => sum + (Number(o.transportTND) || 0), 0).toFixed(3)
    );

    // 3. Total Prix Dépensé Commandes (TND)
    const totalSpentTND = Number(
      orders.reduce((sum, o) => sum + (Number(o.spentPriceTND) || 0), 0).toFixed(3)
    );

    // 4. Total Frais Généraux (TND)
    const totalExpensesTND = Number(
      expenses.reduce((sum, e) => sum + (Number(e.amountTND) || 0), 0).toFixed(3)
    );

    // 5. Total Gain Net (TND) = (Total Prix Facturé + Total Transport Facturé) - Total Prix Dépensé Commandes - Total Frais Généraux
    const totalNetGainTND = Number(
      (totalInvoicedTND + totalTransportTND - totalSpentTND - totalExpensesTND).toFixed(3)
    );

    // 6. Total Avances Encaissées & Reste à Payer (TND)
    const totalAdvancesTND = Number(
      orders.reduce((sum, o) => sum + (Number((o as any).advanceTND) || 0), 0).toFixed(3)
    );
    const totalRemainingTND = Number(
      orders.reduce((sum, o) => {
        const remaining = (o as any).remainingTND !== undefined
          ? Number((o as any).remainingTND)
          : Math.max(0, (Number(o.invoicedPriceTND) || 0) + (Number(o.transportTND) || 0) - (Number((o as any).advanceTND) || 0));
        return sum + remaining;
      }, 0).toFixed(3)
    );

    const deliveredCount = orders.filter((o) => o.deliveryStatus === 'Livré').length;
    const pendingCount = orders.filter((o) => o.deliveryStatus === 'En cours de livraison').length;

    // Clients aggregation
    const clientsMap: {
      [key: string]: {
        clientName: string;
        phoneNumber: string;
        ordersCount: number;
        totalInvoicedTND: number;
        totalAdvancesTND: number;
        totalRemainingTND: number;
        totalGainTND: number;
        lastOrderDate: string;
      };
    } = {};

    for (const o of orders) {
      // Normalizing phone and name for unique client matching
      const key = `${o.clientName.toLowerCase()}_${o.phoneNumber.replace(/[^0-9+]/g, '')}`;
      if (!clientsMap[key]) {
        clientsMap[key] = {
          clientName: o.clientName,
          phoneNumber: o.phoneNumber,
          ordersCount: 0,
          totalInvoicedTND: 0,
          totalAdvancesTND: 0,
          totalRemainingTND: 0,
          totalGainTND: 0,
          lastOrderDate: o.orderDate,
        };
      }
      clientsMap[key].ordersCount += 1;
      clientsMap[key].totalInvoicedTND = Number(
        (clientsMap[key].totalInvoicedTND + (Number(o.invoicedPriceTND) || 0)).toFixed(3)
      );
      clientsMap[key].totalAdvancesTND = Number(
        (clientsMap[key].totalAdvancesTND + (Number((o as any).advanceTND) || 0)).toFixed(3)
      );
      const rem = (o as any).remainingTND !== undefined
        ? Number((o as any).remainingTND)
        : Math.max(0, (Number(o.invoicedPriceTND) || 0) + (Number(o.transportTND) || 0) - (Number((o as any).advanceTND) || 0));
      clientsMap[key].totalRemainingTND = Number(
        (clientsMap[key].totalRemainingTND + rem).toFixed(3)
      );
      clientsMap[key].totalGainTND = Number(
        (clientsMap[key].totalGainTND + (Number(o.gainTND) || 0)).toFixed(3)
      );
      if (new Date(o.orderDate) > new Date(clientsMap[key].lastOrderDate)) {
        clientsMap[key].lastOrderDate = o.orderDate;
      }
    }

    const clientsList = Object.values(clientsMap).sort(
      (a, b) => b.totalGainTND - a.totalGainTND
    );

    return {
      kpis: {
        totalInvoicedTND,
        totalTransportTND,
        totalSpentTND,
        totalExpensesTND,
        totalNetGainTND,
        totalAdvancesTND,
        totalRemainingTND,
        ordersCount: orders.length,
        deliveredCount,
        pendingCount,
        clientsCount: clientsList.length,
      },
      clients: clientsList,
      isMongo: isMongoConnected,
    };
  },
};

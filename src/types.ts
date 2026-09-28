export type DeliveryStatus = 'En cours de livraison' | 'Livré';

export interface Order {
  _id: string;
  clientName: string;
  phoneNumber: string;
  description?: string;
  reference?: string;
  orderDate: string; // ISO date string
  screenshot?: string; // URL /uploads/xxx
  invoicedPriceForeign: number;
  invoicedPriceRate: number;
  invoicedPriceTND: number;
  spentPriceForeign: number;
  spentPriceRate: number;
  spentPriceTND: number;
  transportForeign: number;
  transportRate: number;
  transportTND: number;
  advanceTND: number; // Avance / Acompte payé par le client en TND
  remainingTND: number; // Reste à payer par le client en TND
  gainTND: number;
  deliveryStatus: DeliveryStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  _id: string;
  description: string;
  amountEuro: number;
  exchangeRate: number;
  amountTND: number;
  date: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientSummary {
  clientName: string;
  phoneNumber: string;
  ordersCount: number;
  totalInvoicedTND: number;
  totalAdvancesTND?: number;
  totalRemainingTND?: number;
  totalGainTND: number;
  lastOrderDate?: string;
}

export interface GlobalKPIs {
  totalInvoicedTND: number;
  totalTransportTND: number;
  totalSpentTND: number;
  totalExpensesTND: number;
  totalNetGainTND: number;
  totalAdvancesTND?: number;
  totalRemainingTND?: number;
  ordersCount: number;
  deliveredCount: number;
  pendingCount: number;
  clientsCount: number;
}

import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  clientName: string;
  phoneNumber: string;
  description?: string;
  reference?: string;
  orderDate: Date;
  screenshot?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export const OrderSchema = new Schema<IOrder>(
  {
    clientName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    reference: { type: String, default: '', trim: true },
    orderDate: { type: Date, default: Date.now },
    screenshot: { type: String, default: '' },
    invoicedPriceForeign: { type: Number, default: 0 },
    invoicedPriceRate: { type: Number, default: 3.35 },
    invoicedPriceTND: { type: Number, default: 0 },
    spentPriceForeign: { type: Number, default: 0 },
    spentPriceRate: { type: Number, default: 3.35 },
    spentPriceTND: { type: Number, default: 0 },
    transportForeign: { type: Number, default: 0 },
    transportRate: { type: Number, default: 3.35 },
    transportTND: { type: Number, default: 0 },
    advanceTND: { type: Number, default: 0 },
    remainingTND: { type: Number, default: 0 },
    gainTND: { type: Number, default: 0 },
    deliveryStatus: {
      type: String,
      enum: ['En cours de livraison', 'Livré'],
      default: 'En cours de livraison',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure calculated fields are strictly synchronized
OrderSchema.pre('save', function () {
  const invForeign = Number(this.invoicedPriceForeign) || 0;
  const invRate = Number(this.invoicedPriceRate) || 0;
  this.invoicedPriceTND = Number((invForeign * invRate).toFixed(3));

  const spentForeign = Number(this.spentPriceForeign) || 0;
  const spentRate = Number(this.spentPriceRate) || 0;
  this.spentPriceTND = Number((spentForeign * spentRate).toFixed(3));

  const transForeign = Number(this.transportForeign) || 0;
  const transRate = Number(this.transportRate) || 0;
  this.transportTND = Number((transForeign * transRate).toFixed(3));

  // Advance and Remaining calculation
  const adv = Number(this.advanceTND) || 0;
  this.advanceTND = Number(adv.toFixed(3));
  const totalBilled = Number((this.invoicedPriceTND + this.transportTND).toFixed(3));
  this.remainingTND = Number(Math.max(0, totalBilled - this.advanceTND).toFixed(3));

  // Gain TND = invoicedPriceTND + transportTND - spentPriceTND
  this.gainTND = Number((this.invoicedPriceTND + this.transportTND - this.spentPriceTND).toFixed(3));
});

export const OrderModel: mongoose.Model<IOrder> =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>('Order', OrderSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  description: string;
  amountEuro: number;
  exchangeRate: number;
  amountTND: number;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ExpenseSchema = new Schema<IExpense>(
  {
    description: { type: String, required: true, trim: true },
    amountEuro: { type: Number, default: 0 },
    exchangeRate: { type: Number, default: 3.35 },
    amountTND: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate amountTND = amountEuro * exchangeRate
ExpenseSchema.pre('save', function () {
  const euro = Number(this.amountEuro) || 0;
  const rate = Number(this.exchangeRate) || 0;
  this.amountTND = Number((euro * rate).toFixed(3));
});

export const ExpenseModel: mongoose.Model<IExpense> =
  (mongoose.models.Expense as mongoose.Model<IExpense>) ||
  mongoose.model<IExpense>('Expense', ExpenseSchema);

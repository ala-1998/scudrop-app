import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  X,
  Tag,
  Euro,
} from 'lucide-react';
import { Expense } from '../types';

interface ExpensesSectionProps {
  expenses: Expense[];
  onAddExpense: (data: {
    reference?: string;
    description: string;
    amountEuro: number;
    exchangeRate: number;
    date: string;
  }) => Promise<void>;
  onUpdateExpense: (
    id: string,
    data: {
      reference?: string;
      description: string;
      amountEuro: number;
      exchangeRate: number;
      date: string;
    }
  ) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [amountEuro, setAmountEuro] = useState<number | string>(0);
  const [exchangeRate, setExchangeRate] = useState<number | string>(3.35);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const calculatedTND = (Number(amountEuro) || 0) * (Number(exchangeRate) || 0);

  const openAddForm = () => {
    setEditingExpense(null);
    setReference('');
    setDescription('');
    setAmountEuro(0);
    setExchangeRate(3.35);
    setDate(new Date().toISOString().split('T')[0]);
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const openEditForm = (exp: Expense) => {
    setEditingExpense(exp);
    setReference(exp.reference || '');
    setDescription(exp.description);
    setAmountEuro(exp.amountEuro);
    setExchangeRate(exp.exchangeRate);
    setDate(
      exp.date ? new Date(exp.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    );
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
    setReference('');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('La description est requise.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        reference: reference.trim(),
        description: description.trim(),
        amountEuro: Number(amountEuro) || 0,
        exchangeRate: Number(exchangeRate) || 3.35,
        date,
      };

      if (editingExpense) {
        await onUpdateExpense(editingExpense._id, payload);
      } else {
        await onAddExpense(payload);
      }
      closeForm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de l’enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTND = (val: number) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(val || 0);
  };

  const formatEUR = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  // 1. Somme directe brute en Euro (€) déjà saisie par l'utilisateur (sans recalcul de taux)
  const totalExpensesEUR = expenses.reduce((sum, e) => sum + (Number(e.amountEuro) || 0), 0);
  // 2. Total converti en Dinars Tunisiens (TND)
  const totalExpensesTND = expenses.reduce((sum, e) => sum + (Number(e.amountTND) || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              Partie Frais Généraux ({expenses.length})
            </h2>

            {/* Total Euro Saisi Directement (Sans Taux) */}
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1 shadow-2xs"
              title="Somme exacte des montants bruts en Euro saisis directement (sans recalcul par taux)"
            >
              <Euro className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-[10px] font-semibold text-amber-700 uppercase">Total Euro (€) :</span>
              <span className="font-extrabold text-amber-950">{formatEUR(totalExpensesEUR)} €</span>
            </span>

            {/* Total Converti en TND */}
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shadow-2xs"
              title="Total calculé en Dinars Tunisiens"
            >
              <span className="text-[10px] font-semibold text-rose-500 uppercase">Total TND :</span>
              <span className="font-extrabold text-rose-800">{formatTND(totalExpensesTND)} TND</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dépenses opérationnelles, emballages, douanes, abonnements et logistique
          </p>
        </div>

        <button
          id="btn-add-expense"
          onClick={openAddForm}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Frais
        </button>
      </div>

      {/* Inline Form (collapsible) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-slate-50 border-b border-slate-200 space-y-4 text-xs animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-rose-500" />
              {editingExpense ? 'Modifier le Frais Général' : 'Nouveau Frais Général'}
            </span>
            <button
              type="button"
              onClick={closeForm}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Case Référence */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                Référence <span className="text-slate-400 font-normal text-[10px]">(Optionnel)</span>
              </label>
              <input
                id="input-expense-ref"
                type="text"
                placeholder="ex: FG-2026-001"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-hidden uppercase font-mono"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Description du frais <span className="text-red-500">*</span>
              </label>
              <input
                id="input-expense-desc"
                type="text"
                required
                placeholder="ex: Emballages cartons, Scotch & Bulles"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date de dépense
              </label>
              <input
                id="input-expense-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Montant Euro */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Montant en Euro (€)
              </label>
              <input
                id="input-expense-euro"
                type="number"
                step="0.01"
                min="0"
                value={amountEuro}
                onChange={(e) => setAmountEuro(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-hidden font-bold"
              />
            </div>

            {/* Taux de Change */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Taux de Change (€ $\rightarrow$ TND)
              </label>
              <input
                id="input-expense-rate"
                type="number"
                step="0.001"
                min="0"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Calculated Preview */}
            <div className="sm:col-span-4 flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-medium">
                  Montant en Euro saisi : <strong className="text-slate-800 font-bold">{Number(amountEuro) || 0} €</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-medium">
                  Montant en Dinars Tunisiens (TND) :
                </span>
              </div>
              <span className="font-extrabold text-sm text-rose-700">
                {calculatedTND.toFixed(3)} TND
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeForm}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-md cursor-pointer"
            >
              Annuler
            </button>
            <button
              id="submit-expense-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-bold disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {isSubmitting ? 'Enregistrement...' : editingExpense ? 'Modifier' : 'Valider'}
            </button>
          </div>
        </form>
      )}

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Référence</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Montant (€ Saisi)</th>
              <th className="py-3 px-4 text-center">Taux (€ $\rightarrow$ TND)</th>
              <th className="py-3 px-4 text-right">Montant (TND)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Aucun frais général enregistré pour le moment.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-sans whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(exp.date).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                    {exp.reference ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {exp.reference}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {exp.description}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-amber-900 bg-amber-50/30 whitespace-nowrap">
                    {formatEUR(exp.amountEuro)} €
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-mono">
                    {exp.exchangeRate}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-rose-700 bg-rose-50/30 whitespace-nowrap">
                    {formatTND(exp.amountTND)} TND
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditForm(exp)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(exp._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {expenses.length > 0 && (
            <tfoot className="bg-slate-50/90 border-t-2 border-slate-200 font-bold text-xs">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-slate-800 uppercase tracking-wider text-[11px]">
                  Total Général des Frais ({expenses.length})
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-amber-950 bg-amber-100/60 border-x border-amber-200">
                  <span className="block text-[10px] text-amber-800 font-semibold uppercase">Total Euro Brut Saisi</span>
                  {formatEUR(totalExpensesEUR)} €
                </td>
                <td className="py-3 px-4 text-center text-slate-400 font-normal text-[11px]">
                  —
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-rose-800 bg-rose-100/60 border-x border-rose-200">
                  <span className="block text-[10px] text-rose-700 font-semibold uppercase">Total Converti TND</span>
                  {formatTND(totalExpensesTND)} TND
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

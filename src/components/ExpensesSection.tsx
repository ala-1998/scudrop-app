import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Expense } from '../types';

interface ExpensesSectionProps {
  expenses: Expense[];
  onAddExpense: (data: {
    description: string;
    amountEuro: number;
    exchangeRate: number;
    date: string;
  }) => Promise<void>;
  onUpdateExpense: (
    id: string,
    data: {
      description: string;
      amountEuro: number;
      exchangeRate: number;
      date: string;
    }
  ) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

const PAGE_SIZE = 10;

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [description, setDescription] = useState('');
  const [amountEuro, setAmountEuro] = useState<number | string>(0);
  const [exchangeRate, setExchangeRate] = useState<number | string>(3.35);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const calculatedTND = (Number(amountEuro) || 0) * (Number(exchangeRate) || 0);

  const openAddForm = () => {
    setEditingExpense(null);
    setDescription('');
    setAmountEuro(0);
    setExchangeRate(3.35);
    setDate(new Date().toISOString().split('T')[0]);
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const openEditForm = (exp: Expense) => {
    setEditingExpense(exp);
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

  const totalExpensesTND = expenses.reduce((sum, e) => sum + (Number(e.amountTND) || 0), 0);

  // ----- Pagination -----
  const totalPages = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedExpenses = expenses.slice(startIndex, startIndex + PAGE_SIZE);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              Partie Frais Généraux ({expenses.length})
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Total: {formatTND(totalExpensesTND)} TND
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>

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
            <div className="sm:col-span-3 flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">
                Montant calculé en Dinars Tunisiens (TND) :
              </span>
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
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Montant (€)</th>
              <th className="py-3 px-4">Taux de Change</th>
              <th className="py-3 px-4">Montant (TND)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Aucun frais général enregistré pour le moment.
                </td>
              </tr>
            ) : (
              paginatedExpenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-sans">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(exp.date).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {exp.description}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {exp.amountEuro} €
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {exp.exchangeRate}
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-700">
                    {formatTND(exp.amountTND)} TND
                  </td>
                  <td className="py-3 px-4 text-right">
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
        </table>
      </div>

      {/* Pagination */}
      {expenses.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/40">
          <div className="text-[11px] text-slate-500">
            Affichage{' '}
            <span className="font-semibold text-slate-700">{startIndex + 1}</span>{' '}
            –{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(startIndex + PAGE_SIZE, expenses.length)}
            </span>{' '}
            sur{' '}
            <span className="font-semibold text-slate-700">{expenses.length}</span>{' '}
            frais
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Précédent
            </button>

            <span className="text-xs font-semibold text-slate-600 px-2">
              Page {currentPage} / {totalPages}
            </span>

            <button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
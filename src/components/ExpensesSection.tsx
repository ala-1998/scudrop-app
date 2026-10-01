import React, { useState, useMemo } from 'react';
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
  Search,
  Filter,
  Hash,
  TrendingDown,
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

  // 🔍 Recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

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
      exp.date
        ? new Date(exp.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
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

  const formatTND = (val: number) =>
    new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(val || 0);

  const formatEUR = (val: number) =>
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val || 0);

  // 🔍 Filtrage + tri
  const filteredExpenses = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    const filtered = !s
      ? expenses
      : expenses.filter((e) => {
          const desc = (e.description || '').toLowerCase();
          const ref = (e.reference || '').toLowerCase();
          const dateStr = e.date
            ? new Date(e.date).toLocaleDateString('fr-FR').toLowerCase()
            : '';
          const amountStr = String(e.amountEuro ?? '');
          const tndStr = String(e.amountTND ?? '');
          return (
            desc.includes(s) ||
            ref.includes(s) ||
            dateStr.includes(s) ||
            amountStr.includes(s) ||
            tndStr.includes(s)
          );
        });

    // Tri
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount_desc':
          return (b.amountEuro || 0) - (a.amountEuro || 0);
        case 'amount_asc':
          return (a.amountEuro || 0) - (b.amountEuro || 0);
        case 'date_desc':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
    return sorted;
  }, [expenses, searchTerm, sortBy]);

  // 🧮 Totaux sur les frais FILTRÉS
  const totalExpensesEUR = filteredExpenses.reduce(
    (sum, e) => sum + (Number(e.amountEuro) || 0),
    0
  );
  const totalExpensesTND = filteredExpenses.reduce(
    (sum, e) => sum + (Number(e.amountTND) || 0),
    0
  );

  const isFiltered = searchTerm.trim().length > 0;
  const hasExpenses = expenses.length > 0;
  const hasFilteredResults = filteredExpenses.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          HEADER — Titre + Totaux dynamiques + Bouton Ajouter
      ═══════════════════════════════════════════════════════════ */}
      <div className="p-5 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">
                Partie Frais Généraux
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {filteredExpenses.length}
                {isFiltered && (
                  <span className="text-rose-400 font-medium">
                    {' '}/ {expenses.length}
                  </span>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dépenses opérationnelles, emballages, douanes, abonnements et logistique
            </p>
          </div>

          <button
            id="btn-add-expense"
            onClick={openAddForm}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] self-start"
          >
            <Plus className="w-4 h-4" />
            Ajouter un Frais
          </button>
        </div>

        {/* Barre de recherche + Tri */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="search-expenses-input"
              type="text"
              placeholder="Rechercher (description, référence, date, montant…)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
            />
            {isFiltered && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Effacer la recherche"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sort-expenses-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-slate-700 focus:outline-none font-semibold cursor-pointer pr-1"
            >
              <option value="date_desc">Plus récents</option>
              <option value="date_asc">Plus anciens</option>
              <option value="amount_desc">Montant ↓</option>
              <option value="amount_asc">Montant ↑</option>
            </select>
          </div>
        </div>

        {/* 🎯 Totaux dynamiques (sur les frais filtrés) */}
        {hasExpenses && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Euro className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Total Euro {isFiltered && '(filtré)'}
                </div>
                <div className="text-sm font-black text-amber-950 tracking-tight">
                  {formatEUR(totalExpensesEUR)}{' '}
                  <span className="text-[10px] font-semibold opacity-70">€</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Total TND {isFiltered && '(filtré)'}
                </div>
                <div className="text-sm font-black text-rose-950 tracking-tight">
                  {formatTND(totalExpensesTND)}{' '}
                  <span className="text-[10px] font-semibold opacity-70">TND</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          FORMULAIRE INLINE
      ═══════════════════════════════════════════════════════════ */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-slate-50 border-b border-slate-200 space-y-4 text-xs animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-rose-500" />
              {editingExpense
                ? 'Modifier le Frais Général'
                : 'Nouveau Frais Général'}
            </span>
            <button
              type="button"
              onClick={closeForm}
              className="w-6 h-6 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
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
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                Référence{' '}
                <span className="text-slate-400 font-normal text-[10px]">
                  (Optionnel)
                </span>
              </label>
              <input
                id="input-expense-ref"
                type="text"
                placeholder="ex: FG-2026-001"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none uppercase font-mono"
              />
            </div>

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
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none"
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
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none"
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
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Taux de Change (€ → TND)
              </label>
              <input
                id="input-expense-rate"
                type="number"
                step="0.001"
                min="0"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-4 flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-medium">
                  Euro saisi :{' '}
                  <strong className="text-slate-800 font-bold">
                    {Number(amountEuro) || 0} €
                  </strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-medium">
                  Montant TND :
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
              {isSubmitting
                ? 'Enregistrement...'
                : editingExpense
                ? 'Modifier'
                : 'Valider'}
            </button>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TABLEAU
      ═══════════════════════════════════════════════════════════ */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Référence</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Montant (€ Saisi)</th>
              <th className="py-3 px-4 text-center">Taux (€ → TND)</th>
              <th className="py-3 px-4 text-right">Montant (TND)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {!hasFilteredResults ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                      {isFiltered ? (
                        <Search className="w-6 h-6 text-slate-400" />
                      ) : (
                        <Receipt className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <p className="font-bold text-slate-600 text-sm">
                      {isFiltered
                        ? 'Aucun frais ne correspond'
                        : 'Aucun frais enregistré'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isFiltered
                        ? 'Essayez un autre mot-clé ou effacez la recherche.'
                        : 'Cliquez sur "Ajouter un Frais" pour commencer.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr
                  key={exp._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
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
                      <span className="text-slate-400 italic text-[11px]">
                        —
                      </span>
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

          {hasFilteredResults && (
            <tfoot className="bg-slate-50/90 border-t-2 border-slate-200 font-bold text-xs">
              <tr>
                <td
                  colSpan={3}
                  className="py-3 px-4 text-slate-800 uppercase tracking-wider text-[11px]"
                >
                  {isFiltered ? 'Totaux des frais filtrés' : 'Total Général des Frais'} ({filteredExpenses.length})
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-amber-950 bg-amber-100/60 border-x border-amber-200">
                  <span className="block text-[10px] text-amber-800 font-semibold uppercase">
                    Total Euro Brut Saisi
                  </span>
                  {formatEUR(totalExpensesEUR)} €
                </td>
                <td className="py-3 px-4 text-center text-slate-400 font-normal text-[11px]">
                  —
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-rose-800 bg-rose-100/60 border-x border-rose-200">
                  <span className="block text-[10px] text-rose-700 font-semibold uppercase">
                    Total Converti TND
                  </span>
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
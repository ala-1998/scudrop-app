import React from 'react';
import {
  DollarSign,
  Truck,
  ShoppingBag,
  Receipt,
  TrendingUp,
  PackageCheck,
  Clock,
  Users,
  Wallet,
  Coins,
  ArrowRight,
  Equal,
  Minus,
} from 'lucide-react';
import { GlobalKPIs } from '../types';

interface KPICardsProps {
  kpis: GlobalKPIs;
  periodLabel?: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, periodLabel }) => {
  const formatTND = (val: number) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(val || 0);
  };

  // Comprehensive Financial Totals
  const invoicedArticles = kpis.totalInvoicedTND || 0;
  const invoicedTransport = kpis.totalTransportTND || 0;
  const totalBilledToClient = invoicedArticles + invoicedTransport;

  const spentOrders = kpis.totalSpentTND || 0;
  const spentExpenses = kpis.totalExpensesTND || 0;
  const totalSpentAll = spentOrders + spentExpenses;

  const netGain =
    kpis.totalNetGainTND !== undefined
      ? kpis.totalNetGainTND
      : totalBilledToClient - totalSpentAll;

  const profitMarginPercent =
    totalBilledToClient > 0
      ? ((netGain / totalBilledToClient) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-4">
      {/* 1. MASTER FINANCIAL FORMULA BANNER (Total Facturé - Total Dépensé = Gain Net) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-5 shadow-md border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Synthèse Financière Globale {periodLabel ? `(${periodLabel})` : ''}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Formule : Total Facturé (Articles + Transport) − Total Dépensé (Achats + Frais) = Gain Net
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-11 gap-3 items-center">
          {/* Box 1: TOTAL FACTURÉ (4 cols on lg) */}
          <div className="lg:col-span-4 bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                1. Total Facturé Client
              </span>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-semibold">
                Recettes
              </span>
            </div>
            <div className="text-2xl font-black tracking-tight text-white mt-1">
              {formatTND(totalBilledToClient)}{' '}
              <span className="text-xs font-normal text-blue-200">TND</span>
            </div>

            {/* Breakdown côte-à-côte ("les9a") */}
            <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white/5 rounded-lg px-2.5 py-1">
                <span className="text-slate-400 block text-[10px]">Prix Facturé Articles</span>
                <strong className="text-white font-bold">{formatTND(invoicedArticles)} TND</strong>
              </div>
              <div className="bg-white/5 rounded-lg px-2.5 py-1">
                <span className="text-slate-400 block text-[10px]">Transport Facturé</span>
                <strong className="text-sky-300 font-bold">{formatTND(invoicedTransport)} TND</strong>
              </div>
            </div>
          </div>

          {/* Minus Operator (1 col on lg) */}
          <div className="hidden lg:flex lg:col-span-1 justify-center items-center">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300">
              <Minus className="w-4 h-4 font-bold" />
            </div>
          </div>

          {/* Box 2: TOTAL DÉPENSÉ (4 cols on lg) */}
          <div className="lg:col-span-4 bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-200">
                2. Total Dépensé (Coûts)
              </span>
              <span className="text-[10px] bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded-full font-semibold">
                Dépenses
              </span>
            </div>
            <div className="text-2xl font-black tracking-tight text-white mt-1">
              {formatTND(totalSpentAll)}{' '}
              <span className="text-xs font-normal text-rose-200">TND</span>
            </div>

            {/* Breakdown côte-à-côte ("les9a") */}
            <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white/5 rounded-lg px-2.5 py-1">
                <span className="text-slate-400 block text-[10px]">Dépenses Commandes</span>
                <strong className="text-white font-bold">{formatTND(spentOrders)} TND</strong>
              </div>
              <div className="bg-white/5 rounded-lg px-2.5 py-1">
                <span className="text-slate-400 block text-[10px]">Frais Généraux</span>
                <strong className="text-rose-300 font-bold">{formatTND(spentExpenses)} TND</strong>
              </div>
            </div>
          </div>

          {/* Equal Operator (1 col on lg) */}
          <div className="hidden lg:flex lg:col-span-1 justify-center items-center">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300">
              <Equal className="w-4 h-4 font-bold" />
            </div>
          </div>

          {/* Box 3: GAIN NET TOTAL (1 col on lg -> wait, let's give 2-3 cols, adjusting grid) */}
        </div>

        {/* Big Net Result Callout Banner */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/5 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                netGain >= 0 ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                3. Résultat & Gain Net Réel
              </span>
              <span className="text-[11px] text-slate-400">
                Bénéfice net après déduction de tous les achats articles et frais d'exploitation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  netGain >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {netGain >= 0 ? '+' : ''}
                {formatTND(netGain)}{' '}
                <span className="text-sm font-semibold opacity-90">TND</span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                Marge brute : <strong className="text-white">{profitMarginPercent}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DETAILED 5 CORE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Prix Articles Facturé */}
        <div
          id="kpi-card-invoiced"
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Prix Facturé Articles
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#001cd6] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold tracking-tight text-slate-900">
              {formatTND(invoicedArticles)}{' '}
              <span className="text-xs font-medium text-slate-500">TND</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Articles vendus aux clients
            </p>
          </div>
        </div>

        {/* 2. Transport Facturé */}
        <div
          id="kpi-card-transport"
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-sky-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Transport Facturé
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold tracking-tight text-slate-900">
              {formatTND(invoicedTransport)}{' '}
              <span className="text-xs font-medium text-slate-500">TND</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Frais de port refacturés
            </p>
          </div>
        </div>

        {/* 3. Dépenses Commandes (Achats) */}
        <div
          id="kpi-card-spent"
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-amber-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Dépenses Commandes
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold tracking-tight text-slate-900">
              {formatTND(spentOrders)}{' '}
              <span className="text-xs font-medium text-slate-500">TND</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Prix d'achat des articles
            </p>
          </div>
        </div>

        {/* 4. Frais Généraux */}
        <div
          id="kpi-card-expenses"
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-rose-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Frais Généraux
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold tracking-tight text-slate-900">
              {formatTND(spentExpenses)}{' '}
              <span className="text-xs font-medium text-slate-500">TND</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Charges & coûts divers
            </p>
          </div>
        </div>

        {/* 5. Gain Net Total */}
        <div
          id="kpi-card-net-gain"
          className={`rounded-xl border p-4 shadow-2xs transition-all ${
            netGain >= 0
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-red-50/70 border-red-200 text-red-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Gain Net Total
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                netGain >= 0 ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div
              className={`text-xl font-bold tracking-tight ${
                netGain >= 0 ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {netGain >= 0 ? '+' : ''}
              {formatTND(netGain)}{' '}
              <span className="text-xs font-medium opacity-80">TND</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-800/80">
              Facturé − Dépensé
            </p>
          </div>
        </div>
      </div>

      {/* 3. CASH-FLOW & AVANCES OVERVIEW BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                Total Avances Encaissées
              </span>
              <span className="text-xs text-emerald-700/80">
                Acomptes versés par les clients
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-emerald-900 tracking-tight">
              {formatTND(kpis.totalAdvancesTND ?? 0)}{' '}
              <span className="text-xs font-semibold text-emerald-700">TND</span>
            </span>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                Total Reste à Recouvrer
              </span>
              <span className="text-xs text-amber-800/80">
                Montant restant à encaisser à la livraison
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-amber-950 tracking-tight">
              {formatTND(kpis.totalRemainingTND ?? 0)}{' '}
              <span className="text-xs font-semibold text-amber-800">TND</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. SECONDARY OPERATIONAL QUICK INDICATORS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center space-x-2 text-slate-600">
          <ShoppingBag className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Total commandes: <strong className="text-slate-800 font-semibold">{kpis.ordersCount}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-600">
          <PackageCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Livrées: <strong className="text-emerald-700 font-semibold">{kpis.deliveredCount}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-600">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            En cours: <strong className="text-amber-700 font-semibold">{kpis.pendingCount}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-600">
          <Users className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            Clients uniques: <strong className="text-indigo-700 font-semibold">{kpis.clientsCount}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

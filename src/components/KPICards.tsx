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
  Minus,
  Equal,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { GlobalKPIs } from '../types';

interface KPICardsProps {
  kpis: GlobalKPIs;
  periodLabel?: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, periodLabel }) => {
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

  // ── Calculs financiers ─────────────────────────────────────────
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

  const isPositive = netGain >= 0;

  return (
    <div className="space-y-5">
      {/* ═══════════════════════════════════════════════════════════
          1. HERO — SYNTHÈSE FINANCIÈRE
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-slate-800 shadow-xl">
        {/* Décoration de fond */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          {/* En-tête */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                  Synthèse Financière
                </h2>
                {periodLabel && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{periodLabel}</p>
                )}
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 backdrop-blur-sm">
              Facturé − Dépensé = Gain Net
            </div>
          </div>

          {/* Flow : Facturé − Dépensé = Gain */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 lg:gap-3 items-stretch">
            {/* ── CARTE 1 : FACTURÉ ───────────────────────── */}
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-400/20 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                  Total Facturé
                </span>
                <ArrowUpRight className="w-4 h-4 text-blue-300" />
              </div>
              <div className="text-3xl font-black tracking-tight text-white leading-none">
                {formatTND(totalBilledToClient)}
                <span className="text-sm font-semibold text-blue-200 ml-1.5">TND</span>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-white/5 px-2.5 py-1.5">
                  <div className="text-[9px] uppercase font-semibold text-slate-400 tracking-wide">
                    Articles
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {formatTND(invoicedArticles)}
                  </div>
                </div>
                <div className="rounded-lg bg-white/5 px-2.5 py-1.5">
                  <div className="text-[9px] uppercase font-semibold text-slate-400 tracking-wide">
                    Transport
                  </div>
                  <div className="text-xs font-bold text-sky-300 mt-0.5">
                    {formatTND(invoicedTransport)}
                  </div>
                </div>
              </div>
            </div>

            {/* ── OPÉRATEUR − ────────────────────────────── */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                <Minus className="w-4 h-4" />
              </div>
            </div>

            {/* ── CARTE 2 : DÉPENSÉ ───────────────────────── */}
            <div className="relative rounded-2xl bg-gradient-to-br from-rose-500/15 to-rose-600/5 border border-rose-400/20 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-200">
                  Total Dépensé
                </span>
                <ArrowDownRight className="w-4 h-4 text-rose-300" />
              </div>
              <div className="text-3xl font-black tracking-tight text-white leading-none">
                {formatTND(totalSpentAll)}
                <span className="text-sm font-semibold text-rose-200 ml-1.5">TND</span>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-white/5 px-2.5 py-1.5">
                  <div className="text-[9px] uppercase font-semibold text-slate-400 tracking-wide">
                    Achats
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {formatTND(spentOrders)}
                  </div>
                </div>
                <div className="rounded-lg bg-white/5 px-2.5 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-semibold text-slate-400 tracking-wide">
                      Frais
                    </span>
                    {kpis.totalExpensesEUR !== undefined && (
                      <span className="text-[9px] text-amber-300 font-bold font-mono">
                        {formatEUR(kpis.totalExpensesEUR)}€
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-rose-300 mt-0.5">
                    {formatTND(spentExpenses)}
                  </div>
                </div>
              </div>
            </div>

            {/* ── OPÉRATEUR = ────────────────────────────── */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                <Equal className="w-4 h-4" />
              </div>
            </div>

            {/* ── CARTE 3 : GAIN NET ─────────────────────── */}
            <div
              className={`relative rounded-2xl p-5 backdrop-blur-sm border ${
                isPositive
                  ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-400/30'
                  : 'bg-gradient-to-br from-red-500/20 to-red-600/5 border-red-400/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    isPositive ? 'text-emerald-200' : 'text-red-200'
                  }`}
                >
                  Gain Net
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}
                >
                  <TrendingUp
                    className={`w-4 h-4 ${
                      isPositive ? 'text-emerald-300' : 'text-red-300'
                    }`}
                  />
                </div>
              </div>
              <div
                className={`text-3xl font-black tracking-tight leading-none ${
                  isPositive ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {isPositive ? '+' : ''}
                {formatTND(netGain)}
                <span className="text-sm font-semibold opacity-80 ml-1.5">TND</span>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">
                    Marge brute
                  </span>
                  <span
                    className={`text-xs font-extrabold ${
                      isPositive ? 'text-emerald-300' : 'text-red-300'
                    }`}
                  >
                    {profitMarginPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. CARTES DÉTAILLÉES
      ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Articles facturés */}
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Articles Facturés"
          value={formatTND(invoicedArticles)}
          unit="TND"
          description="Ventes articles clients"
          accent="blue"
        />

        {/* Transport facturé */}
        <StatCard
          icon={<Truck className="w-5 h-5" />}
          label="Transport Facturé"
          value={formatTND(invoicedTransport)}
          unit="TND"
          description="Frais de port refacturés"
          accent="sky"
        />

        {/* Dépenses commandes */}
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Achats Articles"
          value={formatTND(spentOrders)}
          unit="TND"
          description="Prix d'achat marchandises"
          accent="amber"
        />

        {/* Frais généraux */}
        <StatCard
          icon={<Receipt className="w-5 h-5" />}
          label="Frais Généraux"
          value={formatTND(spentExpenses)}
          unit="TND"
          description="Charges & coûts divers"
          accent="rose"
          extraBadge={
            kpis.totalExpensesEUR !== undefined
              ? `${formatEUR(kpis.totalExpensesEUR)} €`
              : undefined
          }
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. CASH-FLOW
      ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CashCard
          icon={<Wallet className="w-5 h-5" />}
          label="Total Avances Encaissées"
          description="Acomptes versés par les clients"
          value={formatTND(kpis.totalAdvancesTND ?? 0)}
          accent="emerald"
        />
        <CashCard
          icon={<Coins className="w-5 h-5" />}
          label="Total Reste à Recouvrer"
          description="Solde à encaisser à la livraison"
          value={formatTND(kpis.totalRemainingTND ?? 0)}
          accent="amber"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          4. INDICATEURS OPÉRATIONNELS
      ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat
          icon={<ShoppingBag className="w-4 h-4" />}
          label="Commandes"
          value={kpis.ordersCount}
          color="slate"
        />
        <MiniStat
          icon={<PackageCheck className="w-4 h-4" />}
          label="Livrées"
          value={kpis.deliveredCount}
          color="emerald"
        />
        <MiniStat
          icon={<Clock className="w-4 h-4" />}
          label="En cours"
          value={kpis.pendingCount}
          color="amber"
        />
        <MiniStat
          icon={<Users className="w-4 h-4" />}
          label="Clients uniques"
          value={kpis.clientsCount}
          color="indigo"
        />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS RÉUTILISABLES
═══════════════════════════════════════════════════════════════ */

type Accent = 'blue' | 'sky' | 'amber' | 'rose' | 'emerald' | 'indigo' | 'slate';

const ACCENT_STYLES: Record<
  Accent,
  { bg: string; text: string; border: string; iconBg: string; iconText: string }
> = {
  blue: {
    bg: 'bg-blue-50/50',
    text: 'text-blue-900',
    border: 'hover:border-blue-300',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-700',
  },
  sky: {
    bg: 'bg-sky-50/50',
    text: 'text-sky-900',
    border: 'hover:border-sky-300',
    iconBg: 'bg-sky-100',
    iconText: 'text-sky-700',
  },
  amber: {
    bg: 'bg-amber-50/50',
    text: 'text-amber-900',
    border: 'hover:border-amber-300',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
  },
  rose: {
    bg: 'bg-rose-50/50',
    text: 'text-rose-900',
    border: 'hover:border-rose-300',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-700',
  },
  emerald: {
    bg: 'bg-emerald-50/50',
    text: 'text-emerald-900',
    border: 'hover:border-emerald-300',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
  },
  indigo: {
    bg: 'bg-indigo-50/50',
    text: 'text-indigo-900',
    border: 'hover:border-indigo-300',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-700',
  },
  slate: {
    bg: 'bg-slate-50/50',
    text: 'text-slate-900',
    border: 'hover:border-slate-300',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-700',
  },
};

/* ── Carte détaillée ─────────────────────────────────────────── */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  description: string;
  accent: Accent;
  extraBadge?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  unit,
  description,
  accent,
  extraBadge,
}) => {
  const styles = ACCENT_STYLES[accent];
  return (
    <div
      className={`group bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${styles.border}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBg} ${styles.iconText} transition-transform group-hover:scale-105`}
        >
          {icon}
        </div>
        {extraBadge && (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-mono">
            {extraBadge}
          </span>
        )}
      </div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </div>
      <div className={`text-2xl font-black tracking-tight ${styles.text} leading-tight`}>
        {value}
        <span className="text-xs font-semibold text-slate-400 ml-1.5">{unit}</span>
      </div>
      <p className="text-[11px] text-slate-500 mt-2">{description}</p>
    </div>
  );
};

/* ── Carte cash-flow ─────────────────────────────────────────── */
interface CashCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: string;
  accent: 'emerald' | 'amber';
}

const CashCard: React.FC<CashCardProps> = ({
  icon,
  label,
  description,
  value,
  accent,
}) => {
  const styles =
    accent === 'emerald'
      ? {
          wrapper: 'bg-emerald-50/60 border-emerald-200/70 hover:border-emerald-300',
          icon: 'bg-emerald-100 text-emerald-700',
          label: 'text-emerald-900',
          value: 'text-emerald-950',
          unit: 'text-emerald-700',
        }
      : {
          wrapper: 'bg-amber-50/60 border-amber-200/70 hover:border-amber-300',
          icon: 'bg-amber-100 text-amber-800',
          label: 'text-amber-900',
          value: 'text-amber-950',
          unit: 'text-amber-800',
        };

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${styles.wrapper}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${styles.icon}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div
            className={`text-[11px] font-bold uppercase tracking-wider ${styles.label}`}
          >
            {label}
          </div>
          <div className="text-[11px] text-slate-600 truncate mt-0.5">
            {description}
          </div>
        </div>
      </div>
      <div className={`text-xl font-extrabold tracking-tight shrink-0 ${styles.value}`}>
        {value}
        <span className={`text-xs font-semibold ml-1 ${styles.unit}`}>TND</span>
      </div>
    </div>
  );
};

/* ── Mini indicateur ─────────────────────────────────────────── */
interface MiniStatProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'slate' | 'emerald' | 'amber' | 'indigo';
}

const MiniStat: React.FC<MiniStatProps> = ({ icon, label, value, color }) => {
  const colorMap = {
    slate: 'text-slate-600 bg-slate-100',
    emerald: 'text-emerald-700 bg-emerald-100',
    amber: 'text-amber-700 bg-amber-100',
    indigo: 'text-indigo-700 bg-indigo-100',
  };
  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:shadow-sm transition-shadow">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <div className="text-base font-extrabold text-slate-900 leading-tight">
          {value}
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ChevronDown,
  RotateCcw,
  CalendarDays,
  CalendarRange,
  Check,
  Sparkles,
  History,
  Sun,
  CalendarCheck,
  Layers,
  X,
} from 'lucide-react';

export type DateFilterMode =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'custom_day'
  | 'custom_week'
  | 'custom_month'
  | 'custom_range';

export interface DateRange {
  mode: DateFilterMode;
  startDate: string | null; // 'YYYY-MM-DD'
  endDate: string | null;   // 'YYYY-MM-DD'
  label: string;
}

interface DateFilterBarProps {
  currentFilter: DateRange;
  onFilterChange: (newFilter: DateRange) => void;
  ordersCount: number;
  expensesCount: number;
}

// ── Utilitaires de dates ────────────────────────────────────────
const formatDateYMD = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMondayOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getSundayOfWeek = (d: Date): Date => {
  const monday = getMondayOfWeek(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  currentFilter,
  onFilterChange,
  ordersCount,
  expensesCount,
}) => {
  const [selectedDayInput, setSelectedDayInput] = useState<string>(() =>
    formatDateYMD(new Date())
  );
  const [selectedWeekDateInput, setSelectedWeekDateInput] = useState<string>(
    () => formatDateYMD(new Date())
  );
  const [selectedMonthInput, setSelectedMonthInput] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [customStartInput, setCustomStartInput] = useState<string>(() =>
    formatDateYMD(new Date())
  );
  const [customEndInput, setCustomEndInput] = useState<string>(() =>
    formatDateYMD(new Date())
  );

  const [activeDropdown, setActiveDropdown] = useState<
    'day' | 'week' | 'month' | 'range' | null
  >(null);

  // ── Actions rapides ────────────────────────────────────────
  const handleSetAll = () => {
    setActiveDropdown(null);
    onFilterChange({
      mode: 'all',
      startDate: null,
      endDate: null,
      label: "Tout l'historique",
    });
  };

  const handleSetToday = () => {
    setActiveDropdown(null);
    const today = formatDateYMD(new Date());
    onFilterChange({
      mode: 'today',
      startDate: today,
      endDate: today,
      label: "Aujourd'hui",
    });
  };

  const handleSetYesterday = () => {
    setActiveDropdown(null);
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yestStr = formatDateYMD(yest);
    onFilterChange({
      mode: 'yesterday',
      startDate: yestStr,
      endDate: yestStr,
      label: 'Hier',
    });
  };

  const handleSetThisWeek = () => {
    setActiveDropdown(null);
    const now = new Date();
    const mon = formatDateYMD(getMondayOfWeek(now));
    const sun = formatDateYMD(getSundayOfWeek(now));
    onFilterChange({
      mode: 'this_week',
      startDate: mon,
      endDate: sun,
      label: 'Cette semaine',
    });
  };

  const handleSetLastWeek = () => {
    setActiveDropdown(null);
    const lastW = new Date();
    lastW.setDate(lastW.getDate() - 7);
    const mon = formatDateYMD(getMondayOfWeek(lastW));
    const sun = formatDateYMD(getSundayOfWeek(lastW));
    onFilterChange({
      mode: 'last_week',
      startDate: mon,
      endDate: sun,
      label: 'Semaine dernière',
    });
  };

  const handleSetThisMonth = () => {
    setActiveDropdown(null);
    const now = new Date();
    const start = formatDateYMD(new Date(now.getFullYear(), now.getMonth(), 1));
    const end = formatDateYMD(
      new Date(now.getFullYear(), now.getMonth() + 1, 0)
    );
    const monthName = now.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
    onFilterChange({
      mode: 'this_month',
      startDate: start,
      endDate: end,
      label: `Ce mois-ci (${monthName})`,
    });
  };

  const handleSetLastMonth = () => {
    setActiveDropdown(null);
    const now = new Date();
    const start = formatDateYMD(
      new Date(now.getFullYear(), now.getMonth() - 1, 1)
    );
    const end = formatDateYMD(new Date(now.getFullYear(), now.getMonth(), 0));
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthName = prevDate.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
    onFilterChange({
      mode: 'last_month',
      startDate: start,
      endDate: end,
      label: `Mois dernier (${monthName})`,
    });
  };

  // ── Sélecteurs personnalisés ───────────────────────────────
  const handleApplyCustomDay = (dateStr: string) => {
    if (!dateStr) return;
    setActiveDropdown(null);
    const [y, m, d] = dateStr.split('-');
    const formatted = `${d}/${m}/${y}`;
    onFilterChange({
      mode: 'custom_day',
      startDate: dateStr,
      endDate: dateStr,
      label: `Jour : ${formatted}`,
    });
  };

  const handleApplyCustomWeek = (dateStr: string) => {
    if (!dateStr) return;
    setActiveDropdown(null);
    const d = new Date(dateStr + 'T12:00:00');
    const mon = getMondayOfWeek(d);
    const sun = getSundayOfWeek(d);
    const monStr = formatDateYMD(mon);
    const sunStr = formatDateYMD(sun);
    const label = `Semaine du ${mon.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    })} au ${sun.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })}`;
    onFilterChange({
      mode: 'custom_week',
      startDate: monStr,
      endDate: sunStr,
      label,
    });
  };

  const handleApplyCustomMonth = (monthStr: string) => {
    if (!monthStr) return;
    setActiveDropdown(null);
    const [year, month] = monthStr.split('-').map(Number);
    const start = formatDateYMD(new Date(year, month - 1, 1));
    const end = formatDateYMD(new Date(year, month, 0));
    const monthDate = new Date(year, month - 1, 1);
    const monthName = monthDate.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
    onFilterChange({
      mode: 'custom_month',
      startDate: start,
      endDate: end,
      label: `Mois : ${monthName}`,
    });
  };

  const handleApplyCustomRange = () => {
    if (!customStartInput || !customEndInput) return;
    setActiveDropdown(null);
    const [sy, sm, sd] = customStartInput.split('-');
    const [ey, em, ed] = customEndInput.split('-');
    onFilterChange({
      mode: 'custom_range',
      startDate: customStartInput,
      endDate: customEndInput,
      label: `Du ${sd}/${sm}/${sy} au ${ed}/${em}/${ey}`,
    });
  };

  const isFiltered = currentFilter.mode !== 'all';

  // ── Helpers UI ─────────────────────────────────────────────
  const presetClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border ${
      active
        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent shadow-md shadow-indigo-500/20 scale-[1.02]'
        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`;

  const dropdownTriggerClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border ${
      active
        ? 'bg-blue-50 text-indigo-700 border-blue-300 shadow-sm'
        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          HEADER — Titre, compteurs, reset
      ═══════════════════════════════════════════════════════════ */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Filtre Temporel
              </h3>
              {isFiltered ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm">
                  <Check className="w-3 h-3" />
                  {currentFilter.label}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                  <Sparkles className="w-3 h-3" />
                  Toutes les dates
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Calculez vos totaux (facturé, dépensé, gains nets) sur une période précise
            </p>
          </div>
        </div>

        {/* Compteurs + Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-slate-500 font-medium">Commandes</span>
              <strong className="text-slate-900 font-bold">{ordersCount}</strong>
            </div>
            <div className="w-px h-3 bg-slate-300" />
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-slate-500 font-medium">Frais</span>
              <strong className="text-slate-900 font-bold">{expensesCount}</strong>
            </div>
          </div>

          {isFiltered && (
            <button
              onClick={handleSetAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 hover:border-rose-300 transition-all cursor-pointer"
              title="Réinitialiser et afficher tout l'historique"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Effacer</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          FILTRES
      ═══════════════════════════════════════════════════════════ */}
      <div className="p-5 space-y-4">
        {/* Section 1 : Périodes rapides */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="w-1 h-3 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full" />
            Périodes rapides
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSetAll}
              className={presetClass(currentFilter.mode === 'all')}
            >
              <History className="w-3.5 h-3.5" />
              Tout l'historique
            </button>

            <button
              type="button"
              onClick={handleSetToday}
              className={presetClass(currentFilter.mode === 'today')}
            >
              <Sun className="w-3.5 h-3.5" />
              Aujourd'hui
            </button>

            <button
              type="button"
              onClick={handleSetThisWeek}
              className={presetClass(currentFilter.mode === 'this_week')}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Cette semaine
            </button>

            <button
              type="button"
              onClick={handleSetThisMonth}
              className={presetClass(currentFilter.mode === 'this_month')}
            >
              <Layers className="w-3.5 h-3.5" />
              Ce mois-ci
            </button>
          </div>
        </div>

        {/* Section 2 : Sélecteurs précis */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="w-1 h-3 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full" />
            Sélection précise
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* ── Dropdown : Par Jour ─────────────────────────── */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'day' ? null : 'day')
                }
                className={dropdownTriggerClass(
                  currentFilter.mode === 'custom_day' ||
                    currentFilter.mode === 'yesterday'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Par Jour</span>
                <ChevronDown
                  className={`w-3 h-3 opacity-60 transition-transform ${
                    activeDropdown === 'day' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'day' && (
                <DropdownPanel
                  title="Choisir un jour précis"
                  onClose={() => setActiveDropdown(null)}
                  actionLabel="Hier"
                  onAction={handleSetYesterday}
                  className="w-64"
                >
                  <input
                    type="date"
                    value={selectedDayInput}
                    onChange={(e) => setSelectedDayInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCustomDay(selectedDayInput)}
                    className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Appliquer ce jour
                  </button>
                </DropdownPanel>
              )}
            </div>

            {/* ── Dropdown : Par Semaine ──────────────────────── */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'week' ? null : 'week')
                }
                className={dropdownTriggerClass(
                  currentFilter.mode === 'custom_week' ||
                    currentFilter.mode === 'last_week'
                )}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Par Semaine</span>
                <ChevronDown
                  className={`w-3 h-3 opacity-60 transition-transform ${
                    activeDropdown === 'week' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'week' && (
                <DropdownPanel
                  title="Semaine déterminée"
                  onClose={() => setActiveDropdown(null)}
                  actionLabel="Semaine dernière"
                  onAction={handleSetLastWeek}
                  className="w-72"
                >
                  <p className="text-[11px] text-slate-500 -mt-1">
                    Sélectionnez n'importe quel jour de la semaine souhaitée
                  </p>
                  <input
                    type="date"
                    value={selectedWeekDateInput}
                    onChange={(e) => setSelectedWeekDateInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCustomWeek(selectedWeekDateInput)}
                    className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Appliquer (Lun → Dim)
                  </button>
                </DropdownPanel>
              )}
            </div>

            {/* ── Dropdown : Par Mois ─────────────────────────── */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'month' ? null : 'month')
                }
                className={dropdownTriggerClass(
                  currentFilter.mode === 'custom_month' ||
                    currentFilter.mode === 'last_month'
                )}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>Par Mois</span>
                <ChevronDown
                  className={`w-3 h-3 opacity-60 transition-transform ${
                    activeDropdown === 'month' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'month' && (
                <DropdownPanel
                  title="Mois déterminé"
                  onClose={() => setActiveDropdown(null)}
                  actionLabel="Mois dernier"
                  onAction={handleSetLastMonth}
                  className="w-64"
                >
                  <input
                    type="month"
                    value={selectedMonthInput}
                    onChange={(e) => setSelectedMonthInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCustomMonth(selectedMonthInput)}
                    className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Appliquer ce mois
                  </button>
                </DropdownPanel>
              )}
            </div>

            {/* ── Dropdown : Période Libre ────────────────────── */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'range' ? null : 'range')
                }
                className={dropdownTriggerClass(
                  currentFilter.mode === 'custom_range'
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Période Libre</span>
                <ChevronDown
                  className={`w-3 h-3 opacity-60 transition-transform ${
                    activeDropdown === 'range' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'range' && (
                <DropdownPanel
                  title="Plage personnalisée"
                  onClose={() => setActiveDropdown(null)}
                  className="w-80 sm:right-0 sm:left-auto left-0"
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Du
                      </label>
                      <input
                        type="date"
                        value={customStartInput}
                        onChange={(e) => setCustomStartInput(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Au
                      </label>
                      <input
                        type="date"
                        value={customEndInput}
                        onChange={(e) => setCustomEndInput(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomRange}
                    className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Appliquer la plage
                  </button>
                </DropdownPanel>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SOUS-COMPOSANT — DropdownPanel
═══════════════════════════════════════════════════════════════ */
interface DropdownPanelProps {
  title: string;
  onClose: () => void;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

const DropdownPanel: React.FC<DropdownPanelProps> = ({
  title,
  onClose,
  className = '',
  actionLabel,
  onAction,
  children,
}) => {
  return (
    <>
      {/* Overlay pour fermer au clic extérieur */}
      <div
        className="fixed inset-0 z-20"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`absolute left-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200 p-4 z-30 space-y-3 animate-[fadeIn_0.15s_ease-out] ${className}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">{title}</span>
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              {actionLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </>
  );
};
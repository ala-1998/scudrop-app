import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ChevronDown,
  RotateCcw,
  CalendarDays,
  CalendarRange,
  Check,
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

// Utility functions to compute date boundaries
const formatDateYMD = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMondayOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
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
  const [selectedDayInput, setSelectedDayInput] = useState<string>(
    () => formatDateYMD(new Date())
  );
  const [selectedWeekDateInput, setSelectedWeekDateInput] = useState<string>(
    () => formatDateYMD(new Date())
  );
  const [selectedMonthInput, setSelectedMonthInput] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [customStartInput, setCustomStartInput] = useState<string>(
    () => formatDateYMD(new Date())
  );
  const [customEndInput, setCustomEndInput] = useState<string>(
    () => formatDateYMD(new Date())
  );

  const [activeDropdown, setActiveDropdown] = useState<
    'day' | 'week' | 'month' | 'range' | null
  >(null);

  // Quick Action Handlers
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
    const end = formatDateYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
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
    const start = formatDateYMD(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const end = formatDateYMD(new Date(now.getFullYear(), now.getMonth(), 0));
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthName = prevDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    onFilterChange({
      mode: 'last_month',
      startDate: start,
      endDate: end,
      label: `Mois dernier (${monthName})`,
    });
  };

  // Specific Custom Pickers Handlers
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-3">
      {/* Title & Active Filter Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#001cd6]/10 text-[#001cd6] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Filtre Temporel & Périodes
              </span>
              {isFiltered ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#001cd6] text-white shadow-2xs">
                  <Check className="w-3 h-3" />
                  {currentFilter.label}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                  Toutes les dates
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Calcule le total facturé, dépensé et les gains nets pour le jour, la semaine ou le mois sélectionné
            </p>
          </div>
        </div>

        {/* Counter badge & reset */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <strong>{ordersCount}</strong> com. • <strong>{expensesCount}</strong> frais
          </span>
          {isFiltered && (
            <button
              onClick={handleSetAll}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Réinitialiser et afficher tout l'historique"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Effacer</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* All time */}
        <button
          type="button"
          onClick={handleSetAll}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            currentFilter.mode === 'all'
              ? 'bg-[#001cd6] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Tout l'historique
        </button>

        {/* Fast presets: Today, This Week, This Month */}
        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <button
          type="button"
          onClick={handleSetToday}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            currentFilter.mode === 'today'
              ? 'bg-[#001cd6] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Aujourd'hui
        </button>

        <button
          type="button"
          onClick={handleSetThisWeek}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            currentFilter.mode === 'this_week'
              ? 'bg-[#001cd6] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Cette semaine
        </button>

        <button
          type="button"
          onClick={handleSetThisMonth}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            currentFilter.mode === 'this_month'
              ? 'bg-[#001cd6] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Ce mois-ci
        </button>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Dropdown: Par Jour Déterminé */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setActiveDropdown(activeDropdown === 'day' ? null : 'day')
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
              currentFilter.mode === 'custom_day' || currentFilter.mode === 'yesterday'
                ? 'bg-blue-50 text-[#001cd6] border-blue-300'
                : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Par Jour</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {activeDropdown === 'day' && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 space-y-2.5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Choisir un jour précis</span>
                <button
                  type="button"
                  onClick={handleSetYesterday}
                  className="text-[11px] font-semibold text-blue-700 hover:underline"
                >
                  Hier
                </button>
              </div>
              <input
                type="date"
                value={selectedDayInput}
                onChange={(e) => setSelectedDayInput(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#001cd6]"
              />
              <button
                type="button"
                onClick={() => handleApplyCustomDay(selectedDayInput)}
                className="w-full py-1.5 bg-[#001cd6] hover:bg-[#0017b8] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Appliquer ce jour
              </button>
            </div>
          )}
        </div>

        {/* Dropdown: Par Semaine Déterminée */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setActiveDropdown(activeDropdown === 'week' ? null : 'week')
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
              currentFilter.mode === 'custom_week' || currentFilter.mode === 'last_week'
                ? 'bg-blue-50 text-[#001cd6] border-blue-300'
                : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Par Semaine</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {activeDropdown === 'week' && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 space-y-2.5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Semaine déterminée
                </span>
                <button
                  type="button"
                  onClick={handleSetLastWeek}
                  className="text-[11px] font-semibold text-blue-700 hover:underline"
                >
                  Semaine dernière
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Sélectionnez n'importe quel jour de la semaine souhaitée :
              </p>
              <input
                type="date"
                value={selectedWeekDateInput}
                onChange={(e) => setSelectedWeekDateInput(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#001cd6]"
              />
              <button
                type="button"
                onClick={() => handleApplyCustomWeek(selectedWeekDateInput)}
                className="w-full py-1.5 bg-[#001cd6] hover:bg-[#0017b8] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Appliquer cette semaine (Lun - Dim)
              </button>
            </div>
          )}
        </div>

        {/* Dropdown: Par Mois Déterminé */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setActiveDropdown(activeDropdown === 'month' ? null : 'month')
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
              currentFilter.mode === 'custom_month' || currentFilter.mode === 'last_month'
                ? 'bg-blue-50 text-[#001cd6] border-blue-300'
                : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Par Mois</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {activeDropdown === 'month' && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 space-y-2.5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Mois déterminé</span>
                <button
                  type="button"
                  onClick={handleSetLastMonth}
                  className="text-[11px] font-semibold text-blue-700 hover:underline"
                >
                  Mois dernier
                </button>
              </div>
              <input
                type="month"
                value={selectedMonthInput}
                onChange={(e) => setSelectedMonthInput(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#001cd6]"
              />
              <button
                type="button"
                onClick={() => handleApplyCustomMonth(selectedMonthInput)}
                className="w-full py-1.5 bg-[#001cd6] hover:bg-[#0017b8] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Appliquer ce mois
              </button>
            </div>
          )}
        </div>

        {/* Dropdown: Plage Personnalisée */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setActiveDropdown(activeDropdown === 'range' ? null : 'range')
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
              currentFilter.mode === 'custom_range'
                ? 'bg-blue-50 text-[#001cd6] border-blue-300'
                : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
            }`}
          >
            <span>Période Libre</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {activeDropdown === 'range' && (
            <div className="absolute sm:right-0 left-0 sm:left-auto mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 space-y-2.5 animate-in fade-in zoom-in-95">
              <span className="text-xs font-bold text-slate-800 block">
                Plage personnalisée (Du / Au)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Du :
                  </label>
                  <input
                    type="date"
                    value={customStartInput}
                    onChange={(e) => setCustomStartInput(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Au :
                  </label>
                  <input
                    type="date"
                    value={customEndInput}
                    onChange={(e) => setCustomEndInput(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-medium"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyCustomRange}
                className="w-full py-1.5 bg-[#001cd6] hover:bg-[#0017b8] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Appliquer la plage
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

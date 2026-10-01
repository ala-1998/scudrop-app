import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Phone,
  ShoppingBag,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  UserCircle2,
} from 'lucide-react';
import { ClientSummary } from '../types';

interface ClientsTableProps {
  clients: ClientSummary[];
  onSelectClient: (clientName: string) => void;
}

const PAGE_SIZE = 10;

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onSelectClient,
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const formatTND = (val: number) =>
    new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(val || 0);

  const filteredClients = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return clients;
    return clients.filter((c) => {
      const name = (c.clientName || '').toLowerCase();
      const phone = (c.phoneNumber || '').toLowerCase();
      return name.includes(s) || phone.includes(s);
    });
  }, [clients, search]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Statistiques globales pour l'en-tête
  const totalClients = clients.length;
  const totalOrders = clients.reduce((s, c) => s + (c.ordersCount || 0), 0);
  const totalInvoiced = clients.reduce(
    (s, c) => s + (c.totalInvoicedTND || 0),
    0
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          HEADER — Titre, stats résumées, recherche
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white">
        {/* Décor */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Titre + description */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    Portefeuille Clients
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                    {totalClients} client{totalClients > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Vue consolidée : volume de commandes, chiffre facturé et rentabilité nette par client
                </p>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="flex flex-wrap gap-2">
              <QuickStat
                icon={<ShoppingBag className="w-3.5 h-3.5" />}
                label="Commandes"
                value={totalOrders}
              />
              <QuickStat
                icon={<DollarSign className="w-3.5 h-3.5" />}
                label="Facturé"
                value={`${formatTND(totalInvoiced)} TND`}
              />
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="mt-5 relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              id="search-clients-input"
              type="text"
              placeholder="Rechercher par nom ou téléphone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TABLEAU
      ═══════════════════════════════════════════════════════════ */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4 text-center">Commandes</th>
              <th className="py-3.5 px-4">Total Facturé</th>
              <th className="py-3.5 px-4">Règlement</th>
              <th className="py-3.5 px-4">Gain Net</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                      <UserCircle2 className="w-7 h-7 text-slate-400" />
                    </div>
                    <p className="font-semibold text-slate-600 text-sm">
                      Aucun client trouvé
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {search
                        ? 'Essayez une autre recherche ou effacez le filtre.'
                        : 'Les clients apparaîtront ici dès que des commandes seront enregistrées.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedClients.map((client, idx) => {
                const isPositive = client.totalGainTND >= 0;
                const remaining = client.totalRemainingTND ?? 0;
                const advance = client.totalAdvancesTND ?? 0;
                const isSettled = remaining === 0 && advance > 0;
                const initials = (client.clientName || '?')
                  .split(' ')
                  .map((n) => n.charAt(0))
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr
                    key={`${client.clientName}_${client.phoneNumber}_${
                      startIndex + idx
                    }`}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    {/* Client */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {client.clientName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Client depuis {client.ordersCount} commande
                            {client.ordersCount > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Téléphone */}
                    <td className="py-3.5 px-4">
                      <a
                        href={`tel:${client.phoneNumber}`}
                        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-700 font-medium transition-colors group/phone"
                      >
                        <span className="w-6 h-6 rounded-md bg-slate-100 group-hover/phone:bg-indigo-100 flex items-center justify-center transition-colors">
                          <Phone className="w-3 h-3 text-slate-500 group-hover/phone:text-indigo-600" />
                        </span>
                        <span className="font-mono text-[11px]">
                          {client.phoneNumber}
                        </span>
                      </a>
                    </td>

                    {/* Nombre de commandes */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] border border-slate-200">
                        <ShoppingBag className="w-3 h-3 text-slate-500" />
                        {client.ordersCount}
                      </span>
                    </td>

                    {/* Total facturé */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-blue-950 text-sm">
                        {formatTND(client.totalInvoicedTND)}
                        <span className="text-[10px] font-semibold text-slate-400 ml-1">
                          TND
                        </span>
                      </div>
                    </td>

                    {/* Règlement : Avance + Reste */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] uppercase font-semibold text-slate-400">
                            Av.
                          </span>
                          <span className="font-bold text-emerald-700 text-[11px]">
                            {formatTND(advance)}
                          </span>
                        </div>
                        {isSettled ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ Soldé
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-semibold text-slate-400">
                              Reste
                            </span>
                            <span
                              className={`font-bold text-[11px] ${
                                remaining > 0
                                  ? 'text-amber-700'
                                  : 'text-slate-500'
                              }`}
                            >
                              {formatTND(remaining)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Gain net */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-extrabold text-xs px-2.5 py-1 rounded-lg border ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {isPositive ? '+' : ''}
                        {formatTND(client.totalGainTND)}
                        <span className="text-[9px] opacity-70">TND</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectClient(client.clientName)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all cursor-pointer group/btn"
                        title="Voir les commandes de ce client"
                      >
                        <span>Voir commandes</span>
                        <ArrowUpRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PAGINATION
      ═══════════════════════════════════════════════════════════ */}
      {filteredClients.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/40">
          <div className="text-[11px] text-slate-500">
            Affichage{' '}
            <span className="font-semibold text-slate-700">
              {startIndex + 1}
            </span>{' '}
            –{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(startIndex + PAGE_SIZE, filteredClients.length)}
            </span>{' '}
            sur{' '}
            <span className="font-semibold text-slate-700">
              {filteredClients.length}
            </span>{' '}
            client{filteredClients.length > 1 ? 's' : ''}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Précédent
            </button>

            <span className="text-xs font-bold text-slate-700 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
              {currentPage}{' '}
              <span className="text-slate-400 font-normal">/ {totalPages}</span>
            </span>

            <button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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

/* ═══════════════════════════════════════════════════════════════
   SOUS-COMPOSANT — QuickStat (mini stat de l'en-tête)
═══════════════════════════════════════════════════════════════ */
interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const QuickStat: React.FC<QuickStatProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
        {label}
      </div>
      <div className="text-xs font-bold text-white whitespace-nowrap">
        {value}
      </div>
    </div>
  </div>
);
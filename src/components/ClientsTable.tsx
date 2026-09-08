import React, { useState } from 'react';
import { Users, Phone, ShoppingBag, DollarSign, TrendingUp, Search, ExternalLink } from 'lucide-react';
import { ClientSummary } from '../types';

interface ClientsTableProps {
  clients: ClientSummary[];
  onSelectClient: (clientName: string) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({ clients, onSelectClient }) => {
  const [search, setSearch] = useState('');

  const formatTND = (val: number) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(val || 0);
  };

  const filteredClients = clients.filter((c) => {
    const s = search.toLowerCase();
    return c.clientName.toLowerCase().includes(s) || c.phoneNumber.toLowerCase().includes(s);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              Partie Clients ({clients.length})
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Agrégation automatique
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Portefeuille de clients, volume de commandes cumulé et rentabilité nette par client
          </p>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="search-clients-input"
            type="text"
            placeholder="Filtrer client ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-slate-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Numéro de Téléphone</th>
              <th className="py-3 px-4 text-center">Nombre de Commandes</th>
              <th className="py-3 px-4">Total Facturé (TND)</th>
              <th className="py-3 px-4">Avances / Reste</th>
              <th className="py-3 px-4">Total Gain Net (TND)</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Aucun client enregistré à partir des commandes actuelles.
                </td>
              </tr>
            ) : (
              filteredClients.map((client, idx) => (
                <tr
                  key={`${client.clientName}_${client.phoneNumber}_${idx}`}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#001cd6]/10 text-[#001cd6] flex items-center justify-center font-bold text-xs border border-blue-200">
                      {client.clientName.charAt(0).toUpperCase()}
                    </div>
                    <span>{client.clientName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={`tel:${client.phoneNumber}`}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-[#001cd6] font-medium transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {client.phoneNumber}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px]">
                      <ShoppingBag className="w-3 h-3 text-slate-500" />
                      {client.ordersCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-blue-950">
                    {formatTND(client.totalInvoicedTND)} TND
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5 text-[11px]">
                      <div className="text-emerald-700 font-bold">
                        {formatTND(client.totalAdvancesTND ?? 0)} TND
                      </div>
                      <div
                        className={
                          client.totalRemainingTND && client.totalRemainingTND > 0
                            ? 'text-amber-800 font-bold'
                            : 'text-slate-500 font-medium'
                        }
                      >
                        Reste: {formatTND(client.totalRemainingTND ?? 0)} TND
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-extrabold px-2 py-0.5 rounded ${
                        client.totalGainTND >= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {client.totalGainTND >= 0 ? '+' : ''}
                      {formatTND(client.totalGainTND)} TND
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectClient(client.clientName)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-[#001cd6] hover:text-[#0017b8] hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Voir les commandes de ce client"
                    >
                      <span>Filtrer commandes</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Phone,
  Calendar,
  Image as ImageIcon,
  Plus,
} from 'lucide-react';
import { Order, DeliveryStatus } from '../types';
import { getUploadUrl } from '../config/api';

interface OrdersTableProps {
  orders: Order[];
  onOpenCreate: () => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onViewScreenshot: (order: Order) => void;
  onToggleStatus: (id: string, newStatus: DeliveryStatus) => Promise<void>;
  filterClient?: string | null;
  onClearClientFilter?: () => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onOpenCreate,
  onEdit,
  onDelete,
  onViewScreenshot,
  onToggleStatus,
  filterClient,
  onClearClientFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const formatTND = (val: number) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(val || 0);
  };

  const handleStatusClick = async (order: Order) => {
    const nextStatus: DeliveryStatus =
      order.deliveryStatus === 'Livré' ? 'En cours de livraison' : 'Livré';
    setUpdatingId(order._id);
    try {
      await onToggleStatus(order._id, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !searchTerm ||
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.reference && o.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.description && o.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'Tous' || o.deliveryStatus === statusFilter;

    const matchesClient =
      !filterClient || o.clientName.toLowerCase() === filterClient.toLowerCase();

    return matchesSearch && matchesStatus && matchesClient;
  });

  const totalInvoicedFiltered = filteredOrders.reduce((s, o) => s + (o.invoicedPriceTND || 0), 0);
  const totalTransportFiltered = filteredOrders.reduce((s, o) => s + (o.transportTND || 0), 0);
  const totalBilledFiltered = totalInvoicedFiltered + totalTransportFiltered;
  const totalSpentFiltered = filteredOrders.reduce((s, o) => s + (o.spentPriceTND || 0), 0);
  const totalAdvanceFiltered = filteredOrders.reduce((s, o) => s + (o.advanceTND || 0), 0);
  const totalRemainingFiltered = filteredOrders.reduce((s, o) => {
    const tot = (o.invoicedPriceTND || 0) + (o.transportTND || 0);
    const rem = o.remainingTND !== undefined ? o.remainingTND : Math.max(0, tot - (o.advanceTND || 0));
    return s + rem;
  }, 0);
  const totalGainFiltered = filteredOrders.reduce((s, o) => s + (o.gainTND || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              Commandes & Demandes ({filteredOrders.length})
            </h2>
            {filterClient && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Filtre client: {filterClient}
                <button
                  onClick={onClearClientFilter}
                  className="hover:text-indigo-900 cursor-pointer ml-1 font-bold"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi détaillé : Articles facturés + Transport = Total Facturé, Dépenses achats et Gains nets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="search-orders-input"
              type="text"
              placeholder="Rechercher (client, tél, réf)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-slate-800"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="En cours de livraison">En cours</option>
              <option value="Livré">Livré</option>
            </select>
          </div>

          {/* New Order Button */}
          <button
            id="btn-add-order"
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#001cd6] hover:bg-[#0017b8] text-white rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Demande
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3 w-12 text-center">Capture</th>
              <th className="py-3 px-3">Réf & Date</th>
              <th className="py-3 px-3">Client & Contact</th>
              <th className="py-3 px-3 text-blue-900">Articles (TND)</th>
              <th className="py-3 px-3 text-sky-900">Transport (TND)</th>
              <th className="py-3 px-3 bg-blue-50/50 text-[#001cd6] font-bold">Total Facturé</th>
              <th className="py-3 px-3 text-amber-900">Dépensé Achat</th>
              <th className="py-3 px-3">Règlement Client</th>
              <th className="py-3 px-3 text-emerald-900 font-bold">Gain Net</th>
              <th className="py-3 px-3 text-center">Statut</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-medium text-slate-600">Aucune commande trouvée</p>
                    <p className="text-[11px] text-slate-400">
                      Modifiez votre recherche ou ajoutez une nouvelle demande en cliquant sur le bouton ci-dessus.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isDelivered = order.deliveryStatus === 'Livré';
                const screenshotSrc = getUploadUrl(order.screenshot);
                const orderTotalBilled = (order.invoicedPriceTND || 0) + (order.transportTND || 0);

                return (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Thumbnail Screenshot (Clickable) */}
                    <td className="py-3 px-3 text-center">
                      {screenshotSrc ? (
                        <button
                          onClick={() => onViewScreenshot(order)}
                          className="relative group/thumb block mx-auto rounded-lg overflow-hidden border border-slate-200 hover:border-[#001cd6] w-9 h-9 transition-all cursor-pointer shadow-xs"
                          title="Cliquez pour agrandir la capture"
                        >
                          <img
                            src={screenshotSrc}
                            alt="Preuve"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-[#001cd6]/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ) : (
                        <div
                          className="w-9 h-9 mx-auto rounded-lg bg-slate-100 border border-dashed border-slate-200 flex items-center justify-center text-slate-300"
                          title="Aucune capture téléversée"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </td>

                    {/* Ref & Date */}
                    <td className="py-3 px-3 font-mono">
                      <span className="font-semibold text-slate-900 block text-xs">
                        {order.reference || 'N/A'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-sans mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                      </span>
                    </td>

                    {/* Client & Contact */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block text-xs">
                        {order.clientName}
                      </span>
                      <a
                        href={`tel:${order.phoneNumber}`}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-0.5 font-medium transition-colors"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        {order.phoneNumber}
                      </a>
                      {order.description && (
                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 italic">
                          {order.description}
                        </span>
                      )}
                    </td>

                    {/* Facturé Articles TND */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-blue-900">
                        {formatTND(order.invoicedPriceTND)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({order.invoicedPriceForeign} € @ {order.invoicedPriceRate})
                      </span>
                    </td>

                    {/* Transport TND */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-sky-900">
                        {formatTND(order.transportTND)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({order.transportForeign} € @ {order.transportRate})
                      </span>
                    </td>

                    {/* TOTAL FACTURÉ (Articles + Transport) */}
                    <td className="py-3 px-3 bg-blue-50/40">
                      <span className="font-black text-[#001cd6] block text-xs">
                        {formatTND(orderTotalBilled)} TND
                      </span>
                      <span className="text-[9px] text-blue-600/80 block font-medium">
                        Articles + Port
                      </span>
                    </td>

                    {/* Dépensé Achat TND */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-amber-900">
                        {formatTND(order.spentPriceTND)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({order.spentPriceForeign} € @ {order.spentPriceRate})
                      </span>
                    </td>

                    {/* Règlement Client (Avance / Reste) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {(() => {
                        const advance = order.advanceTND || 0;
                        const remaining = order.remainingTND !== undefined
                          ? order.remainingTND
                          : Math.max(0, orderTotalBilled - advance);

                        return (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-semibold text-slate-400">Avance:</span>
                              <span className="font-bold text-emerald-700 text-xs">
                                {formatTND(advance)} TND
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-semibold text-slate-400">Reste:</span>
                              {remaining === 0 && advance > 0 ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  Soldé
                                </span>
                              ) : (
                                <span
                                  className={`text-xs font-bold ${
                                    remaining > 0 ? 'text-amber-800' : 'text-slate-600'
                                  }`}
                                >
                                  {formatTND(remaining)} TND
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Gain Net TND */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded ${
                          order.gainTND >= 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {order.gainTND >= 0 ? '+' : ''}
                        {formatTND(order.gainTND)} TND
                      </span>
                    </td>

                    {/* Interactive Delivery Status Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleStatusClick(order)}
                        disabled={updatingId === order._id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shadow-2xs border ${
                          isDelivered
                            ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : 'bg-amber-100/80 text-amber-800 border-amber-300 hover:bg-amber-200'
                        } disabled:opacity-50`}
                        title="Cliquez pour basculer le statut"
                      >
                        {isDelivered ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            Livré
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-700" />
                            En cours
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(order)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(order)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Summary Footer */}
          {filteredOrders.length > 0 && (
            <tfoot className="bg-slate-50/95 border-t-2 border-slate-300 font-bold text-slate-900 text-[11px]">
              <tr>
                <td colSpan={3} className="py-3 px-3 text-right text-slate-600 uppercase tracking-wider text-[10px]">
                  Totaux Commandes Affichées ({filteredOrders.length}) :
                </td>
                <td className="py-3 px-3 text-blue-900">
                  {formatTND(totalInvoicedFiltered)} TND
                </td>
                <td className="py-3 px-3 text-sky-900">
                  {formatTND(totalTransportFiltered)} TND
                </td>
                <td className="py-3 px-3 bg-blue-100/50 text-[#001cd6] font-extrabold text-xs">
                  {formatTND(totalBilledFiltered)} TND
                </td>
                <td className="py-3 px-3 text-amber-900">
                  {formatTND(totalSpentFiltered)} TND
                </td>
                <td className="py-3 px-3">
                  <div className="text-[10px]">
                    <span className="text-emerald-700 block">Av.: {formatTND(totalAdvanceFiltered)}</span>
                    <span className="text-amber-800 block">Reste: {formatTND(totalRemainingFiltered)}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-emerald-700 font-black text-xs">
                    +{formatTND(totalGainFiltered)} TND
                  </span>
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

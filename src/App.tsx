/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
  Plus,
  RefreshCw,
  Database,
  Layers,
  ArrowDownUp,
  Receipt,
  Users,
  CheckCircle,
  AlertCircle,
  Server,
  LogOut,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { Order, Expense, GlobalKPIs, ClientSummary, DeliveryStatus } from './types';
import { api, DashboardData, AuthUser } from './services/api';
import { KPICards } from './components/KPICards';
import { OrdersTable } from './components/OrdersTable';
import { ExpensesSection } from './components/ExpensesSection';
import { ClientsTable } from './components/ClientsTable';
import { OrderFormModal } from './components/OrderFormModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ScudropLogo } from './components/ScudropLogo';
import { DeploymentModal } from './components/DeploymentModal';
import { LoginPage } from './components/LoginPage';
import { DateFilterBar, DateRange } from './components/DateFilterBar';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('scudrop_auth_token');
    const storedUser = localStorage.getItem('scudrop_auth_user');
    if (token && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Core Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [isMongo, setIsMongo] = useState<boolean>(false);

  // Date Filtering State
  const [dateFilter, setDateFilter] = useState<DateRange>({
    mode: 'all',
    startDate: null,
    endDate: null,
    label: "Tout l'historique",
  });

  // Modals & States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [lightboxOrder, setLightboxOrder] = useState<Order | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'order' | 'expense';
    id: string;
    title: string;
    message: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Client filtering on Orders Table
  const [filterClient, setFilterClient] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('scudrop_auth_token');
    localStorage.removeItem('scudrop_auth_user');
    setCurrentUser(null);
    showToast('Déconnexion réussie');
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashData, ordersData, expensesData] = await Promise.all([
        api.getDashboard(),
        api.getOrders(),
        api.getExpenses(),
      ]);

      setClients(dashData.clients);
      setIsMongo(dashData.isMongo);
      setOrders(ordersData);
      setExpenses(expensesData);
    } catch (err: any) {
      console.error('Erreur chargement données:', err);
      setError(err.message || 'Impossible de charger les données du serveur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  // Orders filtered by the selected date range
  const filteredOrdersByDate = useMemo(() => {
    if (dateFilter.mode === 'all') return orders;
    return orders.filter((order) => {
      if (!order.orderDate) return false;
      const orderDateStr = order.orderDate.split('T')[0];
      if (dateFilter.startDate && orderDateStr < dateFilter.startDate) return false;
      if (dateFilter.endDate && orderDateStr > dateFilter.endDate) return false;
      return true;
    });
  }, [orders, dateFilter]);

  // Expenses filtered by the selected date range
  const filteredExpensesByDate = useMemo(() => {
    if (dateFilter.mode === 'all') return expenses;
    return expenses.filter((exp) => {
      if (!exp.date) return false;
      const expDateStr = exp.date.split('T')[0];
      if (dateFilter.startDate && expDateStr < dateFilter.startDate) return false;
      if (dateFilter.endDate && expDateStr > dateFilter.endDate) return false;
      return true;
    });
  }, [expenses, dateFilter]);

  // Dynamically computed KPIs for the active period
  const activeKPIs = useMemo((): GlobalKPIs => {
    const totalInvoicedTND = filteredOrdersByDate.reduce(
      (sum, o) => sum + (o.invoicedPriceTND || 0),
      0
    );
    const totalTransportTND = filteredOrdersByDate.reduce(
      (sum, o) => sum + (o.transportTND || 0),
      0
    );
    const totalSpentTND = filteredOrdersByDate.reduce(
      (sum, o) => sum + (o.spentPriceTND || 0),
      0
    );
    const totalExpensesTND = filteredExpensesByDate.reduce(
      (sum, e) => sum + (e.amountTND || 0),
      0
    );
    const totalAdvancesTND = filteredOrdersByDate.reduce(
      (sum, o) => sum + (o.advanceTND || 0),
      0
    );
    const totalRemainingTND = filteredOrdersByDate.reduce((sum, o) => {
      const tot = (o.invoicedPriceTND || 0) + (o.transportTND || 0);
      const rem =
        o.remainingTND !== undefined
          ? o.remainingTND
          : Math.max(0, tot - (o.advanceTND || 0));
      return sum + rem;
    }, 0);

    const totalNetGainTND =
      totalInvoicedTND + totalTransportTND - (totalSpentTND + totalExpensesTND);
    const ordersCount = filteredOrdersByDate.length;
    const deliveredCount = filteredOrdersByDate.filter(
      (o) => o.deliveryStatus === 'Livré'
    ).length;
    const pendingCount = filteredOrdersByDate.filter(
      (o) => o.deliveryStatus === 'En cours de livraison'
    ).length;
    const uniqueClients = new Set(
      filteredOrdersByDate.map((o) => o.clientName.trim().toLowerCase())
    );

    return {
      totalInvoicedTND,
      totalTransportTND,
      totalSpentTND,
      totalExpensesTND,
      totalNetGainTND,
      totalAdvancesTND,
      totalRemainingTND,
      ordersCount,
      deliveredCount,
      pendingCount,
      clientsCount: uniqueClients.size,
    };
  }, [filteredOrdersByDate, filteredExpensesByDate]);

  // Order Handlers
  const handleOpenCreateOrder = () => {
    setOrderToEdit(null);
    setIsOrderModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setOrderToEdit(order);
    setIsOrderModalOpen(true);
  };

  const handleSubmitOrder = async (formData: FormData) => {
    if (orderToEdit) {
      await api.updateOrder(orderToEdit._id, formData);
      showToast('Commande mise à jour avec succès');
    } else {
      await api.createOrder(formData);
      showToast('Nouvelle commande créée avec succès');
    }
    await loadData();
  };

  const handleToggleOrderStatus = async (id: string, newStatus: DeliveryStatus) => {
    try {
      await api.toggleOrderStatus(id, newStatus);
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, deliveryStatus: newStatus } : o))
      );
      showToast(`Statut mis à jour: ${newStatus}`);
      // Refresh analytics in background
      api.getDashboard().then((dash) => {
        setClients(dash.clients);
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de statut');
    }
  };

  const handleDeleteOrderClick = (order: Order) => {
    setDeleteTarget({
      type: 'order',
      id: order._id,
      title: 'Supprimer cette commande ?',
      message: `Voulez-vous vraiment supprimer la commande "${order.reference || order.clientName}" ? Cette action est irréversible.`,
    });
  };

  // Expense Handlers
  const handleAddExpense = async (data: {
    description: string;
    amountEuro: number;
    exchangeRate: number;
    date: string;
  }) => {
    await api.createExpense(data);
    showToast('Frais général ajouté avec succès');
    await loadData();
  };

  const handleUpdateExpense = async (
    id: string,
    data: {
      description: string;
      amountEuro: number;
      exchangeRate: number;
      date: string;
    }
  ) => {
    await api.updateExpense(id, data);
    showToast('Frais général mis à jour');
    await loadData();
  };

  const handleDeleteExpenseClick = async (id: string) => {
    setDeleteTarget({
      type: 'expense',
      id,
      title: 'Supprimer ce frais ?',
      message: 'Voulez-vous vraiment supprimer ce frais général ?',
    });
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'order') {
        await api.deleteOrder(deleteTarget.id);
        showToast('Commande supprimée avec succès');
      } else {
        await api.deleteExpense(deleteTarget.id);
        showToast('Frais supprimé avec succès');
      }
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // If user is not authenticated, display login screen
  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 antialiased font-sans flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <ScudropLogo size={42} showText={true} />
            <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#001cd6] border border-blue-200">
              Dashboard Unique
            </span>
          </div>

          {/* Status Indicators & Main Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Exchange Rate Indicator */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600"
              title="Taux de référence pour conversion EUR / TND"
            >
              <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
              <span>
                1 € ≈ <strong>3.350 TND</strong>
              </span>
            </div>

            {/* DB Status Badge */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600"
              title={
                isMongo
                  ? 'Connecté à MongoDB via Mongoose'
                  : 'Mode stockage persistant actif (data/scudrop-db.json)'
              }
            >
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">
                {isMongo ? 'MongoDB Connecté' : 'Stockage Persistant'}
              </span>
            </div>

            {/* Decoupled Deployment Guide Button */}
            <button
              id="btn-open-deployment-guide"
              onClick={() => setIsDeploymentModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#001cd6] border border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Guide d'architecture et déploiement séparé frontend/backend"
            >
              <Server className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déploiement Découplé</span>
            </button>

            {/* Refresh Button */}
            <button
              id="btn-refresh-data"
              onClick={loadData}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Main Action: New Order */}
            <button
              id="btn-header-add-order"
              onClick={handleOpenCreateOrder}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#001cd6] hover:bg-[#0017b8] text-white rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle Commande</span>
              <span className="sm:hidden">Ajouter</span>
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center pl-2 border-l border-slate-200 gap-2">
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                title={currentUser.email}
              >
                <div className="w-5 h-5 rounded-full bg-[#001cd6] text-white flex items-center justify-center text-[10px] font-bold">
                  S
                </div>
                <span className="max-w-[130px] truncate text-[11px] font-semibold">
                  {currentUser.email}
                </span>
              </div>
              <button
                id="btn-logout"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast notifications */}
        {successToast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium animate-bounce-short">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="font-bold underline hover:no-underline cursor-pointer"
            >
              Ignorer
            </button>
          </div>
        )}

        {/* Date Filter Bar (Par jour / semaine / mois / période) */}
        <DateFilterBar
          currentFilter={dateFilter}
          onFilterChange={setDateFilter}
          ordersCount={filteredOrdersByDate.length}
          expensesCount={filteredExpensesByDate.length}
        />

        {/* Section A: Global Summary KPI Cards (Top Banner) */}
        <section id="section-kpis" aria-label="Indicateurs de performance">
          <KPICards
            kpis={activeKPIs}
            periodLabel={dateFilter.mode === 'all' ? undefined : dateFilter.label}
          />
        </section>

        {/* Section B: Orders Section (Partie Demandes) */}
        <section id="section-orders" aria-label="Partie Demandes">
          <OrdersTable
            orders={filteredOrdersByDate}
            onOpenCreate={handleOpenCreateOrder}
            onEdit={handleEditOrder}
            onDelete={handleDeleteOrderClick}
            onViewScreenshot={(order) => setLightboxOrder(order)}
            onToggleStatus={handleToggleOrderStatus}
            filterClient={filterClient}
            onClearClientFilter={() => setFilterClient(null)}
          />
        </section>

        {/* Dual Grid: Section C (General Expenses) + Section D (Clients Overview) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section C: General Expenses Section (Partie Frais Généraux) */}
          <section id="section-expenses" aria-label="Partie Frais Généraux">
            <ExpensesSection
              expenses={filteredExpensesByDate}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpenseClick}
            />
          </section>

          {/* Section D: Clients Overview Section (Partie Clients) */}
          <section id="section-clients" aria-label="Partie Clients">
            <ClientsTable
              clients={clients}
              onSelectClient={(clientName) => {
                setFilterClient(clientName);
                // Smooth scroll to orders section
                document
                  .getElementById('section-orders')
                  ?.scrollIntoView({ behavior: 'smooth' });
                showToast(`Filtrage actif pour le client : ${clientName}`);
              }}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Scudrop</span>
            <span>— Plateforme de gestion des commandes, devises, frais & clients</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Express • Mongoose / MongoDB • Multer • React • Tailwind CSS
          </div>
        </div>
      </footer>

      {/* Order Creation / Edit Modal */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setOrderToEdit(null);
        }}
        onSubmit={handleSubmitOrder}
        orderToEdit={orderToEdit}
      />

      {/* Screenshot Lightbox Modal */}
      <ImageLightboxModal
        order={lightboxOrder}
        onClose={() => setLightboxOrder(null)}
      />

      {/* Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title || ''}
        message={deleteTarget?.message || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      {/* Decoupled Architecture & Deployment Modal */}
      <DeploymentModal
        isOpen={isDeploymentModalOpen}
        onClose={() => setIsDeploymentModalOpen(false)}
      />
    </div>
  );
}

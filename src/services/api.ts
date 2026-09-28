import { getApiUrl } from '../config/api';
import { Order, Expense, GlobalKPIs, ClientSummary, DeliveryStatus } from '../types';

export interface DashboardStatsResponse {
  kpis: GlobalKPIs;
  clients: ClientSummary[];
  isMongo: boolean;
}

export type DashboardData = DashboardStatsResponse;

// ---------------- ORDERS API ----------------

export async function getOrders(search?: string, status?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'Tous') params.append('status', status);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(getApiUrl(`/api/orders${query}`));
  if (!res.ok) throw new Error('Échec du chargement des commandes');
  return res.json();
}

export async function createOrder(formData: FormData): Promise<Order> {
  const res = await fetch(getApiUrl('/api/orders'), {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Échec de la création de la commande');
  }
  return res.json();
}

export async function updateOrder(id: string, formData: FormData): Promise<Order> {
  const res = await fetch(getApiUrl(`/api/orders/${id}`), {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Échec de la mise à jour de la commande');
  }
  return res.json();
}

export async function updateOrderStatus(id: string, status: DeliveryStatus): Promise<Order> {
  const res = await fetch(getApiUrl(`/api/orders/${id}/status`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliveryStatus: status }),
  });
  if (!res.ok) throw new Error('Échec du changement de statut');
  return res.json();
}

export async function deleteOrder(id: string): Promise<void> {
  const res = await fetch(getApiUrl(`/api/orders/${id}`), {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Échec de la suppression de la commande');
}

// ---------------- EXPENSES API ----------------

export async function getExpenses(): Promise<Expense[]> {
  const res = await fetch(getApiUrl('/api/expenses'));
  if (!res.ok) throw new Error('Échec du chargement des frais généraux');
  return res.json();
}

export async function createExpense(data: {
  description: string;
  amountEuro: number;
  exchangeRate: number;
  date?: string;
}): Promise<Expense> {
  const res = await fetch(getApiUrl('/api/expenses'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Échec de l'ajout du frais");
  }
  return res.json();
}

export async function updateExpense(
  id: string,
  data: {
    description: string;
    amountEuro: number;
    exchangeRate: number;
    date?: string;
  }
): Promise<Expense> {
  const res = await fetch(getApiUrl(`/api/expenses/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Échec de la mise à jour du frais');
  }
  return res.json();
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(getApiUrl(`/api/expenses/${id}`), {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Échec de la suppression du frais');
}

// ---------------- AUTH API ----------------

export interface AuthUser {
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(getApiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Échec de connexion');
  }
  return res.json();
}

// ---------------- STATS API ----------------

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const res = await fetch(getApiUrl('/api/stats/dashboard'));
  if (!res.ok) throw new Error('Échec du chargement des statistiques');
  return res.json();
}

// Consolidated api helper for backwards compatibility and clean calling
export const api = {
  login,
  getDashboard: getDashboardStats,
  getOrders,
  createOrder,
  updateOrder,
  toggleOrderStatus: updateOrderStatus,
  deleteOrder,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};

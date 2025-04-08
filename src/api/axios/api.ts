import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}`;

// Create an axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Check network status
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Auth API
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/users', { email, password });
  return response.data;
};

export const registerUser = async (email: string, password: string, name: string) => {
  const response = await api.post('/users', { email, password, name });
  return response.data;
};

// Transactions API
export const getTransactions = async (params?: {
  userId?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) => {
  const response = await api.get('/transactions', { params });
  return response.data;
};

export const getTransaction = async (id: number) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

export const createTransaction = async (transaction: {
  userId: number;
  type: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}) => {
  const response = await api.post('/transactions', transaction);
  return response.data;
};

export const updateTransaction = async (
  id: number,
  transaction: {
    userId?: number;
    type?: string;
    category?: string;
    amount?: number;
    date?: string;
    description?: string;
  }
) => {
  const response = await api.put(`/transactions/${id}`, transaction);
  return response.data;
};

export const deleteTransaction = async (id: number) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// Budgets API
export const getBudgets = async (params?: { userId?: number }) => {
  const response = await api.get('/budgets', { params });
  return response.data;
};

export const getBudget = async (id: number) => {
  const response = await api.get(`/budgets/${id}`);
  return response.data;
};

export const createBudget = async (budget: {
  userId: number;
  category: string;
  limit: number;
  period: string;
}) => {
  const response = await api.post('/budgets', budget);
  return response.data;
};

export const updateBudget = async (
  id: number,
  budget: {
    userId?: number;
    category?: string;
    limit?: number;
    period?: string;
  }
) => {
  const response = await api.put(`/budgets/${id}`, budget);
  return response.data;
};

export const deleteBudget = async (id: number) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};

export default api; 
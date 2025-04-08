import axios from 'axios';
import { apiBaseUrl } from '../../config';

const isJsonServer = apiBaseUrl.includes('localhost:3001');

const API_URL = apiBaseUrl;

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
  try {
    if (isJsonServer) {
      const response = await api.get('/users', { params: { email, password } });
      if (response.data && response.data.length > 0) {
        return { user: response.data[0], token: 'fake-jwt-token' };
      }
      throw new Error('Invalid credentials');
    } else {
      // MirageJS implementation
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const loginWithGoogle = async (credential: string) => {
  try {
    if (isJsonServer) {

      const mockUser = {
        id: `google-${Date.now()}`,
        email: 'google-user@example.com', // ( hien tai chua co time lay token )
        firstName: 'Google',
        lastName: 'User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return { user: mockUser, token: 'fake-google-jwt-token' };
    } else {
      // MirageJS implementation
      const response = await api.post('/auth/google', { credential });
      return response.data;
    }
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

export const registerUser = async (email: string, password: string, name: string) => {
  try {
    if (isJsonServer) {
      const existingUsers = await api.get('/users', { params: { email } });
      if (existingUsers.data && existingUsers.data.length > 0) {
        throw new Error('User already exists');
      }
      
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const response = await api.post('/users', { 
        email, 
        password, 
        name,
        firstName,
        lastName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return { user: response.data, token: 'fake-jwt-token' };
    } else {
      // MirageJS implementation
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        name,
        firstName: name.split(' ')[0] || '',
        lastName: name.split(' ').slice(1).join(' ') || ''
      });
      return response.data;
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
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
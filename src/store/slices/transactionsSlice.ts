import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { apiBaseUrl } from '../../config';
import { Transaction, TransactionSearchParams, initialState } from '../../utils/transactions';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (userId: string | number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiBaseUrl}/transactions?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const searchTransactions = createAsyncThunk(
  'transactions/searchTransactions',
  async (searchParams: TransactionSearchParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`${apiBaseUrl}/transactions/search?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to search transactions');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
    { rejectWithValue }
  ) => {
    try {
      console.log('Creating transaction with data:', transaction);
      
      const transactionData = {
        ...transaction,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Sending transaction data to API:', transactionData);
      
      const response = await fetch(`${apiBaseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create transaction:', errorText);
        throw new Error(`Failed to create transaction: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Transaction created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createTransaction thunk:', error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async (
    { id, transaction }: { id: string; transaction: Partial<Transaction> },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${apiBaseUrl}/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transaction,
          updatedAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiBaseUrl}/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    resetTransactions: (state) => {
      state.transactions = [];
      state.status = 'idle';
      state.error = null;
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.status = 'succeeded';
        state.transactions = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      .addCase(searchTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchTransactions.fulfilled, (state, action: PayloadAction<{
        transactions: Transaction[];
        totalCount: number;
      }>) => {
        state.status = 'succeeded';
        state.transactions = action.payload.transactions;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(searchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.transactions.push(action.payload);
        state.totalCount += 1;
      })
      
      .addCase(updateTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        const index = state.transactions.findIndex(
          (transaction) => transaction.id === action.payload.id
        );
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      
      .addCase(deleteTransaction.fulfilled, (state, action: PayloadAction<string>) => {
        state.transactions = state.transactions.filter(
          (transaction) => transaction.id !== action.payload
        );
        state.totalCount -= 1;
      });
  },
});

export const { resetTransactions } = transactionsSlice.actions;

export const selectAllTransactions = (state: RootState) => state.transactions.transactions;
export const selectTransactionStatus = (state: RootState) => state.transactions.status;
export const selectTransactionError = (state: RootState) => state.transactions.error;
export const selectTransactionCount = (state: RootState) => state.transactions.totalCount;

export default transactionsSlice.reducer; 
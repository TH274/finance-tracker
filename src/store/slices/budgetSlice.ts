import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { apiBaseUrl } from '../../config';
import { Budget, initialState } from '../../utils/budget';

// Fetch budgets for the current user
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchAll',
  async (userId: string | number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiBaseUrl}/budgets?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error instanceof Error ? error.message : 'Failed to fetch budgets'));
    }
  }
);

// Create a new budget
export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiBaseUrl}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...budget,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create budget');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Update an existing budget
export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async (
    { id, budget }: { id: string; budget: Partial<Budget> },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${apiBaseUrl}/budgets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...budget,
          updatedAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update budget');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Delete a budget
export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiBaseUrl}/budgets/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    resetBudgets: (state) => {
      state.budgets = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBudgets.fulfilled, (state, action: PayloadAction<Budget[]>) => {
        state.status = 'succeeded';
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Create budget
      .addCase(createBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        state.budgets.push(action.payload);
      })
      
      // Update budget
      .addCase(updateBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        const index = state.budgets.findIndex((budget) => budget.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      
      // Delete budget
      .addCase(deleteBudget.fulfilled, (state, action: PayloadAction<string>) => {
        state.budgets = state.budgets.filter((budget) => budget.id !== action.payload);
      });
  },
});

export const { resetBudgets } = budgetSlice.actions;

export const selectAllBudgets = (state: RootState) => state.budgets.budgets;
export const selectBudgetStatus = (state: RootState) => state.budgets.status;
export const selectBudgetError = (state: RootState) => state.budgets.error;

export default budgetSlice.reducer; 
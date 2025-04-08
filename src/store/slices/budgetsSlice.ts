import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
} from '../../api/axios/api';
import { Budget, BudgetUpdate, NewBudget, initialState } from '../../utils/budgets';

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchAll',
  async (params: { userId?: number } | undefined = undefined, { rejectWithValue }) => {
    try {
      const budgets = await getBudgets(params);
      return budgets;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch budgets');
    }
  }
);

export const fetchBudget = createAsyncThunk(
  'budgets/fetchOne',
  async (id: number, { rejectWithValue }) => {
    try {
      const budget = await getBudget(id);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch budget');
    }
  }
);

export const addBudget = createAsyncThunk(
  'budgets/add',
  async (budget: NewBudget, { rejectWithValue }) => {
    try {
      const newBudget = await createBudget(budget);
      return newBudget;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add budget');
    }
  }
);

export const editBudget = createAsyncThunk(
  'budgets/edit',
  async ({ id, budget }: { id: number; budget: BudgetUpdate }, { rejectWithValue }) => {
    try {
      const updatedBudget = await updateBudget(id, budget);
      return updatedBudget;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update budget');
    }
  }
);

export const removeBudget = createAsyncThunk(
  'budgets/remove',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteBudget(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete budget');
    }
  }
);

// Create budgets slice
const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearCurrentBudget: (state) => {
      state.currentBudget = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch budgets
    builder.addCase(fetchBudgets.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBudgets.fulfilled, (state, action: PayloadAction<Budget[]>) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchBudgets.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch single budget
    builder.addCase(fetchBudget.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
      state.isLoading = false;
      state.currentBudget = action.payload;
    });
    builder.addCase(fetchBudget.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add budget
    builder.addCase(addBudget.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
      state.isLoading = false;
      state.items.push(action.payload);
    });
    builder.addCase(addBudget.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Edit budget
    builder.addCase(editBudget.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(editBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
      state.isLoading = false;
      const index = state.items.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentBudget?.id === action.payload.id) {
        state.currentBudget = action.payload;
      }
    });
    builder.addCase(editBudget.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Remove budget
    builder.addCase(removeBudget.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(removeBudget.fulfilled, (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      state.items = state.items.filter((b) => b.id !== action.payload);
      if (state.currentBudget?.id === action.payload) {
        state.currentBudget = null;
      }
    });
    builder.addCase(removeBudget.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { clearCurrentBudget, clearError } = budgetsSlice.actions;
export default budgetsSlice.reducer; 
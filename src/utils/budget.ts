export interface Budget {
    id: string;
    userId: string;
    category: string;
    limit: number;
    period: string; 
    createdAt: string;
    updatedAt: string;
  }
  
  export interface BudgetState {
    budgets: Budget[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  }
  
  export const initialState: BudgetState = {
    budgets: [],
    status: 'idle',
    error: null,
  };
  
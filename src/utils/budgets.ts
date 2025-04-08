import { Budget } from "./budget";
  // Define new budget without ID
  export interface NewBudget {
    userId: number;
    category: string;
    limit: number;
    period: string;
  }
  
  // Define budget update interface
  export interface BudgetUpdate {
    userId?: number;
    category?: string;
    limit?: number;
    period?: string;
  }
  
  // Define budgets state interface
  export interface BudgetsState {
    items: Budget[];
    currentBudget: Budget | null;
    isLoading: boolean;
    error: string | null;
  }
  
  // Initial state
  export const initialState: BudgetsState = {
    items: [],
    currentBudget: null,
    isLoading: false,
    error: null,
  };
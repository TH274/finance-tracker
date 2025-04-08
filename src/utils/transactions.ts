export interface Transaction {
    id: string;
    userId: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface TransactionSearchParams {
    userId: string;
    startDate?: string;
    endDate?: string;
    type?: 'income' | 'expense';
    category?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
  }
  
  export interface TransactionsState {
    transactions: Transaction[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    totalCount: number;
  }
  
  export const initialState: TransactionsState = {
    transactions: [],
    status: 'idle',
    error: null,
    totalCount: 0
  };
  
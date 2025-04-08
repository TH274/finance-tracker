import { useMemo } from 'react';
import { Transaction } from '../utils/transactions';
import { Budget } from '../utils/budget';

export interface BudgetWarning {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
}

/**
 * Custom hook that processes transactions and budgets to return budget warnings
 * @param transactions Array of transactions
 * @param budgets Array of budgets
 * @returns Array of budget warnings
 */
const useBudgetWarning = (
  transactions: Transaction[],
  budgets: Budget[]
): BudgetWarning[] => {
  return useMemo(() => {
    if (!transactions.length || !budgets.length) {
      return [];
    }

    // Get the current date
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter transactions for the current month
    const currentMonthTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear &&
        transaction.type === 'expense'
      );
    });

    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {};
    currentMonthTransactions.forEach(transaction => {
      if (!spendingByCategory[transaction.category]) {
        spendingByCategory[transaction.category] = 0;
      }
      spendingByCategory[transaction.category] += transaction.amount;
    });

    // Create budget warnings
    const warnings: BudgetWarning[] = budgets.map(budget => {
      const spent = spendingByCategory[budget.category] || 0;
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      const remaining = budget.limit - spent;
      const isOverBudget = remaining < 0;

      return {
        category: budget.category,
        limit: budget.limit,
        spent,
        percentage,
        remaining,
        isOverBudget,
      };
    });

    // Sort warnings by percentage descending
    return warnings.sort((a, b) => b.percentage - a.percentage);
  }, [transactions, budgets]);
};

export default useBudgetWarning; 
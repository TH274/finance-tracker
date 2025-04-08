import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Transaction } from '../../utils/transactions';

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

// Get month name in short format
const getMonthName = (month: number): string => {
  const date = new Date();
  date.setMonth(month);
  return date.toLocaleString('default', { month: 'short' });
};

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ transactions }) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Process chart data
  const chartData = useMemo(() => {
    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const months: { name: string; income: number; expenses: number; month: number; year: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      // Calculate month and year
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      
      // Add month to array
      months.push({
        name: `${getMonthName(month)} ${year !== currentYear ? year : ''}`,
        income: 0,
        expenses: 0,
        month,
        year
      });
    }
    
    // Calculate income and expenses for each month
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      // Find matching month in our data
      const monthData = months.find(m => m.month === month && m.year === year);
      
      if (monthData) {
        if (transaction.type === 'income') {
          monthData.income += transaction.amount;
        } else if (transaction.type === 'expense') {
          monthData.expenses += transaction.amount;
        }
      }
    });
    
    return months;
  }, [transactions]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const income = payload[0].value as number;
      const expenses = payload[1].value as number;
      const net = income - expenses;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
          <p className="text-sm text-success-600 dark:text-success-400">
            Income: {formatCurrency(income)}
          </p>
          <p className="text-sm text-danger-600 dark:text-danger-400">
            Expenses: {formatCurrency(expenses)}
          </p>
          <p className={`text-sm font-medium mt-1 ${
            net >= 0 
              ? 'text-success-600 dark:text-success-400' 
              : 'text-danger-600 dark:text-danger-400'
          }`}>
            Net: {formatCurrency(net)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">No transaction data available</p>
        <p className="text-sm max-w-md text-center">
          Add some transactions to see your income and expenses over time.
        </p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#10b981" />
          <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
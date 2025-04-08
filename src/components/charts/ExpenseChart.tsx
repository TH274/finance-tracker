import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  TooltipProps
} from 'recharts';
import { Transaction } from '../../utils/transactions';
import { COLORS } from '../../contains/colors';

interface ExpenseChartProps {
  transactions: Transaction[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions }) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Process data for chart
  const chartData = useMemo(() => {
    // Filter expenses from current month
    const currentMonthExpenses = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return (
        transaction.type === 'expense' &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });
    
    // Group by category
    const expensesByCategory: Record<string, number> = {};
    
    currentMonthExpenses.forEach(transaction => {
      const { category, amount } = transaction;
      expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
    });
    
    // Convert to chart format and sort by amount
    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, currentMonth, currentYear]);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Amount: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {percentage}% of expenses
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom legend renderer
  const renderLegend = (props: any) => {
    const { payload } = props;
    const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <ul className="flex flex-col gap-2 text-sm">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / totalExpenses) * 100).toFixed(1);
          return (
            <li key={`item-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {entry.value} ({formatCurrency(entry.payload.value)} - {percentage}%)
              </span>
            </li>
          );
        })}
      </ul>
    );
  };
  
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">No expense data available</p>
        <p className="text-sm max-w-md text-center">
          Add some expenses to see your spending distribution by category.
        </p>
      </div>
    );
  }
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart; 
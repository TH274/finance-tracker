import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface BudgetChartProps {
  budgets: Array<{
    category: string;
    limit: number;
    spent: number;
    percentage: number;
    remaining: number;
    isOverBudget: boolean;
  }>;
}

const BudgetChart: React.FC<BudgetChartProps> = ({ budgets }) => {
  const getColorForBudget = (budget: BudgetChartProps['budgets'][0]) => {
    if (budget.isOverBudget) return '#ef4444';
    if (budget.percentage >= 90) return '#f97316';
    if (budget.percentage >= 75) return '#eab308';
    return '#22c55e';
  };
  
  const chartData = useMemo(() => {
    return budgets.map(budget => ({
      name: budget.category,
      value: budget.spent,
      limit: budget.limit,
      percentage: budget.percentage,
      color: getColorForBudget(budget)
    }));
  }, [budgets]);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 shadow-md rounded-md border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-gray-700 dark:text-gray-300">{`Spent: $${data.value.toLocaleString()}`}</p>
          <p className="text-gray-700 dark:text-gray-300">{`Budget: $${data.limit.toLocaleString()}`}</p>
          <p className="text-gray-700 dark:text-gray-300">{`${data.percentage.toFixed(0)}% of budget`}</p>
        </div>
      );
    }
    
    return null;
  };
  
  // Custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center mt-4 gap-3">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center">
            <div 
              style={{ backgroundColor: entry.color }}
              className="w-3 h-3 rounded-full mr-2"
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };
  
  if (budgets.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No budget data available</p>
      </div>
    );
  }
  
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BudgetChart;

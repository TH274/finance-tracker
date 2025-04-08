import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { RootState } from '../../store/store';
import { 
  fetchBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget
} from '../../store/slices/budgetSlice';
import { fetchTransactions } from '../../store/slices/transactionsSlice';
import useBudgetWarning, { BudgetWarning } from '../../hooks/useBudgetWarning';
import { Budget } from '../../utils/budget';

// Common categories for budgets
const commonCategories = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Housing',
  'Utilities',
  'Health & Medical',
  'Shopping',
  'Personal Care',
  'Travel',
  'Education',
  'Gifts & Donations',
  'Investments',
  'Miscellaneous'
];

const BudgetPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { budgets, status } = useSelector((state: RootState) => state.budgets);
  const { transactions } = useSelector((state: RootState) => state.transactions);
  
  // States for budget form
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [currentBudget, setCurrentBudget] = useState<Partial<Budget> | null>(null);
  
  // Get budget warnings
  const budgetWarnings = useBudgetWarning(transactions, budgets);
  
  // Total budget stats
  const totalBudgetStats = useMemo(() => {
    if (budgetWarnings.length === 0) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        percentage: 0,
        remaining: 0,
        isOverBudget: false,
      };
    }
    
    const totalBudget = budgetWarnings.reduce((sum, warning) => sum + warning.limit, 0);
    const totalSpent = budgetWarnings.reduce((sum, warning) => sum + warning.spent, 0);
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const remaining = totalBudget - totalSpent;
    const isOverBudget = remaining < 0;
    
    return {
      totalBudget,
      totalSpent,
      percentage,
      remaining,
      isOverBudget,
    };
  }, [budgetWarnings]);
  
  // Fetch data on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchBudgets(user.id) as any);
      dispatch(fetchTransactions(user.id) as any);
    }
  }, [dispatch, user]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Handle form submit for adding/editing budgets
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentBudget || !user?.id) return;
    
    try {
      if (formMode === 'add') {
        await dispatch(createBudget({
          ...currentBudget,
          userId: user.id,
          period: 'monthly', // Default to monthly budgets
        } as any) as any);
      } else {
        if (!currentBudget.id) return;
        
        await dispatch(updateBudget({
          id: currentBudget.id,
          budget: currentBudget,
        } as any) as any);
      }
      
      // Reset form and state
      setShowForm(false);
      setCurrentBudget(null);
    } catch (error) {
      console.error('Error submitting budget:', error);
    }
  };
  
  // Handle budget deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await dispatch(deleteBudget(id) as any);
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };
  
  // Open edit form
  const handleEdit = (budget: Budget) => {
    setCurrentBudget(budget);
    setFormMode('edit');
    setShowForm(true);
  };
  
  // Open add form
  const handleAdd = () => {
    setCurrentBudget({
      category: '',
      limit: 0,
      period: 'monthly',
    });
    setFormMode('add');
    setShowForm(true);
  };
  
  // Get color class based on percentage
  const getColorClass = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-danger-500 dark:bg-danger-600';
    if (percentage >= 90) return 'bg-warning-500 dark:bg-warning-600';
    return 'bg-success-500 dark:bg-success-600';
  };
  
  // Get status text based on percentage
  const getStatusText = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'Over Budget';
    if (percentage >= 90) return 'Almost Reached';
    if (percentage >= 75) return 'Getting Close';
    if (percentage >= 50) return 'Halfway There';
    return 'On Track';
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  return (
    <motion.div
      className="p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="flex justify-between items-center mb-6"
        variants={itemVariants}
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Budget Management</h1>
        <button
          onClick={handleAdd}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Set New Budget
        </button>
      </motion.div>
      
      {/* Overall Budget Summary */}
      <motion.div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700"
        variants={itemVariants}
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Monthly Budget Overview</h2>
        
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalBudgetStats.totalBudget)}</p>
          </div>
          
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalBudgetStats.totalSpent)}</p>
          </div>
          
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
            <p className={`text-2xl font-bold ${totalBudgetStats.isOverBudget ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400'}`}>
              {formatCurrency(totalBudgetStats.remaining)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalBudgetStats.percentage.toFixed(0)}%</p>
          </div>
        </div>
        
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColorClass(totalBudgetStats.percentage, totalBudgetStats.isOverBudget)}`}
            style={{ width: `${Math.min(100, totalBudgetStats.percentage)}%` }}
          ></div>
        </div>
        
        <div className="mt-2 text-right">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            totalBudgetStats.isOverBudget ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300' : 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300'
          }`}>
            {getStatusText(totalBudgetStats.percentage, totalBudgetStats.isOverBudget)}
          </span>
        </div>
      </motion.div>
      
      {/* Budget Categories */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        variants={itemVariants}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Budget Categories</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Set and manage your monthly spending limits by category.</p>
        </div>
        
        {status === 'loading' ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : budgetWarnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <AlertTriangle className="h-12 w-12 mb-2" />
            <p className="text-lg mb-2">No budgets set up yet</p>
            <p className="text-sm max-w-md text-center mb-4">
              Create budget categories to track your spending limits and monitor your financial goals.
            </p>
            <button
              onClick={handleAdd}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={16} />
              Set Your First Budget
            </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="p-4 space-y-4">
              {budgetWarnings.map((warning: BudgetWarning) => {
                const budget = budgets.find(b => b.category === warning.category);
                if (!budget) return null;
                
                return (
                  <div key={budget.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                      <div className="mb-2 md:mb-0">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{warning.category}</h3>
                          {warning.isOverBudget && (
                            <span className="ml-2 inline-flex items-center p-1 rounded-full bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300">
                              <AlertTriangle size={16} />
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(warning.spent)} of {formatCurrency(warning.limit)} ({warning.percentage.toFixed(0)}%)
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Edit size={18} />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300"
                        >
                          <Trash2 size={18} />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getColorClass(warning.percentage, warning.isOverBudget)}`}
                        style={{ width: `${Math.min(100, warning.percentage)}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-2 flex justify-between text-sm">
                      <span className={warning.isOverBudget ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400'}>
                        {warning.isOverBudget
                          ? `${formatCurrency(Math.abs(warning.remaining))} over budget`
                          : `${formatCurrency(warning.remaining)} remaining`}
                      </span>
                      <span className={`${
                        warning.isOverBudget
                          ? 'text-danger-600 dark:text-danger-400'
                          : warning.percentage >= 75
                          ? 'text-warning-600 dark:text-warning-400'
                          : 'text-success-600 dark:text-success-400'
                      }`}>
                        {getStatusText(warning.percentage, warning.isOverBudget)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Budget Form Modal */}
      {showForm && currentBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {formMode === 'add' ? 'Set New Budget' : 'Edit Budget'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                {formMode === 'add' ? (
                  <div className="flex flex-col space-y-2">
                    <select
                      value={currentBudget.category}
                      onChange={(e) => setCurrentBudget({...currentBudget, category: e.target.value})}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a category</option>
                      {commonCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                      <option value="custom">Add Custom Category</option>
                    </select>
                    
                    {currentBudget.category === 'custom' && (
                      <input
                        type="text"
                        placeholder="Enter custom category"
                        onChange={(e) => setCurrentBudget({...currentBudget, category: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={currentBudget.category}
                    onChange={(e) => setCurrentBudget({...currentBudget, category: e.target.value})}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    readOnly={formMode === 'edit'}
                  />
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Limit</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">$</span>
                  </div>
                  <input
                    type="number"
                    value={currentBudget.limit}
                    onChange={(e) => setCurrentBudget({...currentBudget, limit: parseFloat(e.target.value)})}
                    className="w-full pl-7 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Set the monthly spending limit for this category.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setCurrentBudget(null);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none"
                >
                  {formMode === 'add' ? 'Create Budget' : 'Update Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BudgetPage; 
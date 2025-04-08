import React, { useState, useEffect, lazy, Suspense, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '../../store/store';
import { fetchTransactions } from '../../store/slices/transactionsSlice';
import { fetchBudgets } from '../../store/slices/budgetSlice';
import useBudgetWarning from '../../hooks/useBudgetWarning';
import { ArrowUpIcon, ArrowDownIcon, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../../store/slices/authSlice';

// Lazy load
const ExpenseChart = lazy(() => import('../../components/charts/ExpenseChart'));
const IncomeExpenseChart = lazy(() => import('../../components/charts/IncomeExpenseChart'));
const BudgetChart = lazy(() => import('../../components/charts/BudgetChart'));

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { transactions } = useSelector((state: RootState) => state.transactions);
  const { budgets } = useSelector((state: RootState) => state.budgets);
  const [isLoading, setIsLoading] = useState(true);
  const dataLogged = useRef(false);

  // Authentication check
  useEffect(() => {
    let isMounted = true;
    
    if (!isAuthenticated && isMounted) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
    }
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);

  // Fetch user profile if authenticated but no user data
  useEffect(() => {
    let isMounted = true;
    
    const fetchProfile = async () => {
      if (isAuthenticated && !user && isMounted) {
        console.log('Authenticated but no user data, fetching profile');
        await dispatch(fetchUserProfile() as any);
      }
    };
    
    fetchProfile();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, dispatch]);

  // Fetch data on component mount
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('Dashboard - Auth user:', user);
        if (user?.id) {
          console.log('Dashboard - Fetching transactions and budgets for user ID:', user.id);
          await Promise.all([
            dispatch(fetchTransactions(user.id) as any),
            dispatch(fetchBudgets(user.id) as any)
          ]);
          if (isMounted) {
            console.log('Dashboard - Fetching completed');
          }
        } else if (isAuthenticated) {
          console.log('User is authenticated but ID not available, waiting for profile');
        } else {
          console.error('Not authenticated, cannot fetch data');
          if (isMounted) {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (isMounted && (user?.id || !isAuthenticated)) {
          setIsLoading(false);
        }
      }
    };
    fetchData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [dispatch, user?.id, isAuthenticated, navigate]);

  // Log data on mount and when data changes significantly
  useEffect(() => {
    // Only log if we haven't logged before or if the data has actually changed in a meaningful way
    if (!dataLogged.current || 
        (transactions.length > 0 && budgets.length > 0)) {
      console.log('Dashboard - Transactions:', transactions);
      console.log('Dashboard - Budgets:', budgets);
      dataLogged.current = true;
    }
  }, [transactions.length, budgets.length]);

  const budgetWarnings = useBudgetWarning(transactions, budgets);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate financial summary
  const summary = useMemo(() => {
    // Filter current month's transactions
    const currentMonthTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });
    
    // Calculate total income
    const totalIncome = currentMonthTransactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Calculate total expenses
    const totalExpenses = currentMonthTransactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Calculate savings
    const savings = totalIncome - totalExpenses;
    
    // Calculate savings rate (as percentage of income)
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    
    return {
      totalIncome,
      totalExpenses,
      savings,
      savingsRate,
    };
  }, [transactions, currentMonth, currentYear]);

  // Get budget warnings that need attention
  const importantWarnings = useMemo(() => {
    return budgetWarnings
      .filter(warning => warning.percentage >= 75)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }, [budgetWarnings]);

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

  const chartFallback = (
    <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="animate-pulse text-primary-600 dark:text-primary-400">Loading chart...</div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Convert budgetWarnings to format expected by BudgetChart
  const budgetChartData = budgetWarnings.map(warning => ({
    category: warning.category,
    limit: warning.limit,
    spent: warning.spent,
    percentage: warning.percentage,
    remaining: warning.remaining,
    isOverBudget: warning.isOverBudget
  }));

  return (
    <motion.div
      className="p-6 text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-900 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-2xl font-bold mb-6"
        variants={itemVariants}
      >
        Financial Dashboard
      </motion.h1>

      {/* Summary cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={itemVariants}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Income</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {formatCurrency(summary.totalIncome)}
          </p>
          <div className="flex items-center mt-2">
            <ArrowUpIcon className="h-4 w-4 text-success-500 mr-1" />
            <span className="text-xs text-success-600 dark:text-success-400">+15% from last month</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Expenses</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {formatCurrency(summary.totalExpenses)}
          </p>
          <div className="flex items-center mt-2">
            <ArrowDownIcon className="h-4 w-4 text-danger-500 mr-1" />
            <span className="text-xs text-danger-600 dark:text-danger-400">+8% from last month</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Savings</h2>
          <p className={`text-2xl font-bold mt-1 ${
            summary.savings >= 0
              ? 'text-success-600 dark:text-success-400'
              : 'text-danger-600 dark:text-danger-400'
          }`}>
            {formatCurrency(summary.savings)}
          </p>
          <div className="flex items-center mt-2">
            {summary.savings >= 0 ? (
              <>
                <ArrowUpIcon className="h-4 w-4 text-success-500 mr-1" />
                <span className="text-xs text-success-600 dark:text-success-400">
                  {summary.savingsRate.toFixed(1)}% of income
                </span>
              </>
            ) : (
              <>
                <ArrowDownIcon className="h-4 w-4 text-danger-500 mr-1" />
                <span className="text-xs text-danger-600 dark:text-danger-400">
                  {Math.abs(summary.savingsRate).toFixed(1)}% overspent
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget Alerts</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {budgetWarnings.filter(w => w.isOverBudget).length}
          </p>
          <div className="flex items-center mt-2">
            {importantWarnings.length > 0 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-warning-500 mr-1" />
                <span className="text-xs text-warning-600 dark:text-warning-400">
                  {importantWarnings.length} categories need attention
                </span>
              </>
            ) : (
              <span className="text-xs text-success-600 dark:text-success-400">
                All budgets are on track
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
          variants={itemVariants}
        >
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Expense Breakdown
          </h3>
          <Suspense 
            fallback={
              <div className="h-64 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            }
          >
            <ExpenseChart transactions={transactions} />
          </Suspense>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
          variants={itemVariants}
        >
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Income vs Expenses (6 Months)
          </h3>
          <Suspense 
            fallback={
              <div className="h-64 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            }
          >
            <IncomeExpenseChart transactions={transactions} />
          </Suspense>
        </motion.div>
      </div>

      {/* Budget chart */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
        variants={itemVariants}
      >
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Budget Progress
        </h3>
        <Suspense 
          fallback={
            <div className="h-64 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          }
        >
          <BudgetChart budgets={budgetChartData} />
        </Suspense>
      </motion.div>

      {/* Budget warnings */}
      {importantWarnings.length > 0 && (
        <motion.div
          className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
          variants={itemVariants}
        >
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Budget Alerts
          </h3>
          <div className="space-y-3">
            {importantWarnings.map((warning) => (
              <div 
                key={warning.category}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800 dark:text-white">{warning.category}</h4>
                  <span 
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      warning.isOverBudget 
                        ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300' 
                        : warning.percentage >= 90
                        ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300'
                        : 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300'
                    }`}
                  >
                    {warning.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>{formatCurrency(warning.spent)} of {formatCurrency(warning.limit)}</span>
                  <span>
                    {warning.remaining >= 0 
                      ? `${formatCurrency(warning.remaining)} left` 
                      : `${formatCurrency(Math.abs(warning.remaining))} over`}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      warning.isOverBudget 
                        ? 'bg-danger-500' 
                        : warning.percentage >= 90
                        ? 'bg-warning-500'
                        : 'bg-success-500'
                    }`}
                    style={{ width: `${Math.min(100, warning.percentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard; 
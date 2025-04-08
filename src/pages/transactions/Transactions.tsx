import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, Filter, Search } from 'lucide-react';
import { RootState } from '../../store/store';
import { 
  fetchTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction
} from '../../store/slices/transactionsSlice';
import { Transaction } from '../../utils/transactions';
import useDebounce from '../../hooks/useDebounce';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../../store/slices/authSlice';
import { transactionTypes } from '../../contains/transactionType';

const TransactionsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { transactions, status } = useSelector((state: RootState) => state.transactions);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [currentTransaction, setCurrentTransaction] = useState<Partial<Transaction> | null>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchUserProfile() as any);
    }
  }, [isAuthenticated, user, dispatch]);
  
  useEffect(() => {
    if (user?.id) {
      console.log('Fetching transactions for user:', user.id);
      dispatch(fetchTransactions(user.id) as any);
    } else {
      console.log('Not fetching transactions - user ID not available');
    }
  }, [dispatch, user]);
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction: Transaction) => {
      if (typeFilter !== 'all' && transaction.type !== typeFilter) {
        return false;
      }
      
      // Date range filter
      if (dateRange.startDate && new Date(transaction.date) < new Date(dateRange.startDate)) {
        return false;
      }
      if (dateRange.endDate && new Date(transaction.date) > new Date(dateRange.endDate)) {
        return false;
      }
      
      // Search filter
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        return (
          transaction.description.toLowerCase().includes(searchLower) ||
          transaction.category.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [transactions, typeFilter, dateRange, debouncedSearchTerm]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Handle form submit for adding/editing transactions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      console.error('User not authenticated');
      alert('Your session has expired. Please log in again.');
      navigate('/login');
      return;
    }
    
    if (!user?.id) {
      console.error('User ID is missing. Attempting to reload user profile...');
      try {
        await dispatch(fetchUserProfile() as any);
        alert('Please try submitting the form again after your profile loads.');
        return;
      } catch (error) {
        console.error('Failed to reload user profile:', error);
        alert('Unable to verify your identity. Please log in again.');
        navigate('/login');
        return;
      }
    }
    
    if (!currentTransaction) {
      console.error('Current transaction data is missing');
      return;
    }
    
    console.log('Submitting transaction form:', { mode: formMode, transaction: currentTransaction, userId: user?.id });
    
    try {
      if (formMode === 'add') {
        const transactionData = {
          ...currentTransaction,
          userId: user.id,
        };
        console.log('Dispatching createTransaction with:', transactionData);
        const resultAction = await dispatch(createTransaction(transactionData as any) as any);
        console.log('createTransaction result:', resultAction);
        
        if (createTransaction.rejected.match(resultAction)) {
          console.error('Transaction creation failed:', resultAction.payload);
          // Display error to user
          alert(`Failed to create transaction: ${resultAction.payload}`);
          return;
        }
      } else {
        if (!currentTransaction.id) {
          console.error('Cannot edit: transaction ID is missing');
          return;
        }
        
        console.log('Dispatching updateTransaction with:', { id: currentTransaction.id, transaction: currentTransaction });
        const resultAction = await dispatch(updateTransaction({
          id: currentTransaction.id,
          transaction: currentTransaction,
        } as any) as any);
        console.log('updateTransaction result:', resultAction);
        
        if (updateTransaction.rejected.match(resultAction)) {
          console.error('Transaction update failed:', resultAction.payload);
          // Display error to user
          alert(`Failed to update transaction: ${resultAction.payload}`);
          return;
        }
      }
      
      // Reset form and state
      setShowForm(false);
      setCurrentTransaction(null);
      console.log('Transaction saved successfully');
    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert(`Error: ${(error as Error).message}`);
    }
  };
  
  // Handle transaction deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await dispatch(deleteTransaction(id) as any);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };
  
  // Open edit form
  const handleEdit = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setFormMode('edit');
    setShowForm(true);
  };
  
  // Open add form
  const handleAdd = () => {
    setCurrentTransaction({
      type: 'expense',
      category: '',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      description: '',
    });
    setFormMode('add');
    setShowForm(true);
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Transactions</h1>
        <button
          onClick={handleAdd}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </motion.div>
      
      {/* Filters and Search */}
      <motion.div 
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {transactionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by description or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Transactions List */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        variants={itemVariants}
      >
        {status === 'loading' ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <Filter className="h-12 w-12 mb-2" />
            <p className="text-lg">No transactions found matching your filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setDateRange({ startDate: '', endDate: '' });
              }}
              className="mt-2 text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction: Transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'income'
                            ? 'bg-success-100 text-success-800 dark:bg-success-800 dark:text-success-100'
                            : 'bg-danger-100 text-danger-800 dark:bg-danger-800 dark:text-danger-100'
                        }`}
                      >
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{transaction.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">{transaction.description}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === 'income' 
                        ? 'text-success-600 dark:text-success-400' 
                        : 'text-danger-600 dark:text-danger-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                      >
                        <Edit size={18} />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300"
                      >
                        <Trash2 size={18} />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      
      {/* Transaction Form Modal */}
      {showForm && currentTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {formMode === 'add' ? 'Add New Transaction' : 'Edit Transaction'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={currentTransaction.type}
                  onChange={(e) => setCurrentTransaction({...currentTransaction, type: e.target.value as 'income' | 'expense'})}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  value={currentTransaction.category}
                  onChange={(e) => setCurrentTransaction({...currentTransaction, category: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="E.g., Groceries, Salary, Bills, etc."
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  value={currentTransaction.amount}
                  onChange={(e) => setCurrentTransaction({...currentTransaction, amount: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={typeof currentTransaction.date === 'string' ? currentTransaction.date.slice(0, 10) : ''}
                  onChange={(e) => setCurrentTransaction({...currentTransaction, date: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={currentTransaction.description}
                  onChange={(e) => setCurrentTransaction({...currentTransaction, description: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Transaction description"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setCurrentTransaction(null);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none"
                >
                  {formMode === 'add' ? 'Add Transaction' : 'Update Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TransactionsPage; 
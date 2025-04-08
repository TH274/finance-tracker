import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { generateFinancialSummaryPDF } from '../../utils/pdfExport';
import { FileText } from 'lucide-react';
import useBudgetWarning from '../../hooks/useBudgetWarning';


const ReportExport: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { transactions } = useSelector((state: RootState) => state.transactions);
  const { budgets } = useSelector((state: RootState) => state.budgets);
  const budgetWarnings = useBudgetWarning(transactions, budgets);
  

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

  const handleExportFinancialSummary = () => {
    try {
      generateFinancialSummaryPDF(transactions, budgetWarnings, userName);
    } catch (error) {
      console.error('Error in financial summary export:', error);
      alert('Failed to generate PDF. Please check console for details.');
    }
  };

      
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        Export Reports
      </h3>
      
      <div className="space-y-4">
        <button
          onClick={handleExportFinancialSummary}
          className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition duration-150 ease-in-out"
        >
          <FileText className="w-5 h-5 mr-2" />
          Export Financial Summary (PDF)
        </button>
      </div>
    </div>
  );
};

export default ReportExport; 
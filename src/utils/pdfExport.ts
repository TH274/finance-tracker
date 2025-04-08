import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Transaction } from '../utils/transactions';
import { BudgetWarning } from '../hooks/useBudgetWarning';

// Format currency for PDF
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date for PDF
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Generate financial summary report
export const generateFinancialSummaryPDF = (
  transactions: Transaction[],
  budgetWarnings: BudgetWarning[],
  userName: string
): void => {
  try {
    const doc = new jsPDF();
    let yPosition = 95;
    
    const now = new Date();
    const reportDate = now.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    
    // Filter current month's transactions
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });
    
    // Calculate summary data
    const totalIncome = currentMonthTransactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const totalExpenses = currentMonthTransactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text('Financial Summary Report', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated for: ${userName}`, 14, 32);
    doc.text(`Report Date: ${reportDate}`, 14, 38);
    
    // Add summary section
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Monthly Summary', 14, 50);
    
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 14, 60);
    doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 14, 66);
    doc.text(`Savings: ${formatCurrency(savings)}`, 14, 72);
    doc.text(`Savings Rate: ${savingsRate.toFixed(1)}%`, 14, 78);
    
    // Add budget warnings section
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Budget Overview', 14, 90);
    
    // Budget warnings table
    if (budgetWarnings.length > 0) {
      const budgetTableData = budgetWarnings.map(warning => [
        warning.category,
        formatCurrency(warning.limit),
        formatCurrency(warning.spent),
        `${warning.percentage.toFixed(0)}%`,
        warning.remaining >= 0 
          ? formatCurrency(warning.remaining)
          : `-${formatCurrency(Math.abs(warning.remaining))}`,
        warning.isOverBudget ? 'Over Budget' : 'Within Budget'
      ]);
      
      (doc as any).autoTable({
        startY: 95,
        head: [['Category', 'Budget', 'Spent', 'Used', 'Remaining', 'Status']],
        body: budgetTableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 135, 245] },
        didDrawPage: function(data: any) {
          yPosition = data.cursor.y;
        },
        columnStyles: {
          0: { cellWidth: 40 },
          5: { 
            cellWidth: 30,
            fontStyle: 'bold',
            halign: 'center',
          }
        },
      });
    } else {
      doc.setFontSize(12);
      doc.text('No budget data available.', 14, 95);
      yPosition = 110;
    }
    
    // Add recent transactions section
    yPosition += 20;
    
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Recent Transactions', 14, yPosition);
    
    // Recent transactions table
    if (currentMonthTransactions.length > 0) {
      const recentTransactions = [...currentMonthTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
        
      const transactionTableData = recentTransactions.map(transaction => [
        formatDate(transaction.date),
        transaction.description,
        transaction.category,
        transaction.type === 'income' ? 'Income' : 'Expense',
        formatCurrency(transaction.amount)
      ]);
      
      (doc as any).autoTable({
        startY: yPosition + 5,
        head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
        body: transactionTableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 135, 245] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 50 },
          4: { halign: 'right' }
        },
      });
    } else {
      doc.setFontSize(12);
      doc.text('No transaction data available.', 14, yPosition + 5);
    }
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        'Personal Finance Tracker - Financial Summary Report',
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10
      );
    }
    
    // Save the PDF
    doc.save(`financial-summary-${now.getFullYear()}-${now.getMonth() + 1}.pdf`);
  } catch (error) {
    console.error('Error generating financial summary PDF:', error);
    alert('Failed to generate PDF. Please try again later.');
  }
};

// Generate transaction history report
export const generateTransactionHistoryPDF = (
  transactions: Transaction[],
  userName: string,
  startDate?: Date,
  endDate?: Date
): void => {
  try {
    const doc = new jsPDF();
    const now = new Date();
    const reportDate = now.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    
    // Filter transactions by date range if provided
    let filteredTransactions = [...transactions];
    let periodText = 'All Transactions';
    
    if (startDate && endDate) {
      filteredTransactions = transactions.filter(transaction => {
        const txDate = new Date(transaction.date);
        return txDate >= startDate && txDate <= endDate;
      });
      
      periodText = `Transactions from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
    }
    
    // Sort transactions by date (newest first)
    filteredTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text('Transaction History Report', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated for: ${userName}`, 14, 32);
    doc.text(`Report Date: ${reportDate}`, 14, 38);
    doc.text(periodText, 14, 44);
    
    // Calculate summary
    const totalIncome = filteredTransactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
      
    const totalExpenses = filteredTransactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
      
    const netAmount = totalIncome - totalExpenses;
    
    // Add summary
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Summary', 14, 56);
    
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 14, 66);
    doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 14, 72);
    doc.text(`Net Amount: ${formatCurrency(netAmount)}`, 14, 78);
    
    // Transactions table
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Transactions', 14, 90);
    
    if (filteredTransactions.length > 0) {
      const transactionTableData = filteredTransactions.map(transaction => [
        formatDate(transaction.date),
        transaction.description,
        transaction.category,
        transaction.type === 'income' ? 'Income' : 'Expense',
        formatCurrency(transaction.amount)
      ]);
      
      (doc as any).autoTable({
        startY: 95,
        head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
        body: transactionTableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 135, 245] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 55 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25, halign: 'right' }
        },
      });
    } else {
      doc.setFontSize(12);
      doc.text('No transaction data available for the selected period.', 14, 95);
    }
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        'Personal Finance Tracker - Transaction History Report',
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10
      );
    }
    
    // Save the PDF
    doc.save(`transaction-history-${now.getFullYear()}-${now.getMonth() + 1}.pdf`);
  } catch (error) {
    console.error('Error generating transaction history PDF:', error);
    alert('Failed to generate PDF. Please try again later.');
  }
}; 
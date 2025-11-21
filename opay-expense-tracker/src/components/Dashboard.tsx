import { useExpenses, useStreak } from '../hooks/useExpenseData';
import { useUIStore, useAuthStore } from '../stores';
import { Wallet, TrendingUp, Flame } from 'lucide-react';
import { GoogleSheetsExport } from './GoogleSheetsExport';
import { ExpenseData } from '../types/index';

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  'NGN': '₦',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'CAD': 'C$',
  'AUD': 'A$',
  'JPY': '¥',
  'CHF': 'CHF',
};

export default function Dashboard() {
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: streak } = useStreak();
  const { setShowExpenseModal, setShowVoiceModal } = useUIStore();
  const { profile } = useAuthStore();
  
  // Get currency symbol from profile or default to Naira
  const currencySymbol = CURRENCY_SYMBOLS[profile?.currency || 'NGN'] || '₦';

  const totalSpent = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  
  const thisMonthExpenses = expenses?.filter(exp => {
    const expenseDate = new Date(exp.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  }) || [];
  
  // Separate income and expenses
  const monthlyIncome = thisMonthExpenses
    .filter(exp => exp.type === 'income')
    .reduce((sum, exp) => sum + Number(exp.amount), 0);
    
  const monthlyExpenses = thisMonthExpenses
    .filter(exp => exp.type === 'expense')
    .reduce((sum, exp) => sum + Number(exp.amount), 0);
    
  const monthlyNetIncome = monthlyIncome - monthlyExpenses;
  
  const monthlyTotal = thisMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="p-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-24">
        <h1 className="text-heading-xl text-neutral-900 dark:text-white">Dashboard</h1>
        {streak && (
          <div className="flex items-center gap-8 bg-primary-50 dark:bg-primary-900/20 border border-primary-500 dark:border-primary-400 rounded-full px-16 py-8">
            <Flame className="w-20 h-20 text-gamification-fire" />
            <span className="text-heading-lg text-primary-600 dark:text-primary-400">{streak.current_streak}</span>
            <span className="text-body-sm text-neutral-700 dark:text-neutral-300">day streak</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-16 mb-24">
        {/* Net Income Card */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-24 shadow-card">
          <div className="flex items-center gap-12 mb-8 text-white/80">
            <Wallet className="w-20 h-20" />
            <span className="text-body-base">Net Income This Month</span>
          </div>
          <div className={`text-display-lg font-bold mb-4 ${
            monthlyNetIncome >= 0 ? 'text-white' : 'text-red-200'
          }`}>
            {currencySymbol}{monthlyNetIncome.toFixed(2)}
          </div>
          <div className="text-body-sm text-white/60">
            {monthlyIncome > 0 || monthlyExpenses > 0 ? (
              <span>Income {currencySymbol}{monthlyIncome.toFixed(2)} - Expenses {currencySymbol}{monthlyExpenses.toFixed(2)}</span>
            ) : (
              <span>No transactions yet</span>
            )}
          </div>
        </div>

        {/* Income and Expense Summary */}
        <div className="grid grid-cols-2 gap-16">
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-20">
            <div className="text-body-sm text-green-700 dark:text-green-400 mb-4">Income</div>
            <div className="text-heading-xl text-green-600 dark:text-green-400 font-bold">
              {currencySymbol}{monthlyIncome.toFixed(2)}
            </div>
            <div className="text-caption text-green-600/60 dark:text-green-400/60 mt-4">
              {thisMonthExpenses.filter(e => e.type === 'income').length} transactions
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-20">
            <div className="text-body-sm text-red-700 dark:text-red-400 mb-4">Expenses</div>
            <div className="text-heading-xl text-red-600 dark:text-red-400 font-bold">
              {currencySymbol}{monthlyExpenses.toFixed(2)}
            </div>
            <div className="text-caption text-red-600/60 dark:text-red-400/60 mt-4">
              {thisMonthExpenses.filter(e => e.type === 'expense').length} transactions
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-16 mb-24">
        <button
          onClick={() => setShowVoiceModal(true)}
          className="bg-white dark:bg-gray-800 rounded-md p-24 shadow-card hover:shadow-card-hover transition-all duration-base border border-neutral-200 dark:border-gray-700"
        >
          <div className="w-48 h-48 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="text-label-md text-neutral-900 dark:text-white">Voice Entry</div>
        </button>

        <button
          onClick={() => setShowExpenseModal(true)}
          className="bg-white dark:bg-gray-800 rounded-md p-24 shadow-card hover:shadow-card-hover transition-all duration-base border border-neutral-200 dark:border-gray-700"
        >
          <div className="w-48 h-48 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-12">
            <TrendingUp className="w-24 h-24 text-primary-500 dark:text-primary-400" />
          </div>
          <div className="text-label-md text-neutral-900 dark:text-white">Add Expense</div>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-24 shadow-card">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-heading-lg text-neutral-900 dark:text-white">Recent Transactions</h2>
          {expenses && expenses.length > 0 && (
            <GoogleSheetsExport 
              expenses={expenses.map(expense => ({
                id: expense.id,
                description: expense.merchant || expense.category?.name || 'Transaction',
                amount: Number(expense.amount),
                category: expense.category?.name || 'Uncategorized',
                date: expense.date,
                notes: expense.notes
              }))} 
            />
          )}
        </div>
        
        {expensesLoading ? (
          <div className="space-y-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-neutral-100 dark:bg-gray-700 rounded-md animate-pulse" />
            ))}
          </div>
        ) : expenses && expenses.length > 0 ? (
          <div className="space-y-12">
            {expenses.slice(0, 10).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between py-12 border-b border-neutral-200 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-12">
                  <div className={`w-40 h-40 rounded-full flex items-center justify-center ${
                    expense.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-neutral-100 dark:bg-gray-700'
                  }`}>
                    <span className="text-label-md">{expense.category?.icon || (expense.type === 'income' ? '💰' : '💸')}</span>
                  </div>
                  <div>
                    <div className="text-body-base font-medium text-neutral-900 dark:text-white">
                      {expense.merchant || expense.category?.name || 'Transaction'}
                    </div>
                    <div className="text-caption text-neutral-400 dark:text-neutral-500">
                      {new Date(expense.date).toLocaleDateString()}
                      {expense.type && (
                        <span className={`ml-8 px-8 py-2 rounded-full text-xs ${
                          expense.type === 'income'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {expense.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`text-body-lg font-semibold ${
                  expense.type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {expense.type === 'income' ? '+' : '-'}{currencySymbol}{Number(expense.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 text-neutral-400 dark:text-neutral-500">
            <p className="text-body-base">No transactions yet</p>
            <p className="text-body-sm mt-8">Add your first income or expense to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X } from 'lucide-react';
import { useUIStore } from '../stores';
import { useCreateExpense, useCategories } from '../hooks/useExpenseData';

export default function ExpenseModal() {
  const { setShowExpenseModal } = useUIStore();
  const { data: categories } = useCategories();
  const createExpense = useCreateExpense();

  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category_id: '',
    merchant: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createExpense.mutateAsync({
        ...formData,
        source: 'typed',
        type: transactionType,
      });
      setShowExpenseModal(false);
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-16">
      <div className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl w-full sm:max-w-md max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-neutral-200 dark:border-gray-700 p-16">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-heading-lg text-neutral-900 dark:text-white">Add Transaction</h2>
            <button onClick={() => setShowExpenseModal(false)} className="p-8 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-full">
              <X className="w-20 h-20" />
            </button>
          </div>
          
          {/* Transaction Type Toggle */}
          <div className="flex gap-8 p-4 bg-neutral-100 dark:bg-gray-700 rounded-lg">
            <button
              type="button"
              onClick={() => setTransactionType('expense')}
              className={`flex-1 py-10 px-16 rounded-md text-body-sm font-semibold transition-all ${
                transactionType === 'expense'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-gray-600'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('income')}
              className={`flex-1 py-10 px-16 rounded-md text-body-sm font-semibold transition-all ${
                transactionType === 'income'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-gray-600'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-24 space-y-24">
          <div>
            <label className="block text-body-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-8">Amount</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full h-48 px-16 border-2 border-neutral-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md focus:border-primary-500 focus:outline-none text-body-base"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-8">Category</label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full h-48 px-16 border-2 border-neutral-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md focus:border-primary-500 focus:outline-none text-body-base"
            >
              <option value="">Select category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-8">
              {transactionType === 'expense' ? 'Merchant (optional)' : 'Source (optional)'}
            </label>
            <input
              type="text"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              className="w-full h-48 px-16 border-2 border-neutral-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md focus:border-primary-500 focus:outline-none text-body-base"
              placeholder={transactionType === 'expense' ? 'Store name' : 'Income source'}
            />
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-8">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full h-48 px-16 border-2 border-neutral-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md focus:border-primary-500 focus:outline-none text-body-base"
            />
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-8">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-16 py-12 border-2 border-neutral-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md focus:border-primary-500 focus:outline-none text-body-base resize-none"
              rows={3}
              placeholder="Add notes"
            />
          </div>

          <div className="flex gap-12">
            <button
              type="button"
              onClick={() => setShowExpenseModal(false)}
              className="flex-1 h-48 border-2 border-neutral-200 dark:border-gray-700 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-50 dark:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createExpense.isPending}
              className={`flex-1 h-48 text-white rounded-md transition-colors disabled:opacity-50 ${
                transactionType === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {createExpense.isPending ? 'Saving...' : `Save ${transactionType === 'expense' ? 'Expense' : 'Income'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

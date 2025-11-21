import { useState, useEffect } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import { useUIStore } from '../stores';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useCreateExpense, useCategories } from '../hooks/useExpenseData';

export default function VoiceModal() {
  const { setShowVoiceModal } = useUIStore();
  const { data: categories } = useCategories();
  const createExpense = useCreateExpense();
  const {
    isListening,
    isProcessing,
    transcript,
    parsedData,
    error,
    isSupported,
    startListening,
    reset,
  } = useVoiceInput();

  // Check if AI was used successfully
  const isAISuccess = parsedData && parsedData.raw_transcript;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category_id: '',
    merchant: '',
    notes: '',
  });

  useEffect(() => {
    if (parsedData) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: parsedData.amount?.toString() || '',
        category_id: categories?.find(c => c.name.toLowerCase() === parsedData.category)?.id || '',
        merchant: parsedData.merchant || '',
        notes: parsedData.raw_transcript,
      });
    }
  }, [parsedData, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createExpense.mutateAsync({
        ...formData,
        source: 'voice',
        type: parsedData?.type || 'expense',
      });
      setShowVoiceModal(false);
      reset();
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleClose = () => {
    setShowVoiceModal(false);
    reset();
  };

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-32 max-w-md text-center">
          <p className="text-body-base text-neutral-700 dark:text-neutral-300">
            Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.
          </p>
          <button
            onClick={handleClose}
            className="mt-16 px-24 py-12 bg-primary-500 text-white rounded-md"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-16">
      <div className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl w-full sm:max-w-md max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-neutral-200 dark:border-gray-700 p-16 flex items-center justify-between">
          <h2 className="text-heading-lg text-neutral-900 dark:text-white">Voice Entry</h2>
          <button onClick={handleClose} className="p-8 hover:bg-neutral-100 dark:bg-gray-700 rounded-full">
            <X className="w-20 h-20" />
          </button>
        </div>

        <div className="p-24">
          {!parsedData ? (
            <div className="text-center py-48">
              <div className="relative inline-block">
                <button
                  onClick={startListening}
                  disabled={isListening || isProcessing}
                  className={`w-96 h-96 rounded-full mb-24 flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-error voice-recording-pulse'
                      : 'bg-primary-500 hover:bg-primary-400 shadow-fab hover:shadow-fab-hover'
                  } disabled:opacity-50`}
                >
                  {isListening ? (
                    <MicOff className="w-32 h-32 text-white relative z-10" />
                  ) : (
                    <Mic className="w-32 h-32 text-white" />
                  )}
                </button>
              </div>

              <div className="min-h-[120px]">
                {isListening && (
                  <div className="space-y-8">
                    <p className="text-heading-md text-error font-semibold">Recording...</p>
                    <p className="text-body-sm text-neutral-600 dark:text-neutral-400">
                      Speak clearly about your income or expense
                    </p>
                  </div>
                )}
                {isProcessing && (
                  <div className="space-y-12">
                    <div className="relative">
                      {/* Larger animated spinner */}
                      <div className="w-32 h-32 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto ai-processing-pulse"></div>
                      {/* Inner pulsing dot */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-body-lg text-primary-600 dark:text-primary-400 font-semibold animate-pulse">
                        🧠 AI is analyzing your voice...
                      </p>
                      <div className="bg-gradient-to-r from-primary-50 to-gamification-sky/10 dark:bg-primary-900/20 p-16 rounded-lg border-2 border-primary-200 dark:border-primary-800">
                        <p className="text-body-sm text-primary-700 dark:text-primary-300 text-center font-medium">
                          ✨ Understanding your expense or income with advanced AI
                        </p>
                      </div>
                      {/* Enhanced Progress dots */}
                      <div className="flex justify-center space-x-3 mt-12">
                        <div className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full loading-dots"></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full loading-dots"></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full loading-dots"></div>
                      </div>
                    </div>
                  </div>
                )}
                {transcript && !isProcessing && (
                  <div className="bg-neutral-50 dark:bg-gray-700 p-16 rounded-lg">
                    <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mb-4">You said:</p>
                    <p className="text-body-base text-neutral-700 dark:text-neutral-300 italic">
                      "{transcript}"
                    </p>
                  </div>
                )}
                {error && (
                  <div className="bg-error/10 p-12 rounded-lg border border-error/20">
                    <p className="text-body-sm text-error">{error}</p>
                  </div>
                )}
                {!isListening && !isProcessing && !transcript && (
                  <div className="space-y-12">
                    <p className="text-body-lg text-neutral-700 dark:text-neutral-300 font-medium">
                      Tap the microphone to start
                    </p>
                    <div className="bg-primary-50 p-16 rounded-lg">
                      <p className="text-body-sm text-neutral-600 dark:text-neutral-400 mb-8">
                        Example phrases:
                      </p>
                      <ul className="text-body-sm text-neutral-500 dark:text-neutral-400 space-y-4 text-left max-w-[280px] mx-auto">
                        <li>"I spent 50 dollars on groceries"</li>
                        <li>"Earned 5000 from freelance"</li>
                        <li>"100 dollars for taxi ride"</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-24">
              <div className="bg-gradient-to-r from-primary-50 to-gamification-sky/20 p-16 rounded-lg border border-primary-200">
                <p className="text-body-xs text-neutral-500 dark:text-neutral-400 mb-4 font-semibold uppercase tracking-wide">
                  What you said:
                </p>
                <p className="text-body-base text-neutral-800 dark:text-neutral-200 italic">
                  "{parsedData.raw_transcript}"
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border-2 border-primary-200 rounded-lg p-16">
                <p className="text-body-sm text-primary-600 dark:text-primary-400 font-semibold mb-12 flex items-center gap-8">
                  <div className="relative">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {isAISuccess && (
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center success-checkmark">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  AI Detected Information
                  {isAISuccess && (
                    <span className="ml-auto text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-8 py-2 rounded-full font-medium">
                      ✅ AI Enhanced
                    </span>
                  )}
                </p>
                <div className="space-y-8 text-body-sm">
                  <div className="flex items-center gap-8">
                    <span className="text-neutral-500 dark:text-neutral-400">Type:</span>
                    <span className={`font-semibold px-12 py-4 rounded-full text-xs ${
                      parsedData.type === 'income' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {parsedData.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </div>
                  {parsedData.amount && (
                    <div className="flex items-center gap-8">
                      <span className="text-neutral-500 dark:text-neutral-400">Amount:</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">${parsedData.amount.toFixed(2)}</span>
                    </div>
                  )}
                  {parsedData.category && (
                    <div className="flex items-center gap-8">
                      <span className="text-neutral-500 dark:text-neutral-400">Category:</span>
                      <span className="font-semibold text-neutral-900 dark:text-white capitalize">{parsedData.category}</span>
                    </div>
                  )}
                  {parsedData.merchant && (
                    <div className="flex items-center gap-8">
                      <span className="text-neutral-500 dark:text-neutral-400">{parsedData.type === 'income' ? 'Source:' : 'Merchant:'}</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{parsedData.merchant}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-8">
                  Amount *
                </label>
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
                <label className="block text-body-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-8">
                  Category *
                </label>
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
                  Merchant
                </label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className="w-full h-48 px-16 border-2 border-neutral-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md focus:border-primary-500 focus:outline-none text-body-base"
                  placeholder="Where did you spend?"
                />
              </div>

              <div className="flex gap-12 pt-8">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setFormData({
                      date: new Date().toISOString().split('T')[0],
                      amount: '',
                      category_id: '',
                      merchant: '',
                      notes: '',
                    });
                  }}
                  className="flex-1 h-48 border-2 border-neutral-300 dark:border-gray-600 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-50 dark:bg-gray-700 transition-colors font-semibold"
                >
                  Try Again
                </button>
                <button
                  type="submit"
                  disabled={createExpense.isPending}
                  className="flex-1 h-48 bg-primary-500 text-white rounded-md hover:bg-primary-400 transition-colors disabled:opacity-50 font-semibold shadow-sm"
                >
                  {createExpense.isPending ? 'Saving...' : 'Confirm & Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

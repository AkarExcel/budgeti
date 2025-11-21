import { Home, History, PlusCircle, BarChart3, User } from 'lucide-react';
import { useUIStore, useNavigationStore } from '../stores';

export default function BottomNavigation() {
  const { setShowExpenseModal } = useUIStore();
  const { currentPage, setCurrentPage } = useNavigationStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-neutral-200 dark:border-gray-700 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_-2px_8px_rgba(0,0,0,0.2)] safe-area-inset-bottom transition-colors duration-base">
      <div className="flex items-center justify-around h-56 px-8">
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className={`flex flex-col items-center gap-4 py-8 px-12 transition-colors ${
            currentPage === 'dashboard' ? 'text-primary-500 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          <Home className="w-24 h-24" />
          <span className="text-label-sm">Dashboard</span>
        </button>

        <button className="flex flex-col items-center gap-4 py-8 px-12 text-neutral-400 dark:text-neutral-500">
          <History className="w-24 h-24" />
          <span className="text-label-sm">History</span>
        </button>

        <button
          onClick={() => setShowExpenseModal(true)}
          className="w-56 h-56 bg-primary-500 rounded-full flex items-center justify-center shadow-fab -mt-28"
        >
          <PlusCircle className="w-28 h-28 text-white" />
        </button>

        <button className="flex flex-col items-center gap-4 py-8 px-12 text-neutral-400 dark:text-neutral-500">
          <BarChart3 className="w-24 h-24" />
          <span className="text-label-sm">Reports</span>
        </button>

        <button 
          onClick={() => setCurrentPage('profile')}
          className={`flex flex-col items-center gap-4 py-8 px-12 transition-colors ${
            currentPage === 'profile' ? 'text-primary-500 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          <User className="w-24 h-24" />
          <span className="text-label-sm">Profile</span>
        </button>
      </div>
    </div>
  );
}

import { Trophy } from 'lucide-react';
import { useUIStore } from '../stores';

const achievementData = {
  first_entry: {
    title: 'First Entry',
    description: 'You logged your first expense!',
    icon: '🎯',
  },
  first_week: {
    title: 'Week Warrior',
    description: '7 days logging streak',
    icon: '🔥',
  },
  month_master: {
    title: 'Month Master',
    description: '30 days logging streak',
    icon: '⭐',
  },
  century_club: {
    title: 'Century Club',
    description: '100 expenses logged',
    icon: '💯',
  },
  budget_boss: {
    title: 'Budget Boss',
    description: 'Under budget for 3 months',
    icon: '👑',
  },
};

export default function AchievementModal() {
  const { setShowAchievementModal, achievementToShow } = useUIStore();
  const achievement = achievementToShow ? achievementData[achievementToShow as keyof typeof achievementData] : null;

  if (!achievement) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-16">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-32 max-w-sm text-center animate-scale-bounce">
        <div className="w-96 h-96 bg-gradient-to-br from-gamification-gold to-primary-500 rounded-full flex items-center justify-center mx-auto mb-24 shadow-fab">
          <span className="text-[64px]">{achievement.icon}</span>
        </div>

        <h2 className="text-display-md text-neutral-900 dark:text-white mb-8">
          {achievement.title}
        </h2>
        <p className="text-body-base text-neutral-700 dark:text-neutral-300 mb-24">
          {achievement.description}
        </p>

        <button
          onClick={() => setShowAchievementModal(false)}
          className="w-full h-48 bg-primary-500 text-white rounded-md hover:bg-primary-400 transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

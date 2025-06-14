
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

interface DashboardWelcomeProps {
  minBettingBalance: number;
}

export function DashboardWelcome({ minBettingBalance }: DashboardWelcomeProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  return (
    <div className="mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome, {profile?.username || user?.email?.split('@')[0]}!
      </h2>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
        Choose your sport and place your bets on live matches
      </p>
      
      {/* Betting Requirements Notice */}
      {profile && profile.balance < minBettingBalance && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            💡 You need at least KES {minBettingBalance} in your account to place bets. Please deposit funds to start betting.
          </p>
        </div>
      )}
    </div>
  );
}

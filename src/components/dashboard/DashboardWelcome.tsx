
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useBetslip } from '@/hooks/useBetslip';

interface DashboardWelcomeProps {
  minBettingBalance: number;
}

export function DashboardWelcome({ minBettingBalance }: DashboardWelcomeProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { currentBetslip, DAILY_BETSLIP_FEE } = useBetslip();

  return (
    <div className="mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome, {profile?.username || user?.email?.split('@')[0]}!
      </h2>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
        Fixed betting platform - Pay KES {DAILY_BETSLIP_FEE} daily to place unlimited bets
      </p>
      
      {/* Daily Betslip Notice */}
      {profile && currentBetslip && !currentBetslip.isPaid && (
        <div className="mt-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💳 Pay KES {DAILY_BETSLIP_FEE} for today's betslip to start placing bets on fixed matches.
          </p>
        </div>
      )}

      {/* Low Balance Notice */}
      {profile && profile.balance < DAILY_BETSLIP_FEE && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            💡 You need at least KES {DAILY_BETSLIP_FEE} to pay for today's betslip. Please deposit funds.
          </p>
        </div>
      )}

      {/* Active Betslip Notice */}
      {profile && currentBetslip && currentBetslip.isPaid && (
        <div className="mt-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-700 dark:text-green-300">
            ✅ Today's betslip is active! You can place unlimited bets on fixed matches.
          </p>
        </div>
      )}
    </div>
  );
}

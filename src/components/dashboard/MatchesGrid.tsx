
import { MatchCard } from '@/components/MatchCard';
import { useRealTimeMatches } from '@/hooks/useRealTimeMatches';
import { useBetslip } from '@/hooks/useBetslip';

// Use the Match type from useRealTimeMatches
type Match = ReturnType<typeof useRealTimeMatches>['matches'][0];

interface MatchesGridProps {
  matches: Match[];
  loading: boolean;
  onBet: (match: Match, team: string, odds: number) => void;
  disabled: boolean;
}

export function MatchesGrid({ matches, loading, onBet, disabled }: MatchesGridProps) {
  const { currentBetslip } = useBetslip();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading matches...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No matches available at the moment.
        </p>
      </div>
    );
  }

  // Betting is disabled if user hasn't paid for today's betslip
  const bettingDisabled = disabled || !currentBetslip?.isPaid;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          onBet={onBet}
          disabled={bettingDisabled}
        />
      ))}
      
      {/* Betslip reminder for unpaid users */}
      {!currentBetslip?.isPaid && (
        <div className="col-span-full mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-700 font-medium">
            Pay KES {currentBetslip?.isPaid ? '0' : '499'} for today's betslip to start betting on these fixed matches!
          </p>
        </div>
      )}
    </div>
  );
}


import { Button } from '@/components/ui/button';
import { Clock, Trash2 } from 'lucide-react';

interface Bet {
  id: string;
  matchTitle: string;
  team: string;
  odds: number;
  amount: number;
  timestamp: string;
}

interface BetslipBetsListProps {
  bets: Bet[];
  isPaid: boolean;
  removeBet: (id: string) => void;
}

export function BetslipBetsList({ bets, isPaid, removeBet }: BetslipBetsListProps) {
  if (bets.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No bets placed yet</p>
        {isPaid ? (
          <p className="text-sm mt-1">Start betting on matches below!</p>
        ) : (
          <p className="text-sm mt-1">Pay the daily fee to start betting</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {bets.map((bet) => (
        <div 
          key={bet.id} 
          className="p-3 bg-gray-50 rounded-lg border flex justify-between items-start"
        >
          <div className="flex-1">
            <p className="font-medium text-sm">{bet.matchTitle}</p>
            <p className="text-sm text-gray-600">
              Bet: {bet.team} • Odds: {bet.odds}x • Amount: KES {bet.amount}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {new Date(bet.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          {!isPaid && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeBet(bet.id)}
              className="p-1 h-auto"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

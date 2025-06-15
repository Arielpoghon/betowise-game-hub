
interface Bet {
  amount: number;
  odds: number;
}

interface BetslipSummaryProps {
  totalBets: number;
  bets: Bet[];
}

export function BetslipSummary({ totalBets, bets }: BetslipSummaryProps) {
  if (bets.length === 0) return null;

  const potentialWin = bets.reduce((total, bet) => total + (bet.amount * bet.odds), 0);
  return (
    <div className="p-3 bg-gray-50 rounded-lg border-t">
      <div className="flex justify-between text-sm">
        <span>Total Bets:</span>
        <span className="font-medium">{totalBets}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Total Potential Win:</span>
        <span className="font-medium text-green-600">
          KES {potentialWin.toFixed(2)}
        </span>
      </div>
    </div>
  );
}


import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Use the Match type from useRealTimeMatches
interface Match {
  id: string;
  title: string;
  home_team: string;
  away_team: string;
  league: string;
  country: string;
  sport: string;
  status: string;
  start_time: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  home_odds: string;
  draw_odds: string | null;
  away_odds: string;
  external_id: string;
}

interface Market {
  id: string;
  name: string;
  market_type: string;
}

interface BetDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  match: Match | null;
  market: Market | null;
  odds: { id: string; outcome: string; odds: number } | null;
  userBalance: number;
}

export function BetDialog({ 
  open, 
  onClose, 
  onConfirm, 
  match, 
  market,
  odds,
  userBalance 
}: BetDialogProps) {
  const [amount, setAmount] = useState('');

  const handleConfirm = () => {
    const betAmount = parseFloat(amount);
    if (betAmount > 0 && betAmount <= userBalance) {
      onConfirm(betAmount);
      setAmount('');
      onClose();
    }
  };

  const potentialWin = odds ? parseFloat(amount || '0') * odds.odds : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place Bet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{match?.title}</h3>
            <p className="text-sm text-muted-foreground">
              Market: {market?.name || 'Winner'}
            </p>
            <p className="text-sm text-muted-foreground">
              Selection: {odds?.outcome} (Odds: {odds?.odds || '2.0'})
            </p>
          </div>
          
          <div>
            <Label htmlFor="amount">Bet Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              max={userBalance}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available balance: KES {userBalance.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Potential Win:</span>
              <span className="font-medium text-green-600">
                KES {potentialWin.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Total Return:</span>
              <span className="font-medium">
                KES {(potentialWin + parseFloat(amount || '0')).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="flex-1"
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > userBalance}
            >
              Place Bet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

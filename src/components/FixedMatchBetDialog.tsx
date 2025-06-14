
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lock, Star, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  is_fixed_match?: boolean | null;
  fixed_home_score?: number | null;
  fixed_away_score?: number | null;
  fixed_outcome_set?: boolean | null;
}

interface Market {
  id: string;
  name: string;
  market_type: string;
}

interface FixedMatchBetDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  match: Match | null;
  market: Market | null;
  odds: { id: string; outcome: string; odds: number } | null;
  userBalance: number;
}

export function FixedMatchBetDialog({ 
  open, 
  onClose, 
  onConfirm, 
  match, 
  market,
  odds,
  userBalance 
}: FixedMatchBetDialogProps) {
  const [amount, setAmount] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    const betAmount = parseFloat(amount);
    if (betAmount <= 0 || betAmount > userBalance || !match || !odds) return;

    setIsPlacing(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to place bets',
          variant: 'destructive'
        });
        return;
      }

      // Place the bet in the database
      const { error: betError } = await supabase
        .from('bets')
        .insert({
          user_id: user.id,
          match_id: match.id,
          amount: betAmount,
          team_choice: odds.outcome.toLowerCase(),
          status: 'pending'
        });

      if (betError) {
        console.error('Error placing bet:', betError);
        toast({
          title: 'Error',
          description: 'Failed to place bet. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      // Update user balance
      const { error: balanceError } = await supabase.rpc('update_user_balance', {
        user_id: user.id,
        amount_to_add: -betAmount
      });

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
        toast({
          title: 'Error',
          description: 'Failed to update balance. Please contact support.',
          variant: 'destructive'
        });
        return;
      }

      onConfirm(betAmount);
      setAmount('');
      onClose();
      
      toast({
        title: 'Bet Placed Successfully!',
        description: match.is_fixed_match 
          ? `Fixed match bet placed for KES ${betAmount}. Outcome guaranteed!`
          : `Bet placed for KES ${betAmount}. Good luck!`,
      });

    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsPlacing(false);
    }
  };

  const potentialWin = odds ? parseFloat(amount || '0') * odds.odds : 0;
  const isFixedMatch = match?.is_fixed_match;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Place Bet
            {isFixedMatch && (
              <div className="flex items-center gap-1">
                <Lock className="h-4 w-4 text-green-600" />
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Match Info */}
          <div className={`p-3 rounded-lg ${isFixedMatch ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <h3 className="font-medium">{match?.title}</h3>
            <p className="text-sm text-muted-foreground">
              Market: {market?.name || 'Winner'}
            </p>
            <p className="text-sm text-muted-foreground">
              Selection: {odds?.outcome} (Odds: {odds?.odds || '2.0'})
            </p>
            
            {/* Fixed Match Guarantee */}
            {isFixedMatch && match?.fixed_outcome_set && (
              <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-semibold text-sm">GUARANTEED OUTCOME</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Final Score: {match.home_team} {match.fixed_home_score} - {match.fixed_away_score} {match.away_team}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  This is a fixed match with a predetermined result. Your bet is guaranteed to win if you choose the correct outcome!
                </p>
              </div>
            )}
          </div>
          
          {/* Bet Amount Input */}
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
          
          {/* Potential Winnings */}
          <div className={`p-3 rounded-lg ${isFixedMatch ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex justify-between text-sm">
              <span>Potential Win:</span>
              <span className={`font-medium ${isFixedMatch ? 'text-green-600' : 'text-blue-600'}`}>
                KES {potentialWin.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Total Return:</span>
              <span className="font-medium">
                KES {(potentialWin + parseFloat(amount || '0')).toFixed(2)}
              </span>
            </div>
            {isFixedMatch && (
              <div className="mt-2 text-xs text-green-600 font-medium">
                🎯 Guaranteed return on fixed match!
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isPlacing}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              className={`flex-1 ${isFixedMatch ? 'bg-green-600 hover:bg-green-700' : ''}`}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > userBalance || isPlacing}
            >
              {isPlacing ? 'Placing...' : `Place ${isFixedMatch ? 'Fixed' : ''} Bet`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

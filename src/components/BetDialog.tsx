
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface BetDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  match: any;
  team: string;
  odds: number;
  userBalance: number;
}

export function BetDialog({ open, onClose, onConfirm, match, team, odds, userBalance }: BetDialogProps) {
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const handleConfirm = () => {
    const betAmount = parseFloat(amount);
    
    if (isNaN(betAmount) || betAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid bet amount",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount > userBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance for this bet",
        variant: "destructive"
      });
      return;
    }
    
    onConfirm(betAmount);
    setAmount('');
    onClose();
  };

  const getTeamDisplay = () => {
    if (team === 'team_a') return match.team_a;
    if (team === 'team_b') return match.team_b;
    return 'Draw';
  };

  const potentialWin = amount ? (parseFloat(amount) * odds).toFixed(2) : '0.00';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place Bet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{match?.title}</h3>
            <p className="text-sm text-muted-foreground">
              Betting on: <span className="font-medium">{getTeamDisplay()}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Odds: <span className="font-medium">{odds}x</span>
            </p>
          </div>
          
          <div>
            <Label htmlFor="amount">Bet Amount ($)</Label>
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
              Balance: ${userBalance.toFixed(2)}
            </p>
          </div>
          
          {amount && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                Potential win: <span className="font-semibold text-green-600">${potentialWin}</span>
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Place Bet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

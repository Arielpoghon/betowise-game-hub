
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PayPalButton } from './PayPalButton';

interface DepositDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export function DepositDialog({ open, onClose, onSuccess }: DepositDialogProps) {
  const [amount, setAmount] = useState('');
  const [showPayPal, setShowPayPal] = useState(false);

  const handleAmountConfirm = () => {
    const depositAmount = parseFloat(amount);
    if (depositAmount > 0) {
      setShowPayPal(true);
    }
  };

  const handlePayPalSuccess = (paidAmount: number) => {
    onSuccess(paidAmount);
    setAmount('');
    setShowPayPal(false);
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    setShowPayPal(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!showPayPal ? (
            <>
              <div>
                <Label htmlFor="depositAmount">Amount to Deposit ($)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="1.00"
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleAmountConfirm} 
                  className="flex-1"
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  Continue to PayPal
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-lg font-semibold">Deposit ${amount}</p>
                <p className="text-sm text-muted-foreground">Complete payment with PayPal</p>
              </div>
              
              <PayPalButton 
                amount={parseFloat(amount)} 
                onSuccess={handlePayPalSuccess}
              />
              
              <Button variant="outline" onClick={() => setShowPayPal(false)} className="w-full">
                Back
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

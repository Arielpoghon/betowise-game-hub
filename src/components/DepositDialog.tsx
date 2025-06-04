
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PesaPalButton } from './PesaPalButton';

interface DepositDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export function DepositDialog({ open, onClose, onSuccess }: DepositDialogProps) {
  const [amount, setAmount] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const handleAmountConfirm = () => {
    const depositAmount = parseFloat(amount);
    if (depositAmount > 0 && userPhone.trim()) {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = (paidAmount: number) => {
    onSuccess(paidAmount);
    setAmount('');
    setUserPhone('');
    setShowPayment(false);
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    setUserPhone('');
    setShowPayment(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit Funds via M-Pesa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!showPayment ? (
            <>
              <div>
                <Label htmlFor="depositAmount">Amount to Deposit (KES)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="1.00"
                  min="10.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum deposit: KES 10
                </p>
              </div>

              <div>
                <Label htmlFor="userPhone">M-Pesa Phone Number</Label>
                <Input
                  id="userPhone"
                  type="tel"
                  placeholder="254712345678"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your M-Pesa registered phone number
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleAmountConfirm} 
                  className="flex-1"
                  disabled={!amount || parseFloat(amount) < 10 || !userPhone.trim()}
                >
                  Continue to M-Pesa
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-lg font-semibold">Deposit KES {amount}</p>
                <p className="text-sm text-muted-foreground">Pay with M-Pesa: {userPhone}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  You will be redirected to M-Pesa to complete the payment
                </p>
              </div>
              
              <PesaPalButton 
                amount={parseFloat(amount)} 
                onSuccess={handlePaymentSuccess}
                userPhone={userPhone}
              />
              
              <Button variant="outline" onClick={() => setShowPayment(false)} className="w-full">
                Back
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

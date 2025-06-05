
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

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on length
    if (digits.startsWith('254')) {
      return digits.slice(0, 12);
    } else if (digits.startsWith('0')) {
      return digits.slice(0, 10);
    } else {
      return digits.slice(0, 9);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Deposit Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-1">
          {!showPayment ? (
            <>
              <div>
                <Label htmlFor="depositAmount" className="text-sm">Amount to Deposit</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="Enter amount (min. 10)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="1.00"
                  min="10.00"
                  className="mt-1 text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum deposit: 10 (currency will be detected automatically)
                </p>
              </div>

              <div>
                <Label htmlFor="userPhone" className="text-sm">Mobile Money Phone Number</Label>
                <Input
                  id="userPhone"
                  type="tel"
                  placeholder="0712345678 or 254712345678"
                  value={userPhone}
                  onChange={(e) => setUserPhone(formatPhoneNumber(e.target.value))}
                  className="mt-1 text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your mobile money registered phone number
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1 text-sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleAmountConfirm} 
                  className="flex-1 text-sm"
                  disabled={!amount || parseFloat(amount) < 10 || !userPhone.trim() || userPhone.length < 9}
                >
                  Continue to Payment
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Deposit {amount}</p>
                <p className="text-sm text-muted-foreground">Pay with Mobile Money: {userPhone}</p>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    ✓ You will be redirected to complete the payment securely<br/>
                    ✓ Follow the prompts on your phone to authorize the payment<br/>
                    ✓ Your account will be credited automatically upon successful payment
                  </p>
                </div>
              </div>
              
              <PesaPalButton 
                amount={parseFloat(amount)} 
                onSuccess={handlePaymentSuccess}
                userPhone={userPhone}
              />
              
              <Button variant="outline" onClick={() => setShowPayment(false)} className="w-full text-sm">
                ← Back to Edit Details
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

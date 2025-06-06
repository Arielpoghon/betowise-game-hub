
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PesaPalButton } from './PesaPalButton';
import { PayPalButton } from './PayPalButton';

interface DepositDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export function DepositDialog({ open, onClose, onSuccess }: DepositDialogProps) {
  const [amount, setAmount] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'paypal'>('mpesa');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPromoActive, setIsPromoActive] = useState(false);

  // Promo end date - 7 days from app launch
  const promoEndDate = new Date('2025-06-12T23:59:59');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const promoEnd = promoEndDate.getTime();
      const difference = promoEnd - now;

      if (difference > 0) {
        setTimeLeft(difference);
        setIsPromoActive(true);
      } else {
        setTimeLeft(0);
        setIsPromoActive(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const getMinimumDeposit = () => {
    return isPromoActive ? 499 : 1100;
  };

  const handleAmountConfirm = () => {
    const depositAmount = parseFloat(amount);
    const minDeposit = getMinimumDeposit();
    
    if (depositAmount >= minDeposit && (paymentMethod === 'paypal' || userPhone.trim())) {
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
    const digits = value.replace(/\D/g, '');
    
    if (digits.startsWith('254')) {
      return digits.slice(0, 12);
    } else if (digits.startsWith('0')) {
      return digits.slice(0, 10);
    } else {
      return digits.slice(0, 9);
    }
  };

  const minDeposit = getMinimumDeposit();
  const depositAmount = parseFloat(amount);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Deposit Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-1">
          {/* Promo Countdown */}
          {isPromoActive && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="text-center">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                  🎉 PROMO PRICE ACTIVE!
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Minimum deposit: KES 499 (Regular: KES 1,100)
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 font-mono">
                  Time left: {formatTimeLeft(timeLeft)}
                </p>
              </div>
            </div>
          )}

          {!isPromoActive && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="text-center">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Standard Pricing
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Minimum deposit: KES 1,100
                </p>
              </div>
            </div>
          )}

          {!showPayment ? (
            <>
              <div>
                <Label htmlFor="depositAmount" className="text-sm">Amount to Deposit</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder={`Enter amount (min. ${minDeposit})`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="1.00"
                  min={minDeposit.toString()}
                  className="mt-1 text-base"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">
                    Minimum deposit: KES {minDeposit}
                  </p>
                  {depositAmount > 0 && depositAmount < minDeposit && (
                    <p className="text-xs text-red-500">
                      Amount too low (min: {minDeposit})
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm">Payment Method</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={paymentMethod === 'mpesa' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('mpesa')}
                    className="text-sm"
                  >
                    M-Pesa
                  </Button>
                  <Button
                    variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('paypal')}
                    className="text-sm"
                  >
                    PayPal
                  </Button>
                </div>
              </div>

              {paymentMethod === 'mpesa' && (
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
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1 text-sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleAmountConfirm} 
                  className="flex-1 text-sm"
                  disabled={
                    !amount || 
                    depositAmount < minDeposit || 
                    (paymentMethod === 'mpesa' && (!userPhone.trim() || userPhone.length < 9))
                  }
                >
                  Continue to Payment
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Deposit KES {amount}</p>
                <p className="text-sm text-muted-foreground">
                  Pay with {paymentMethod === 'mpesa' ? `M-Pesa: ${userPhone}` : 'PayPal'}
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    ✓ You will be redirected to complete the payment securely<br/>
                    ✓ Follow the prompts to authorize the payment<br/>
                    ✓ Your account will be credited automatically upon successful payment
                  </p>
                </div>
              </div>
              
              {paymentMethod === 'mpesa' ? (
                <PesaPalButton 
                  amount={parseFloat(amount)} 
                  onSuccess={handlePaymentSuccess}
                  userPhone={userPhone}
                />
              ) : (
                <PayPalButton 
                  amount={parseFloat(amount)} 
                  onSuccess={handlePaymentSuccess}
                />
              )}
              
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

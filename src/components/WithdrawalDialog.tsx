
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface WithdrawalDialogProps {
  open: boolean;
  onClose: () => void;
  userBalance: number;
  onSuccess: (amount: number) => void;
}

export function WithdrawalDialog({ open, onClose, userBalance, onSuccess }: WithdrawalDialogProps) {
  const [amount, setAmount] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const withdrawalAmount = parseFloat(amount) || 0;
  const commissionRate = 0.07; // 7%
  const commission = withdrawalAmount * commissionRate;
  const netAmount = withdrawalAmount - commission;
  const minWithdrawal = 2000; // Updated minimum withdrawal amount

  const handleWithdrawal = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a withdrawal",
        variant: "destructive"
      });
      return;
    }

    if (withdrawalAmount < minWithdrawal) {
      toast({
        title: "Invalid amount",
        description: `Minimum withdrawal amount is KES ${minWithdrawal}`,
        variant: "destructive"
      });
      return;
    }

    if (withdrawalAmount > userBalance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive"
      });
      return;
    }

    if (!userPhone || userPhone.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      console.log('Processing withdrawal:', {
        amount: withdrawalAmount,
        commission,
        netAmount,
        userPhone,
        userId: user.id
      });

      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          amount: withdrawalAmount,
          phone_number: userPhone.startsWith('254') ? userPhone : `254${userPhone.replace(/^0+/, '')}`,
          user_id: user.id,
          commission: commission,
          net_amount: netAmount
        }
      });

      if (error) {
        console.error('Withdrawal error:', error);
        throw new Error(error.message || 'Withdrawal processing failed');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to process withdrawal');
      }

      toast({
        title: "Withdrawal processed!",
        description: `KES ${netAmount.toFixed(2)} will be sent to ${userPhone}. Commission: KES ${commission.toFixed(2)}`,
      });

      onSuccess(withdrawalAmount);
      setAmount('');
      setUserPhone('');
      onClose();

    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal failed",
        description: error.message || "Failed to process withdrawal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setUserPhone('');
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Withdraw Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-1">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Available Balance: KES {userBalance.toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Minimum withdrawal: KES {minWithdrawal} • Commission: 7%
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="withdrawAmount" className="text-sm">Amount to Withdraw</Label>
            <Input
              id="withdrawAmount"
              type="number"
              placeholder={`Enter amount (min. ${minWithdrawal})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="1.00"
              min={minWithdrawal.toString()}
              max={userBalance.toString()}
              className="mt-1 text-base"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                Min: KES {minWithdrawal}, Max: KES {userBalance.toFixed(2)}
              </p>
              {withdrawalAmount > userBalance && (
                <p className="text-xs text-red-500">
                  Insufficient balance
                </p>
              )}
            </div>
          </div>

          {withdrawalAmount >= minWithdrawal && withdrawalAmount <= userBalance && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Withdrawal Amount:</span>
                  <span className="font-semibold">KES {withdrawalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>Commission (7%):</span>
                  <span className="font-semibold">- KES {commission.toFixed(2)}</span>
                </div>
                <hr className="border-yellow-300 dark:border-yellow-700" />
                <div className="flex justify-between font-bold text-green-600 dark:text-green-400">
                  <span>You'll Receive:</span>
                  <span>KES {netAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

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
              Enter the phone number to receive the withdrawal
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1 text-sm">
              Cancel
            </Button>
            <Button 
              onClick={handleWithdrawal} 
              className="flex-1 text-sm bg-red-600 hover:bg-red-700"
              disabled={
                loading || 
                !amount || 
                withdrawalAmount < minWithdrawal || 
                withdrawalAmount > userBalance || 
                !userPhone.trim() || 
                userPhone.length < 9
              }
            >
              {loading ? 'Processing...' : `Withdraw KES ${netAmount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

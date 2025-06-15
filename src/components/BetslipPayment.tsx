
import { Button } from '@/components/ui/button';

interface BetslipPaymentProps {
  dailyFee: number;
  isPaid: boolean;
  onPay: () => void;
  isProcessing: boolean;
  loading: boolean;
}

export function BetslipPayment({ dailyFee, isPaid, onPay, isProcessing, loading }: BetslipPaymentProps) {
  return (
    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-blue-900">Daily Betslip Fee</p>
          <p className="text-sm text-blue-700">
            Pay KES {dailyFee} to place unlimited bets today
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-900">KES {dailyFee}</p>
          {!isPaid && (
            <Button 
              onClick={onPay}
              disabled={loading || isProcessing}
              className="mt-2"
              size="sm"
            >
              {isProcessing ? "Processing..." : "Pay with M-Pesa"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


interface BetslipInstructionsProps {
  isPaid: boolean;
}

export function BetslipInstructions({ isPaid }: BetslipInstructionsProps) {
  if (isPaid) return null;
  return (
    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
      <p className="text-sm text-green-700 font-medium mb-1">💳 How to pay:</p>
      <p className="text-xs text-green-600">
        Click "Pay with M-Pesa" above. You'll be redirected to complete payment via PesaPal M-Pesa integration.
      </p>
    </div>
  );
}

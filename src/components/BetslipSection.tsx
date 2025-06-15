
// COMPOSE ALL THE NEW COMPONENTS TOGETHER

import { useBetslip } from '@/hooks/useBetslip';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { BetslipCard } from './BetslipCard';
import { BetslipPayment } from './BetslipPayment';
import { BetslipInstructions } from './BetslipInstructions';
import { BetslipBetsList } from './BetslipBetsList';
import { BetslipSummary } from './BetslipSummary';
import { BetslipRefresh } from './BetslipRefresh';
import { Badge } from "@/components/ui/badge";

export function BetslipSection() {
  const { currentBetslip, loading, DAILY_BETSLIP_FEE, removeBetFromBetslip, refreshBetslip } = useBetslip();
  const { profile } = useUserProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const handlePayForBetslip = async () => {
    if (!user || !profile) {
      toast({
        title: "Authentication required",
        description: "Please log in to pay for betslip.",
        variant: "destructive"
      });
      return;
    }

    setIsPaymentProcessing(true);

    try {
      // Call the PesaPal payment function
      const { data, error } = await supabase.functions.invoke('pesapal-payment', {
        body: {
          amount: DAILY_BETSLIP_FEE,
          email: user.email,
          phone_number: profile.phone_number || '254700000000',
          description: `Daily Betslip Fee - ${new Date().toDateString()}`,
          user_id: user.id
        }
      });

      if (error) {
        console.error('Payment error:', error);
        toast({
          title: "Payment failed",
          description: "Failed to initiate payment. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data.success && data.redirect_url) {
        window.open(data.redirect_url, '_blank');
        toast({
          title: "Payment initiated",
          description: "Complete your payment in the opened tab.",
        });
      } else {
        toast({
          title: "Payment failed",
          description: data.error || "Failed to create payment session.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: "Payment failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  if (!currentBetslip) {
    return (
      <BetslipCard title="Today's Betslip" date={new Date().toISOString()} isPaid={false}>
        <p className="text-center text-gray-500">Loading betslip...</p>
      </BetslipCard>
    );
  }

  return (
    <BetslipCard title="Today's Betslip" date={currentBetslip.date} isPaid={currentBetslip.isPaid}>
      <BetslipPayment
        dailyFee={DAILY_BETSLIP_FEE}
        isPaid={currentBetslip.isPaid}
        onPay={handlePayForBetslip}
        isProcessing={isPaymentProcessing}
        loading={loading}
      />

      <BetslipInstructions isPaid={currentBetslip.isPaid} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Your Bets ({currentBetslip.totalBets})</h4>
          {currentBetslip.isPaid && (
            <Badge variant="outline" className="text-green-600">
              Active Betslip
            </Badge>
          )}
        </div>
        <BetslipBetsList
          bets={currentBetslip.bets}
          isPaid={currentBetslip.isPaid}
          removeBet={removeBetFromBetslip}
        />
      </div>

      <BetslipSummary
        totalBets={currentBetslip.totalBets}
        bets={currentBetslip.bets}
      />

      <BetslipRefresh
        loading={loading}
        onRefresh={refreshBetslip}
      />
    </BetslipCard>
  );
}

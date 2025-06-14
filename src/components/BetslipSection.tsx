
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, Clock } from 'lucide-react';
import { useBetslip } from '@/hooks/useBetslip';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

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
          phone_number: profile.phone_number || '254700000000', // Use default if phone_number is undefined
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
        // Open payment page in new tab
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

  const canAffordBetslip = profile && profile.balance >= DAILY_BETSLIP_FEE;

  if (!currentBetslip) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Betslip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Loading betslip...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Betslip
          </CardTitle>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={currentBetslip.isPaid ? "default" : "secondary"}>
              {currentBetslip.isPaid ? "PAID" : "UNPAID"}
            </Badge>
            <span className="text-sm text-gray-500">
              {new Date(currentBetslip.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Status */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Daily Betslip Fee</p>
              <p className="text-sm text-blue-700">
                Pay KES {DAILY_BETSLIP_FEE} to place unlimited bets today
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">KES {DAILY_BETSLIP_FEE}</p>
              {!currentBetslip.isPaid && (
                <Button 
                  onClick={handlePayForBetslip}
                  disabled={loading || isPaymentProcessing}
                  className="mt-2"
                  size="sm"
                >
                  {isPaymentProcessing ? "Processing..." : "Pay with M-Pesa"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {!currentBetslip.isPaid && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 font-medium mb-1">💳 How to pay:</p>
            <p className="text-xs text-green-600">
              Click "Pay with M-Pesa" above. You'll be redirected to complete payment via PesaPal M-Pesa integration.
            </p>
          </div>
        )}

        {/* Bets List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Your Bets ({currentBetslip.totalBets})</h4>
            {currentBetslip.isPaid && (
              <Badge variant="outline" className="text-green-600">
                Active Betslip
              </Badge>
            )}
          </div>

          {currentBetslip.bets.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No bets placed yet</p>
              {currentBetslip.isPaid ? (
                <p className="text-sm mt-1">Start betting on matches below!</p>
              ) : (
                <p className="text-sm mt-1">Pay the daily fee to start betting</p>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {currentBetslip.bets.map((bet) => (
                <div 
                  key={bet.id} 
                  className="p-3 bg-gray-50 rounded-lg border flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{bet.matchTitle}</p>
                    <p className="text-sm text-gray-600">
                      Bet: {bet.team} • Odds: {bet.odds}x • Amount: KES {bet.amount}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(bet.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {!currentBetslip.isPaid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBetFromBetslip(bet.id)}
                      className="p-1 h-auto"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Betslip Summary */}
        {currentBetslip.bets.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg border-t">
            <div className="flex justify-between text-sm">
              <span>Total Bets:</span>
              <span className="font-medium">{currentBetslip.totalBets}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Potential Win:</span>
              <span className="font-medium text-green-600">
                KES {currentBetslip.bets.reduce((total, bet) => total + (bet.amount * bet.odds), 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshBetslip}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Refreshing..." : "Refresh Betslip"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

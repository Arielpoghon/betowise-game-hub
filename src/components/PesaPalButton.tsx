
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PesaPalButtonProps {
  amount: number;
  onSuccess: (amount: number) => void;
  userEmail?: string;
  userPhone?: string;
}

export function PesaPalButton({ amount, onSuccess, userEmail = '', userPhone = '' }: PesaPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a payment",
        variant: "destructive"
      });
      return;
    }

    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (!userPhone || userPhone.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid M-Pesa phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      console.log('Initiating PesaPal payment:', { amount, userEmail, userPhone });

      // Show loading toast
      toast({
        title: "Processing payment",
        description: "Please wait while we initialize your M-Pesa payment...",
      });

      const { data, error } = await supabase.functions.invoke('pesapal-payment', {
        body: {
          amount: amount,
          email: userEmail || user.email,
          phone_number: userPhone.startsWith('254') ? userPhone : `254${userPhone.replace(/^0+/, '')}`,
          description: `BetoWise deposit of KES ${amount}`,
          user_id: user.id
        }
      });

      if (error) {
        console.error('PesaPal payment error:', error);
        throw new Error(error.message || 'Payment initialization failed');
      }

      if (!data?.success || !data?.redirect_url) {
        throw new Error(data?.error || 'Failed to initialize payment');
      }

      console.log('Payment initialized, redirecting to:', data.redirect_url);

      // Store payment info in localStorage for success handling
      localStorage.setItem('pending_payment', JSON.stringify({
        amount,
        order_tracking_id: data.order_tracking_id,
        merchant_reference: data.merchant_reference
      }));

      toast({
        title: "Redirecting to M-Pesa",
        description: "You will be redirected to complete your payment",
      });

      // Redirect to PesaPal M-Pesa payment page
      window.location.href = data.redirect_url;

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "Failed to initialize M-Pesa payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment}
      disabled={loading || amount <= 0}
      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
    >
      {loading ? (
        <div className="flex items-center gap-2 justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-xs sm:text-sm">Processing...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 justify-center">
          <span>💳</span>
          <span className="text-xs sm:text-sm">Pay KES {amount} with M-Pesa</span>
        </div>
      )}
    </Button>
  );
}

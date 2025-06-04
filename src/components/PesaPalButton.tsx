
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

    try {
      setLoading(true);

      console.log('Initiating PesaPal payment:', { amount, userEmail, userPhone });

      const { data, error } = await supabase.functions.invoke('pesapal-payment', {
        body: {
          amount: amount,
          email: userEmail || user.email,
          phone_number: userPhone || '254700000000', // Default if not provided
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
      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Processing...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span>💳</span>
          Pay KES {amount} with M-Pesa
        </div>
      )}
    </Button>
  );
}

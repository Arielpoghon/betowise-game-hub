
import { useState, useEffect } from 'react';
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
  const [currency, setCurrency] = useState('KES');
  const [convertedAmount, setConvertedAmount] = useState(amount);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Detect user's currency based on location
    detectCurrency();
  }, []);

  useEffect(() => {
    // Convert amount based on currency
    if (currency === 'XAF') {
      // Convert KES to XAF (approximate rate: 1 KES = 4.5 XAF)
      setConvertedAmount(Math.round(amount * 4.5));
    } else {
      setConvertedAmount(amount);
    }
  }, [amount, currency]);

  const detectCurrency = async () => {
    try {
      // Try to get user's location and set appropriate currency
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      console.log('User location data:', data);
      
      // Set currency based on country
      switch (data.country_code) {
        case 'CM': // Cameroon
          setCurrency('XAF'); // Central African CFA franc
          break;
        case 'KE': // Kenya
        default:
          setCurrency('KES'); // Kenyan Shilling (default)
          break;
      }
    } catch (error) {
      console.log('Could not detect location, using default currency KES');
      setCurrency('KES');
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a payment",
        variant: "destructive"
      });
      return;
    }

    if (convertedAmount <= 0) {
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
        description: `Please enter a valid ${currency === 'XAF' ? 'Mobile Money' : 'M-Pesa'} phone number`,
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      console.log('Initiating PesaPal payment:', { amount: convertedAmount, currency, userEmail, userPhone });

      // Show loading toast
      toast({
        title: "Processing payment",
        description: `Please wait while we initialize your ${currency === 'XAF' ? 'Mobile Money' : 'M-Pesa'} payment...`,
      });

      const { data, error } = await supabase.functions.invoke('pesapal-payment', {
        body: {
          amount: convertedAmount,
          currency: currency,
          email: userEmail || user.email,
          phone_number: userPhone.startsWith('254') || userPhone.startsWith('237') ? userPhone : 
                       currency === 'XAF' ? `237${userPhone.replace(/^0+/, '')}` : `254${userPhone.replace(/^0+/, '')}`,
          description: `BetoWise deposit of ${currency} ${convertedAmount}`,
          user_id: user.id,
          original_amount_kes: amount // Keep track of original KES amount
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
        amount: convertedAmount,
        currency,
        original_amount_kes: amount,
        order_tracking_id: data.order_tracking_id,
        merchant_reference: data.merchant_reference
      }));

      toast({
        title: `Redirecting to ${currency === 'XAF' ? 'Mobile Money' : 'M-Pesa'}`,
        description: "You will be redirected to complete your payment",
      });

      // Redirect to PesaPal payment page
      window.location.href = data.redirect_url;

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || `Failed to initialize ${currency === 'XAF' ? 'Mobile Money' : 'M-Pesa'} payment. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment}
      disabled={loading || convertedAmount <= 0}
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
          <span className="text-xs sm:text-sm">
            Pay {currency} {convertedAmount} with {currency === 'XAF' ? 'Mobile Money' : 'M-Pesa'}
            {currency === 'XAF' && (
              <div className="text-xs opacity-75">
                (≈ KES {amount})
              </div>
            )}
          </span>
        </div>
      )}
    </Button>
  );
}


import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  amount: number;
  onSuccess: (amount: number) => void;
}

export function PayPalButton({ amount, onSuccess }: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load PayPal SDK if not already loaded
    if (!window.paypal) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=Acsx2t7UDtjqNzAlmQljYljFdz8uyvLJJNvmIdo7ul2d-CqKNbi8TainIxdp0fUBjmCQGmFyDzICkhXn&currency=USD`;
      script.async = true;
      script.onload = () => {
        renderPayPalButtons();
      };
      document.head.appendChild(script);
    } else {
      renderPayPalButtons();
    }

    return () => {
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
    };
  }, [amount]);

  const renderPayPalButtons = () => {
    if (!window.paypal || !paypalRef.current) return;

    // Clear existing buttons
    paypalRef.current.innerHTML = '';

    const paypal = window.paypal;

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        // Convert KES to USD (approximate rate: 1 USD = 130 KES)
        const amountUSD = (amount / 130).toFixed(2);
        
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amountUSD,
              currency_code: 'USD'
            },
            description: `BetoWise deposit - KES ${amount}`
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        try {
          const details = await actions.order.capture();
          const paidAmountUSD = parseFloat(details.purchase_units[0].amount.value);
          
          // Convert back to KES for local processing
          const paidAmountKES = Math.round(paidAmountUSD * 130);
          
          onSuccess(paidAmountKES);
          
          toast({
            title: "Payment successful!",
            description: `$${paidAmountUSD} (KES ${paidAmountKES}) has been added to your balance.`
          });
        } catch (error) {
          console.error('PayPal payment error:', error);
          toast({
            title: "Payment failed",
            description: "There was an error processing your payment.",
            variant: "destructive"
          });
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        toast({
          title: "Payment error",
          description: "PayPal encountered an error. Please try again.",
          variant: "destructive"
        });
      },
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      }
    }).render(paypalRef.current);
  };

  // Convert amount to USD for display
  const amountUSD = (amount / 130).toFixed(2);

  return (
    <div className="space-y-2">
      <div className="text-center text-sm text-muted-foreground">
        Pay approximately $${amountUSD} USD (KES {amount})
      </div>
      <div ref={paypalRef} />
    </div>
  );
}

// Add PayPal types to window
declare global {
  interface Window {
    paypal: any;
  }
}

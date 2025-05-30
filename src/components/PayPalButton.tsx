
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
    if (!window.paypal || !paypalRef.current) return;

    const paypal = window.paypal;

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount.toString(),
              currency_code: 'USD'
            }
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        try {
          const details = await actions.order.capture();
          const paidAmount = parseFloat(details.purchase_units[0].amount.value);
          onSuccess(paidAmount);
          
          toast({
            title: "Payment successful!",
            description: `$${paidAmount} has been added to your balance.`
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
      }
    }).render(paypalRef.current);

    return () => {
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
    };
  }, [amount, onSuccess, toast]);

  return <div ref={paypalRef} />;
}

// Add PayPal types to window
declare global {
  interface Window {
    paypal: any;
  }
}


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Shield, ArrowLeft } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export function EmailVerification({ email, onVerified, onBack }: EmailVerificationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-email-code', {
        body: { email, code }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Email verified!",
          description: "Your email has been successfully verified.",
        });
        onVerified();
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Code resent",
        description: `New verification code sent to ${email}`,
      });

      // For demo purposes - show the code in the toast
      if (data.code) {
        toast({
          title: "Demo Code",
          description: `Your verification code is: ${data.code}`,
          duration: 10000
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification code",
        variant: "destructive"
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:scale-105 transition-transform">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl text-center text-yellow-400 flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Verify Email
            </CardTitle>
          </div>
          <CardDescription className="text-center text-gray-300">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="bg-gray-700 border-gray-600 text-white text-center text-2xl tracking-widest hover:border-yellow-400 focus:border-yellow-400 transition-colors"
                autoFocus
              />
              <div className="text-xs text-gray-400 text-center">
                Code expires in 10 minutes
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold hover:scale-105 transition-all" 
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Verify Email
                </div>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="text-yellow-400 hover:text-yellow-300 text-sm underline transition-colors"
              >
                {resending ? 'Resending...' : "Didn't receive code? Resend"}
              </button>
            </div>
          </form>

          <div className="mt-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded text-sm">
            <strong>Demo Mode:</strong> Check the browser console or notifications for your verification code
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

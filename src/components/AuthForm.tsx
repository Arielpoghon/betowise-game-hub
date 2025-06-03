
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import { EmailVerification } from './EmailVerification';

interface AuthFormProps {
  onBack?: () => void;
}

export function AuthForm({ onBack }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const { signIn, signUp, verifyEmail } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error, needsVerification } = await signUp(email, password, username);
    
    if (error) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive"
      });
    } else if (needsVerification) {
      setPendingEmail(email);
      setShowVerification(true);
      toast({
        title: "Verification required",
        description: "Please check your email for the verification code.",
      });
    } else {
      toast({
        title: "Account created successfully!",
        description: "Welcome to BetoWise! You're now logged in.",
        duration: 5000
      });
      // Clear form
      setEmail('');
      setPassword('');
      setUsername('');
    }
    
    setLoading(false);
  };

  const handleEmailVerified = async () => {
    // After email verification, sign the user in
    const { error } = await signIn(pendingEmail, password);
    
    if (error) {
      toast({
        title: "Error signing in",
        description: "Please try logging in manually.",
        variant: "destructive"
      });
      setShowVerification(false);
    } else {
      toast({
        title: "Welcome to BetoWise!",
        description: "Your account has been verified and you're now logged in.",
        duration: 5000
      });
      setShowVerification(false);
      // Clear form
      setEmail('');
      setPassword('');
      setUsername('');
      setPendingEmail('');
    }
  };

  if (showVerification) {
    return (
      <EmailVerification
        email={pendingEmail}
        onVerified={handleEmailVerified}
        onBack={() => setShowVerification(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="hover:scale-105 transition-transform">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-2xl text-center text-yellow-400 hover:scale-105 transition-transform">
              BetoWise
            </CardTitle>
          </div>
          <CardDescription className="text-center text-gray-300">
            Join the ultimate betting platform with email verification!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black transition-all hover:scale-105"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black transition-all hover:scale-105"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="animate-fade-in">
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 transition-colors"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 transition-colors"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold hover:scale-105 transition-all" 
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="animate-fade-in">
              <form onSubmit={handleSignUp} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 transition-colors"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 transition-colors"
                />
                <Input
                  type="password"
                  placeholder="Password (minimum 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-gray-700 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 transition-colors"
                />
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded text-sm">
                  ✅ Email verification required for account security
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold hover:scale-105 transition-all" 
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { MatchCard } from './MatchCard';
import { BetDialog } from './BetDialog';
import { DepositDialog } from './DepositDialog';
import { WithdrawalDialog } from './WithdrawalDialog';
import { FooterDescription } from './FooterDescription';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRealTimeMatches } from '@/hooks/useRealTimeMatches';

// Import the Match type from useRealTimeMatches instead of defining it here
type Match = ReturnType<typeof useRealTimeMatches>['matches'][0];

interface BetDialogData {
  match: Match;
  market: { id: string; name: string; market_type: string };
  odds: { id: string; outcome: string; odds: number };
}

export function BettingDashboard() {
  const { user, signOut } = useAuth();
  const { profile, loading, fetchProfile, updateBalance } = useUserProfile();
  const { toast } = useToast();
  const [betDialogData, setBetDialogData] = useState<BetDialogData | null>(null);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  
  const { matches, loading: matchesLoading } = useRealTimeMatches();

  useEffect(() => {
    // Check for payment success/failure in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency');

    if (paymentStatus === 'success' && amount) {
      toast({
        title: "Payment Successful!",
        description: `Your account has been credited with ${currency || 'KES'} ${amount}`,
        duration: 5000,
      });
      // Refresh profile to get updated balance
      fetchProfile();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failed') {
      toast({
        title: "Payment Failed",
        description: "Your payment was not successful. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, fetchProfile]);

  const handlePlaceBet = (match: Match, team: string, odds: number) => {
    setBetDialogData({ 
      match, 
      market: { id: 'winner', name: 'Match Winner', market_type: 'winner' },
      odds: { id: 'team_odds', outcome: team, odds }
    });
  };

  const handleBetSuccess = async (betAmount: number) => {
    if (profile) {
      const newBalance = profile.balance - betAmount;
      await updateBalance(newBalance);
      toast({
        title: "Bet placed successfully!",
        description: `You bet KES ${betAmount}. Good luck!`,
      });
    }
  };

  const handleDepositSuccess = async (depositAmount: number) => {
    toast({
      title: "Processing payment...",
      description: "Please wait while we process your deposit.",
    });
    // The balance will be updated via the callback when payment is confirmed
    setTimeout(() => {
      fetchProfile(); // Refresh profile after a short delay
    }, 2000);
  };

  const handleWithdrawalSuccess = async (withdrawalAmount: number) => {
    if (profile) {
      const newBalance = profile.balance - withdrawalAmount;
      await updateBalance(newBalance);
      toast({
        title: "Withdrawal processed!",
        description: `KES ${withdrawalAmount} has been deducted from your account.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                BetoWise
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {profile && (
                <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CardContent className="p-2 sm:p-3">
                    <div className="text-center">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Balance
                      </p>
                      <p className="text-sm sm:text-base font-bold text-green-700 dark:text-green-300">
                        KES {Number(profile.balance).toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Button 
                onClick={() => setDepositDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs sm:text-sm"
              >
                + Deposit
              </Button>

              <Button 
                onClick={() => setWithdrawalDialogOpen(true)}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 px-3 py-2 text-xs sm:text-sm"
                disabled={!profile || profile.balance < 100}
              >
                Withdraw
              </Button>
              
              <Button 
                variant="outline" 
                onClick={signOut}
                className="px-3 py-2 text-xs sm:text-sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {profile?.username || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Choose your sport and place your bets on live matches
          </p>
        </div>

        {/* Matches Grid */}
        <div className="space-y-4">
          {matchesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading matches...</p>
            </div>
          ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onBet={handlePlaceBet}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No matches available at the moment.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Description */}
      <FooterDescription />

      {/* Dialogs */}
      {betDialogData && (
        <BetDialog
          open={!!betDialogData}
          onClose={() => setBetDialogData(null)}
          match={betDialogData.match}
          market={betDialogData.market}
          odds={betDialogData.odds}
          userBalance={profile?.balance || 0}
          onConfirm={handleBetSuccess}
        />
      )}

      <DepositDialog
        open={depositDialogOpen}
        onClose={() => setDepositDialogOpen(false)}
        onSuccess={handleDepositSuccess}
      />

      <WithdrawalDialog
        open={withdrawalDialogOpen}
        onClose={() => setWithdrawalDialogOpen(false)}
        userBalance={profile?.balance || 0}
        onSuccess={handleWithdrawalSuccess}
      />
    </div>
  );
}


import { useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { BetDialog } from './BetDialog';
import { DepositDialog } from './DepositDialog';
import { WithdrawalDialog } from './WithdrawalDialog';
import { FooterDescription } from './FooterDescription';
import { useRealTimeMatches } from '@/hooks/useRealTimeMatches';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardNavigation } from './dashboard/DashboardNavigation';
import { DashboardWelcome } from './dashboard/DashboardWelcome';
import { MatchesGrid } from './dashboard/MatchesGrid';
import { DashboardFooter } from './dashboard/DashboardFooter';

// Use the Match type from useRealTimeMatches
type Match = ReturnType<typeof useRealTimeMatches>['matches'][0];

interface BetDialogData {
  match: Match;
  market: { id: string; name: string; market_type: string };
  odds: { id: string; outcome: string; odds: number };
}

export function BettingDashboard() {
  const { profile, loading, fetchProfile, updateBalance } = useUserProfile();
  const { toast } = useToast();
  const [betDialogData, setBetDialogData] = useState<BetDialogData | null>(null);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  
  const { matches, loading: matchesLoading } = useRealTimeMatches();

  // Minimum balance required to place bets
  const MIN_BETTING_BALANCE = 499;

  useEffect(() => {
    // Check for payment success/failure in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency');

    if (paymentStatus === 'success' && amount) {
      const depositAmount = parseFloat(amount);
      toast({
        title: "Payment Successful!",
        description: `Your account has been credited with ${currency || 'KES'} ${amount}`,
        duration: 5000,
      });
      // Update balance immediately and refresh profile
      if (profile) {
        updateBalance(profile.balance + depositAmount);
      }
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
  }, [toast, fetchProfile, profile, updateBalance]);

  const handlePlaceBet = (match: Match, team: string, odds: number) => {
    // Check if user has minimum balance to place bets
    if (!profile || profile.balance < MIN_BETTING_BALANCE) {
      toast({
        title: "Insufficient funds",
        description: `You need at least KES ${MIN_BETTING_BALANCE} to place a bet. Please deposit funds first.`,
        variant: "destructive"
      });
      return;
    }

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
    if (profile) {
      const newBalance = profile.balance + depositAmount;
      await updateBalance(newBalance);
      toast({
        title: "Deposit successful!",
        description: `KES ${depositAmount} has been added to your account.`,
      });
    }
    // Also refresh profile to ensure synchronization
    setTimeout(() => {
      fetchProfile();
    }, 1000);
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

  const handleComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon!",
      description: `${feature} will be available soon. Stay tuned!`,
    });
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
      <DashboardHeader 
        onDepositClick={() => setDepositDialogOpen(true)}
        onWithdrawalClick={() => setWithdrawalDialogOpen(true)}
      />

      <DashboardNavigation onComingSoon={handleComingSoon} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardWelcome minBettingBalance={MIN_BETTING_BALANCE} />

        {/* Matches Grid */}
        <div className="space-y-4">
          <MatchesGrid 
            matches={matches}
            loading={matchesLoading}
            onBet={handlePlaceBet}
            disabled={!profile || profile.balance < MIN_BETTING_BALANCE}
          />
        </div>
      </main>

      {/* Footer Description */}
      <FooterDescription />

      <DashboardFooter />

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

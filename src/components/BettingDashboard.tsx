
import { useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { DepositDialog } from './DepositDialog';
import { WithdrawalDialog } from './WithdrawalDialog';
import { FooterDescription } from './FooterDescription';
import { BetslipSection } from './BetslipSection';
import { useRealTimeMatches } from '@/hooks/useRealTimeMatches';
import { useBetslip } from '@/hooks/useBetslip';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardNavigation } from './dashboard/DashboardNavigation';
import { DashboardWelcome } from './dashboard/DashboardWelcome';
import { MatchesGrid } from './dashboard/MatchesGrid';
import { DashboardFooter } from './dashboard/DashboardFooter';

// Use the Match type from useRealTimeMatches
type Match = ReturnType<typeof useRealTimeMatches>['matches'][0];

export function BettingDashboard() {
  const { profile, loading, fetchProfile, updateBalance } = useUserProfile();
  const { toast } = useToast();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  
  const { matches, loading: matchesLoading } = useRealTimeMatches();
  const { currentBetslip, DAILY_BETSLIP_FEE, addBetToBetslip } = useBetslip();

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
    // Check if user has paid for today's betslip
    if (!currentBetslip?.isPaid) {
      toast({
        title: "Betslip payment required",
        description: `Please pay KES ${DAILY_BETSLIP_FEE} for today's betslip to place bets.`,
        variant: "destructive"
      });
      return;
    }

    // Add bet to betslip for tracking (bet is already placed in database by MatchCard)
    addBetToBetslip({
      matchId: match.id,
      matchTitle: match.title,
      team: team,
      odds: odds,
      amount: 100 // Default amount used in MatchCard
    });

    toast({
      title: "Bet placed successfully!",
      description: `You bet KES 100 on ${team} for ${match.title}. Good luck!`,
    });
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
        <DashboardWelcome minBettingBalance={DAILY_BETSLIP_FEE} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Betslip Section - Left Column on Large Screens */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <BetslipSection />
          </div>

          {/* Matches Grid - Right Columns */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fixed Matches
              </h3>
              <MatchesGrid 
                matches={matches}
                loading={matchesLoading}
                onBet={handlePlaceBet}
                disabled={!profile || !currentBetslip?.isPaid}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Description */}
      <FooterDescription />

      <DashboardFooter />

      {/* Dialogs */}
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

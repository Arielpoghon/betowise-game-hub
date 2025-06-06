
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

// Use the Match type from useRealTimeMatches
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
                disabled={!profile || profile.balance < 2000}
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
          
          {/* Betting Requirements Notice */}
          {profile && profile.balance < MIN_BETTING_BALANCE && (
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                💡 You need at least KES {MIN_BETTING_BALANCE} in your account to place bets. Please deposit funds to start betting.
              </p>
            </div>
          )}
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
                  disabled={!profile || profile.balance < MIN_BETTING_BALANCE}
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

      {/* Website Description Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Betowise Soccer Betting</h2>
              <p className="text-gray-300 leading-relaxed">
                Join our community of soccer betting fans with the Betowise online sports betting site that allows you to bet on all your favourite football teams
              </p>
            </div>

            <div>
              <p className="text-gray-300 leading-relaxed mb-4">
                Whether you call it soccer or football, the lovely game draws crowds and punters from around the globe. Now you can join in the spirit of Betowise football from the comfort of your own home by placing an online bet on almost any professional football league in the world. Follow us for more great soccer betting tips and all the latest football news and soccer predictions. Our expert information could make you the next big online sports betting winner!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-3">Place English Premier League soccer bets</h3>
              <p className="text-gray-300 leading-relaxed">
                Are you an English Premier League fan? We bet you are! Take your pick of Manchester United, Chelsea, Arsenal, Liverpool or Tottenham Hotspur to stay in the international soccer betting game and you could make a name for yourself, not to mention a few welcome winnings in your pocket.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-3">Keep it real with local team support!</h3>
              <p className="text-gray-300 leading-relaxed">
                If you're more of a local, homegrown football fanatic, we've also got you covered. We know just how exciting it is to support our local teams who come from the same city or towns that you grew up in so we've got the odds set for teams like AFC Leopards or Gor Mahia. If that's not enough we also have Fantasy Premier League so you can put yourself in the role of football manager and play out your dream soccer match with your hand-picked squad of real-life players.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-3">Open a Betowise Soccer Betting Account and strike a goal</h3>
              <p className="text-gray-300 leading-relaxed">
                You can't win it if you're not in it. Sign-up and be part of this exciting and fulfilling adventure. Ardent fans who fancy themselves a bit of a soccer score prediction whizz will have so much fun. Register for a betting account with Betowise and you stand the chance to win big and bag the bragging rights with your sports-loving friends. Our safe and secure online soccer betting portal is fully registered and offers instant deposits and withdrawals.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-3">How to register for soccer betting with Betowise</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                You must be at least 18 years of age to register with Betowise. There are three easy ways to sign-up with Betowise and place your soccer bets. You can register directly on the online platform or by SMS or by dialling in on your phone. If you wish to register online, you will need to visit our official site and select 'Profile' if you're registering with your phone or 'Register' if you're using a PC or laptop. Enter your phone number and 'Send Code,' which you will need to verify once you receive the SMS. Select 'Verify Code' and create a new password. Once you've verified your password and accepted our Terms and Conditions, you will be all set to start soccer betting and get the latest football betting tips.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-yellow-400 mb-3">Learn More</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>Terms & Conditions</li>
                    <li>Responsible Gaming Policy</li>
                    <li>Privacy policy</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-yellow-400 mb-3">Play</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>Sports</li>
                    <li>Jackpots</li>
                    <li>Virtuals</li>
                    <li>Casino</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-yellow-400 mb-3">License</h4>
                  <p className="text-gray-300 text-sm">
                    Shop and Deliver Limited is licensed by BCLB (Betting Control and Licensing Board of Kenya) under the Betting, Lotteries and Gaming Act, Cap 131, Laws of Kenya under License Numbers: BK 0000679 and PG 0000394.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-700 text-center">
                <div className="flex justify-center items-center space-x-4 mb-4">
                  <span className="text-2xl font-bold text-red-500">18+</span>
                  <p className="text-gray-300 text-sm">
                    Must be 18 years of age or older to register or play at Betowise. Gambling may have adverse effects if not done with moderation.
                  </p>
                </div>
                <p className="text-gray-400 text-xs">
                  © 2024 Betowise. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

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

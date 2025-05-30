
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { MatchCard } from './MatchCard';
import { BetDialog } from './BetDialog';
import { DepositDialog } from './DepositDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, LogOut, Plus } from 'lucide-react';

interface Match {
  id: string;
  title: string;
  team_a: string;
  team_b: string;
  start_time: string;
  status: string;
  odds_team_a: number;
  odds_team_b: number;
  odds_draw: number;
}

interface Bet {
  id: string;
  match_id: string;
  amount: number;
  team_choice: string;
  odds: number;
  potential_payout: number;
  status: string;
  created_at: string;
  matches: Match;
}

export function BettingDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedOdds, setSelectedOdds] = useState<number>(0);
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const { signOut } = useAuth();
  const { profile, updateBalance } = useUserProfile();
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
    fetchUserBets();
    
    // Set up real-time subscriptions
    const matchesSubscription = supabase
      .channel('matches-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchMatches)
      .subscribe();

    const betsSubscription = supabase
      .channel('bets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bets' }, fetchUserBets)
      .subscribe();

    return () => {
      supabase.removeChannel(matchesSubscription);
      supabase.removeChannel(betsSubscription);
    };
  }, []);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching matches:', error);
    } else {
      setMatches(data || []);
    }
    setLoading(false);
  };

  const fetchUserBets = async () => {
    const { data, error } = await supabase
      .from('bets')
      .select(`
        *,
        matches (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bets:', error);
    } else {
      setUserBets(data || []);
    }
  };

  const handleBetClick = (match: Match, team: string, odds: number) => {
    setSelectedMatch(match);
    setSelectedTeam(team);
    setSelectedOdds(odds);
    setShowBetDialog(true);
  };

  const handlePlaceBet = async (amount: number) => {
    if (!selectedMatch || !profile) return;

    const potentialPayout = amount * selectedOdds;

    const { error } = await supabase
      .from('bets')
      .insert({
        user_id: profile.id,
        match_id: selectedMatch.id,
        amount,
        team_choice: selectedTeam,
        odds: selectedOdds,
        potential_payout: potentialPayout,
        status: 'pending'
      });

    if (error) {
      toast({
        title: "Error placing bet",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Update user balance
      await updateBalance(profile.balance - amount);
      
      toast({
        title: "Bet placed successfully!",
        description: `You bet $${amount} on ${getTeamDisplay(selectedTeam, selectedMatch)}`
      });
      
      fetchUserBets();
    }
  };

  const handleDeposit = async (amount: number) => {
    if (!profile) return;
    
    await updateBalance(profile.balance + amount);
    toast({
      title: "Deposit successful!",
      description: `$${amount} has been added to your balance.`
    });
  };

  const getTeamDisplay = (team: string, match: Match) => {
    if (team === 'team_a') return match.team_a;
    if (team === 'team_b') return match.team_b;
    return 'Draw';
  };

  const getBetStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-500';
      case 'lost': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">BetoWise</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Wallet className="h-4 w-4" />
                <span className="font-semibold">${profile?.balance.toFixed(2) || '0.00'}</span>
              </div>
              
              <Button onClick={() => setShowDepositDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Deposit
              </Button>
              
              <Button variant="outline" onClick={signOut} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Matches */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Available Matches</h2>
            <div className="space-y-4">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onBet={handleBetClick}
                  disabled={!profile || profile.balance <= 0}
                />
              ))}
            </div>
          </div>

          {/* User Bets */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Your Bets</h2>
            <div className="space-y-4">
              {userBets.map((bet) => (
                <Card key={bet.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm">{bet.matches.title}</CardTitle>
                      <Badge className={getBetStatusColor(bet.status)}>
                        {bet.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p>Team: <span className="font-medium">{getTeamDisplay(bet.team_choice, bet.matches)}</span></p>
                      <p>Bet: <span className="font-medium">${bet.amount}</span></p>
                      <p>Odds: <span className="font-medium">{bet.odds}x</span></p>
                      <p>Potential win: <span className="font-medium text-green-600">${bet.potential_payout.toFixed(2)}</span></p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {userBets.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No bets placed yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <BetDialog
        open={showBetDialog}
        onClose={() => setShowBetDialog(false)}
        onConfirm={handlePlaceBet}
        match={selectedMatch}
        team={selectedTeam}
        odds={selectedOdds}
        userBalance={profile?.balance || 0}
      />
      
      <DepositDialog
        open={showDepositDialog}
        onClose={() => setShowDepositDialog(false)}
        onSuccess={handleDeposit}
      />
    </div>
  );
}

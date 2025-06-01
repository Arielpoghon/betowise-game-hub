
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
  start_time: string;
  status: string;
  created_at: string;
  home_team?: { name: string; logo_url?: string };
  away_team?: { name: string; logo_url?: string };
  league?: { name: string; country?: string };
}

interface Market {
  id: string;
  match_id: string;
  market_type: string;
  name: string;
  odds: Array<{
    id: string;
    outcome_name: string;
    odds_decimal: number;
    is_active: boolean;
  }>;
}

interface Bet {
  id: string;
  user_id: string;
  total_stake: number;
  potential_payout: number;
  actual_payout: number;
  status: string;
  bet_type: string;
  placed_at: string;
  settled_at?: string;
  bet_selections: Array<{
    id: string;
    selected_outcome: string;
    odds_at_placement: number;
    status: string;
    market: {
      name: string;
      match: {
        title?: string;
        home_team?: { name: string };
        away_team?: { name: string };
      };
    };
  }>;
}

export function BettingDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedOdds, setSelectedOdds] = useState<{ id: string; outcome: string; odds: number } | null>(null);
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

    const oddsSubscription = supabase
      .channel('odds-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'odds' }, fetchMatches)
      .subscribe();

    const betsSubscription = supabase
      .channel('bets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bets' }, fetchUserBets)
      .subscribe();

    return () => {
      supabase.removeChannel(matchesSubscription);
      supabase.removeChannel(oddsSubscription);
      supabase.removeChannel(betsSubscription);
    };
  }, []);

  const fetchMatches = async () => {
    // Fetch matches with teams and leagues
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        match_date,
        status,
        home_score,
        away_score,
        home_team:teams!matches_home_team_id_fkey(name, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, logo_url),
        league:leagues(name, country)
      `)
      .order('match_date', { ascending: true });

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      setLoading(false);
      return;
    }

    // Transform the data to match our interface
    const formattedMatches = matchesData?.map(match => ({
      id: match.id,
      title: `${match.home_team?.name} vs ${match.away_team?.name}`,
      start_time: match.match_date,
      status: match.status,
      created_at: match.match_date,
      home_team: match.home_team,
      away_team: match.away_team,
      league: match.league
    })) || [];

    setMatches(formattedMatches);

    // Fetch markets and odds for these matches
    if (matchesData && matchesData.length > 0) {
      const matchIds = matchesData.map(match => match.id);
      
      const { data: marketsData, error: marketsError } = await supabase
        .from('markets')
        .select(`
          id,
          match_id,
          market_type,
          name,
          odds(id, outcome_name, odds_decimal, is_active)
        `)
        .in('match_id', matchIds)
        .eq('is_active', true);

      if (marketsError) {
        console.error('Error fetching markets:', marketsError);
      } else {
        setMarkets(marketsData || []);
      }
    }

    setLoading(false);
  };

  const fetchUserBets = async () => {
    if (!profile) return;

    const { data: betsData, error: betsError } = await supabase
      .from('bets')
      .select(`
        id,
        user_id,
        total_stake,
        potential_payout,
        actual_payout,
        status,
        bet_type,
        placed_at,
        settled_at,
        bet_selections(
          id,
          selected_outcome,
          odds_at_placement,
          status,
          market:markets(
            name,
            match:matches(
              id,
              home_team:teams!matches_home_team_id_fkey(name),
              away_team:teams!matches_away_team_id_fkey(name)
            )
          )
        )
      `)
      .eq('user_id', profile.id)
      .order('placed_at', { ascending: false });

    if (betsError) {
      console.error('Error fetching bets:', betsError);
    } else {
      // Transform the data to include match titles
      const formattedBets = betsData?.map(bet => ({
        ...bet,
        bet_selections: bet.bet_selections.map(selection => ({
          ...selection,
          market: {
            ...selection.market,
            match: {
              ...selection.market.match,
              title: `${selection.market.match.home_team?.name} vs ${selection.market.match.away_team?.name}`
            }
          }
        }))
      })) || [];

      setUserBets(formattedBets);
    }
  };

  const handleBetClick = (match: Match, marketId: string, oddsId: string, outcome: string, odds: number) => {
    const market = markets.find(m => m.id === marketId);
    if (!market) return;

    setSelectedMatch(match);
    setSelectedMarket(market);
    setSelectedOdds({ id: oddsId, outcome, odds });
    setShowBetDialog(true);
  };

  const handlePlaceBet = async (amount: number) => {
    if (!selectedMatch || !selectedMarket || !selectedOdds || !profile) return;

    try {
      // Use the place_bet function for proper bet placement
      const { data, error } = await supabase.rpc('place_bet', {
        p_user_id: profile.id,
        p_selections: JSON.stringify([{
          market_id: selectedMarket.id,
          odds_id: selectedOdds.id,
          outcome: selectedOdds.outcome
        }]),
        p_total_stake: amount,
        p_bet_type: 'single'
      });

      if (error) {
        toast({
          title: "Error placing bet",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Bet placed successfully!",
          description: `You bet $${amount} on ${selectedOdds.outcome} for ${selectedMatch.title}`
        });
        
        // Refresh data
        fetchUserBets();
        if (profile) {
          // Update balance locally (it's already updated by the function)
          await updateBalance(profile.balance - amount);
        }
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Error placing bet",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
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

  const getBetStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-500';
      case 'lost': return 'bg-red-500';
      case 'void': return 'bg-gray-500';
      case 'cashout': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  const getMatchMarketsForDisplay = (matchId: string) => {
    return markets.filter(market => market.match_id === matchId && market.odds.length > 0);
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
              {matches.map((match) => {
                const matchMarkets = getMatchMarketsForDisplay(match.id);
                return (
                  <Card key={match.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{match.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {match.league?.name} • {new Date(match.start_time).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={match.status === 'scheduled' ? 'bg-green-500' : 'bg-gray-500'}>
                          {match.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {matchMarkets.length > 0 ? (
                        <div className="space-y-3">
                          {matchMarkets.slice(0, 2).map((market) => (
                            <div key={market.id}>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">{market.name}</h4>
                              <div className="grid grid-cols-3 gap-2">
                                {market.odds.filter(odd => odd.is_active).map((odd) => (
                                  <Button
                                    key={odd.id}
                                    onClick={() => handleBetClick(match, market.id, odd.id, odd.outcome_name, odd.odds_decimal)}
                                    disabled={!profile || profile.balance <= 0 || match.status !== 'scheduled'}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                  >
                                    <div className="text-center">
                                      <div>{odd.outcome_name}</div>
                                      <div className="font-bold">{odd.odds_decimal}</div>
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No betting markets available</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
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
                      <CardTitle className="text-sm">
                        {bet.bet_selections[0]?.market?.match?.title || 'Unknown Match'}
                      </CardTitle>
                      <Badge className={getBetStatusColor(bet.status)}>
                        {bet.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p>Market: <span className="font-medium">{bet.bet_selections[0]?.market?.name}</span></p>
                      <p>Selection: <span className="font-medium">{bet.bet_selections[0]?.selected_outcome}</span></p>
                      <p>Stake: <span className="font-medium">${bet.total_stake}</span></p>
                      <p>Potential: <span className="font-medium">${bet.potential_payout}</span></p>
                      {bet.actual_payout > 0 && (
                        <p>Payout: <span className="font-medium text-green-600">${bet.actual_payout}</span></p>
                      )}
                      <p>Date: <span className="font-medium">{new Date(bet.placed_at).toLocaleDateString()}</span></p>
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
        market={selectedMarket}
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

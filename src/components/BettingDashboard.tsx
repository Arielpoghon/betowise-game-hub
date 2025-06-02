
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { BetDialog } from './BetDialog';
import { DepositDialog } from './DepositDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Menu, 
  Search, 
  Bell,
  LogOut,
  Plus,
  Trophy,
  Clock,
  TrendingUp,
  RefreshCw,
  Wallet,
  Filter,
  Star
} from 'lucide-react';

interface Match {
  id: string;
  title: string;
  start_time: string;
  status: string;
  created_at: string;
}

interface UserBet {
  id: number;
  user_id: string;
  match_id: string;
  team_choice: string;
  amount: number;
  status: string;
  created_at: string;
}

const sportsCategories = [
  { name: 'Soccer', icon: '⚽', active: true },
  { name: 'Boxing', icon: '🥊' },
  { name: 'Rugby', icon: '🏉' },
  { name: 'Aussie Rules', icon: '🏈' },
  { name: 'Baseball', icon: '⚾' },
  { name: 'Table Tennis', icon: '🏓' },
  { name: 'Cricket', icon: '🏏' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Futsal', icon: '⚽' },
  { name: 'Volleyball', icon: '🏐' },
  { name: 'Hockey', icon: '🏒' }
];

export function BettingDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedOdds, setSelectedOdds] = useState<number>(0);
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [selectedSport, setSelectedSport] = useState('Soccer');
  const [loading, setLoading] = useState(true);
  const [updatingMatches, setUpdatingMatches] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(3);

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
    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'open')
        .order('start_time', { ascending: true })
        .limit(10);

      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
        toast({
          title: "Error fetching matches",
          description: "Using sample data instead",
          variant: "destructive"
        });
        // Fallback to sample data
        setMatches([
          {
            id: '1',
            title: 'Flamengo Rj vs Fortaleza Ec',
            start_time: '2025-06-02T00:30:00',
            status: 'open',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Sc Corinthians vs Ec Vitoria',
            start_time: '2025-06-02T00:30:00',
            status: 'open',
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        setMatches(matchesData || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBets = async () => {
    if (!profile) return;

    const { data: betsData, error: betsError } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (betsError) {
      console.error('Error fetching bets:', betsError);
    } else {
      setUserBets(betsData || []);
    }
  };

  const updateMatches = async () => {
    setUpdatingMatches(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-matches');
      
      if (error) {
        toast({
          title: "Error updating matches",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Matches updated!",
          description: `Updated ${data?.updated || 0} matches`
        });
        fetchMatches();
      }
    } catch (error) {
      console.error('Error calling edge function:', error);
      toast({
        title: "Error updating matches",
        description: "Failed to fetch latest matches",
        variant: "destructive"
      });
    } finally {
      setUpdatingMatches(false);
    }
  };

  const handleBetClick = (match: Match, team: string, odds: number) => {
    if (!profile) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to place bets",
        variant: "destructive"
      });
      return;
    }

    if (profile.balance <= 0) {
      toast({
        title: "Insufficient balance",
        description: "Please deposit funds to place bets",
        variant: "destructive"
      });
      setShowDepositDialog(true);
      return;
    }

    setSelectedMatch(match);
    setSelectedTeam(team);
    setSelectedOdds(odds);
    setShowBetDialog(true);

    toast({
      title: "Bet slip opened",
      description: `Selected ${team} with odds ${odds}`
    });
  };

  const handlePlaceBet = async (amount: number) => {
    if (!selectedMatch || !profile) return;

    try {
      const { data, error } = await supabase
        .from('bets')
        .insert({
          user_id: profile.id,
          match_id: selectedMatch.id,
          team_choice: selectedTeam,
          amount: amount,
          status: 'pending'
        });

      if (error) {
        toast({
          title: "Error placing bet",
          description: error.message,
          variant: "destructive"
        });
      } else {
        await updateBalance(profile.balance - amount);
        
        toast({
          title: "Bet placed successfully!",
          description: `You bet $${amount} on ${selectedTeam} for ${selectedMatch.title}`
        });
        
        fetchUserBets();
        setShowBetDialog(false);
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
    setShowDepositDialog(false);
  };

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
    toast({
      title: "Sport selected",
      description: `Showing ${sport} matches`
    });
  };

  const handleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      toast({
        title: "Search activated",
        description: "Start typing to search matches"
      });
    }
  };

  const handleNotifications = () => {
    toast({
      title: "Notifications",
      description: `You have ${notifications} new notifications`
    });
    setNotifications(0);
  };

  const getBetStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-500';
      case 'lost': return 'bg-red-500';
      case 'void': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const filteredMatches = matches.filter(match => 
    match.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Menu */}
            <div className="flex items-center gap-6">
              <Menu className="h-6 w-6 cursor-pointer hover:text-yellow-400 transition-colors" />
              <div className="text-2xl font-bold text-yellow-400 hover:scale-105 transition-transform cursor-pointer">
                BetoWise
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <span className="text-yellow-400 cursor-pointer hover:underline transition-all">Home</span>
              <div className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors">
                <span>Live</span>
                <Badge variant="destructive" className="text-xs animate-pulse">113</Badge>
              </div>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors">Jackpots</span>
              <div className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors">
                <span>Shikisha Bet</span>
                <Badge variant="destructive" className="text-xs">6</Badge>
              </div>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors">Aviator</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors">Ligi Bigi</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors">Casino</span>
              <div className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors">
                <span>Promotions</span>
                <Badge variant="destructive" className="text-xs animate-bounce">14</Badge>
              </div>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors">Virtuals</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors">Betika Fasta</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors">Crash Games</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors">Live Score</span>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                <Wallet className="h-4 w-4 text-green-400" />
                <span className="font-semibold">${profile?.balance.toFixed(2) || '0.00'}</span>
              </div>
              
              <Button 
                onClick={() => setShowDepositDialog(true)} 
                size="sm" 
                className="bg-green-500 hover:bg-green-600 text-black hover:scale-105 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Deposit
              </Button>
              
              <div className="relative">
                <Bell 
                  className="h-5 w-5 cursor-pointer hover:text-yellow-400 transition-colors" 
                  onClick={handleNotifications}
                />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {notifications}
                  </span>
                )}
              </div>
              
              <Search 
                className="h-5 w-5 cursor-pointer hover:text-yellow-400 transition-colors" 
                onClick={handleSearch}
              />
              
              <Button variant="ghost" onClick={signOut} size="sm" className="hover:bg-red-600 transition-colors">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-gray-800 border-b border-gray-700 p-4 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <input
              type="text"
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Sports */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Sports</h3>
              <div className="space-y-2">
                {sportsCategories.map((sport) => (
                  <div
                    key={sport.name}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all hover:scale-105 ${
                      sport.active || selectedSport === sport.name
                        ? 'bg-gray-700 text-yellow-400'
                        : 'hover:bg-gray-700'
                    }`}
                    onClick={() => handleSportSelect(sport.name)}
                  >
                    <span className="text-lg">{sport.icon}</span>
                    <span className="text-sm">{sport.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Market Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative z-10">
                <div className="text-2xl font-bold mb-2">MARKET Live</div>
                <div className="bg-yellow-400 text-black px-4 py-2 rounded font-bold text-lg inline-block hover:bg-yellow-300 transition-colors cursor-pointer">
                  THE STOCK MARKET
                </div>
              </div>
              <div className="absolute inset-0 opacity-20">
                <TrendingUp className="h-full w-full animate-pulse" />
              </div>
            </div>

            {/* Update Matches Button */}
            <div className="mb-6 flex gap-4">
              <Button 
                onClick={updateMatches} 
                disabled={updatingMatches}
                className="bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${updatingMatches ? 'animate-spin' : ''}`} />
                {updatingMatches ? 'Updating...' : 'Update Matches'}
              </Button>
              
              <Button variant="outline" className="hover:bg-gray-700 transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Matches */}
            <div className="space-y-4">
              {/* Match Header */}
              <div className="grid grid-cols-12 gap-4 text-gray-400 text-sm px-4">
                <div className="col-span-6">Teams</div>
                <div className="col-span-2 text-center">1</div>
                <div className="col-span-2 text-center">X</div>
                <div className="col-span-2 text-center">2</div>
              </div>

              {filteredMatches.map((match) => (
                <Card key={match.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all hover:shadow-lg animate-fade-in">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Teams and League Info */}
                      <div className="col-span-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs">🇧🇷</span>
                          <span className="text-sm text-gray-400">
                            Brazil • Brasileiro Serie A
                          </span>
                          <Star className="h-3 w-3 text-yellow-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">{match.title.split(' vs ')[0] || 'Team A'}</div>
                          <div className="font-medium">{match.title.split(' vs ')[1] || 'Team B'}</div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {new Date(match.start_time).toLocaleDateString()} {new Date(match.start_time).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {/* Odds */}
                      <div className="col-span-2">
                        <Button 
                          variant="outline" 
                          className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-105"
                          onClick={() => handleBetClick(match, match.title.split(' vs ')[0] || 'Team A', 1.37)}
                          disabled={!profile || profile.balance <= 0}
                        >
                          1.37
                        </Button>
                      </div>
                      <div className="col-span-2">
                        <Button 
                          variant="outline" 
                          className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-105"
                          onClick={() => handleBetClick(match, 'Draw', 4.70)}
                          disabled={!profile || profile.balance <= 0}
                        >
                          4.70
                        </Button>
                      </div>
                      <div className="col-span-2">
                        <Button 
                          variant="outline" 
                          className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-105"
                          onClick={() => handleBetClick(match, match.title.split(' vs ')[1] || 'Team B', 8.20)}
                          disabled={!profile || profile.balance <= 0}
                        >
                          8.20
                        </Button>
                      </div>
                    </div>
                    
                    {/* Additional Markets */}
                    <div className="mt-3 text-right">
                      <span className="text-green-400 text-sm cursor-pointer hover:underline flex items-center justify-end gap-1 hover:text-green-300 transition-colors">
                        <Plus className="h-3 w-3" />
                        84 Markets
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredMatches.length === 0 && matches.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400 mb-4">No matches found for "{searchQuery}"</p>
                    <Button onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}

              {matches.length === 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400 mb-4">No matches available</p>
                    <Button onClick={updateMatches} disabled={updatingMatches} className="hover:scale-105 transition-transform">
                      <RefreshCw className={`h-4 w-4 mr-2 ${updatingMatches ? 'animate-spin' : ''}`} />
                      Load Matches
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Sidebar - User Bets & Betslip */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400 animate-pulse" />
                  <h3 className="font-semibold mb-2">Normal ({userBets.length})</h3>
                  <div className="flex gap-2 text-sm">
                    <button className="px-3 py-1 bg-green-500 text-black rounded hover:bg-green-600 transition-colors">
                      Shikisha Bet ({userBets.length})
                    </button>
                    <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                      Virtuals (0)
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Your Recent Bets</h4>
                  {userBets.slice(0, 5).map((bet) => (
                    <Card key={bet.id} className="bg-gray-700 hover:bg-gray-600 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={getBetStatusColor(bet.status)}>
                            {bet.status}
                          </Badge>
                          <span className="text-sm font-medium">${bet.amount}</span>
                        </div>
                        <p className="text-xs text-gray-300">Team: {bet.team_choice}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(bet.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {userBets.length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                      <p className="mb-2">No bets placed yet</p>
                      <p className="text-xs">Place your first bet above!</p>
                      <Button 
                        onClick={() => setShowDepositDialog(true)}
                        size="sm"
                        className="mt-2 bg-yellow-400 text-black hover:bg-yellow-500 transition-colors"
                      >
                        Add Funds
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <BetDialog
        open={showBetDialog}
        onClose={() => setShowBetDialog(false)}
        onConfirm={handlePlaceBet}
        match={selectedMatch}
        market={{ id: 'default', name: 'Winner', market_type: '1x2' }}
        odds={selectedOdds > 0 ? { id: 'default', outcome: selectedTeam, odds: selectedOdds } : null}
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

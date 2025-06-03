import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRealTimeMatches } from '@/hooks/useRealTimeMatches';
import { SportsMenu } from './SportsMenu';
import { BetDialog } from './BetDialog';
import { DepositDialog } from './DepositDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
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
  Star,
  Home,
  Target,
  Gift
} from 'lucide-react';

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
  { name: 'Soccer', icon: '⚽', endpoint: 'soccer', liveCount: 0, upcomingCount: 0 },
  { name: 'Boxing', icon: '🥊', endpoint: 'boxing', liveCount: 0, upcomingCount: 0 },
  { name: 'Rugby', icon: '🏉', endpoint: 'rugby', liveCount: 0, upcomingCount: 0 },
  { name: 'Tennis', icon: '🎾', endpoint: 'tennis', liveCount: 0, upcomingCount: 0 },
  { name: 'Basketball', icon: '🏀', endpoint: 'basketball', liveCount: 0, upcomingCount: 0 },
  { name: 'Baseball', icon: '⚾', endpoint: 'baseball', liveCount: 0, upcomingCount: 0 },
  { name: 'Cricket', icon: '🏏', endpoint: 'cricket', liveCount: 0, upcomingCount: 0 },
  { name: 'Hockey', icon: '🏒', endpoint: 'hockey', liveCount: 0, upcomingCount: 0 }
];

export function BettingDashboard() {
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedOdds, setSelectedOdds] = useState<number>(0);
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [activeTab, setActiveTab] = useState('Live');

  const { signOut } = useAuth();
  const { profile, updateBalance } = useUserProfile();
  const { toast } = useToast();
  
  const { 
    matches,
    liveMatches, 
    upcomingMatches,
    finishedMatches,
    loading, 
    selectedSport, 
    changeSport,
    refreshMatches
  } = useRealTimeMatches();

  // Calculate live count from liveMatches array
  const liveCount = liveMatches.length;

  useEffect(() => {
    fetchUserBets();
    
    // Set up real-time subscriptions for bets
    const betsSubscription = supabase
      .channel('bets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bets' }, fetchUserBets)
      .subscribe();

    return () => {
      supabase.removeChannel(betsSubscription);
    };
  }, []);

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

  const handleBetClick = (match: any, team: string, odds: string) => {
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
    setSelectedOdds(parseFloat(odds));
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
          description: `You bet $${amount} on ${selectedTeam}`
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
    changeSport(sport);
    toast({
      title: "Sport changed",
      description: `Now showing ${sport} matches`
    });
  };

  const handleJackpot = () => {
    toast({
      title: "Jackpot Feature",
      description: "Jackpot games are coming soon! Stay tuned for massive prizes.",
      duration: 4000
    });
  };

  const handleShikishaBet = () => {
    if (userBets.length === 0) {
      toast({
        title: "No bets found",
        description: "Place some bets to see them in Shikisha Bet!",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Your Shikisha Bets",
        description: `You have ${userBets.length} active bets`,
      });
    }
  };

  const handleAviator = () => {
    toast({
      title: "Aviator Game",
      description: "Aviator crash game is coming soon! Get ready to fly high!",
      duration: 4000
    });
  };

  const handleLigiBigi = () => {
    toast({
      title: "Ligi Bigi",
      description: "Ligi Bigi predictions are coming soon!",
      duration: 4000
    });
  };

  const handleCasino = () => {
    toast({
      title: "Casino Games",
      description: "Casino section is coming soon! Slots, Poker, and more!",
      duration: 4000
    });
  };

  const handlePromotions = () => {
    toast({
      title: "Promotions & Bonuses",
      description: "Check out our amazing promotions and bonuses!",
      duration: 4000
    });
  };

  const handleVirtuals = () => {
    toast({
      title: "Virtual Sports",
      description: "Virtual sports are coming soon!",
      duration: 4000
    });
  };

  const handleBetikaFasta = () => {
    toast({
      title: "BetoWise Fasta",
      description: "Quick betting feature coming soon!",
      duration: 4000
    });
  };

  const handleCrashGames = () => {
    toast({
      title: "Crash Games",
      description: "Exciting crash games are coming soon!",
      duration: 4000
    });
  };

  const handleLiveScore = () => {
    toast({
      title: "Live Scores",
      description: "Real-time scores are displayed in the matches above!",
      duration: 4000
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Live') {
      refreshMatches();
      toast({
        title: "Live matches",
        description: "Refreshing live matches from SportDB"
      });
    } else if (tab === 'Upcoming') {
      toast({
        title: "Upcoming matches",
        description: "Showing upcoming matches"
      });
    } else if (tab === 'My Bets') {
      fetchUserBets();
      toast({
        title: "Your bets",
        description: `You have ${userBets.length} bets`
      });
    }
  };

  const getBetStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-500';
      case 'lost': return 'bg-red-500';
      case 'void': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getDisplayMatches = () => {
    switch (activeTab) {
      case 'Live':
        return liveMatches;
      case 'Upcoming':
        return upcomingMatches;
      case 'Finished':
        return finishedMatches;
      case 'My Bets':
        return [];
      default:
        return matches;
    }
  };

  const filteredMatches = getDisplayMatches().filter(match => 
    `${match.home_team} ${match.away_team}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update sports categories with live counts
  const updatedSportsCategories = sportsCategories.map(sport => ({
    ...sport,
    liveCount: sport.name === selectedSport ? liveCount : Math.floor(Math.random() * 20) + 5,
    upcomingCount: Math.floor(Math.random() * 30) + 10
  }));

  if (loading && matches.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading live matches...</p>
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
            {/* Logo and Sports Menu */}
            <div className="flex items-center gap-6">
              <SportsMenu 
                sports={updatedSportsCategories}
                selectedSport={selectedSport}
                onSportSelect={handleSportSelect}
                loading={loading}
              />
              <div className="text-2xl font-bold text-yellow-400 hover:scale-105 transition-transform cursor-pointer">
                BetoWise
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <button className="flex items-center gap-1 text-yellow-400 cursor-pointer hover:underline transition-all hover:scale-105">
                <Home className="h-4 w-4" />
                Home
              </button>
              <button 
                className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={() => handleTabChange('Live')}
              >
                <span>Live</span>
                <Badge variant="destructive" className="text-xs animate-pulse">{liveCount}</Badge>
              </button>
              <button 
                className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleJackpot}
              >
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  Jackpots
                </div>
              </button>
              <button 
                className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleShikishaBet}
              >
                <span>Shikisha Bet</span>
                <Badge variant="destructive" className="text-xs">{userBets.length}</Badge>
              </button>
              <button 
                className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleAviator}
              >
                Aviator
              </button>
              <button 
                className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleLigiBigi}
              >
                Ligi Bigi
              </button>
              <button 
                className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleCasino}
              >
                Casino
              </button>
              <button 
                className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handlePromotions}
              >
                <Gift className="h-4 w-4" />
                <span>Promotions</span>
                <Badge variant="destructive" className="text-xs animate-bounce">14</Badge>
              </button>
              <button 
                className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleVirtuals}
              >
                Virtuals
              </button>
              <button 
                className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleBetikaFasta}
              >
                BetoWise Fasta
              </button>
              <button 
                className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleCrashGames}
              >
                Crash Games
              </button>
              <button 
                className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleLiveScore}
              >
                Live Score
              </button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors hover:scale-105">
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
                  className="h-5 w-5 cursor-pointer hover:text-yellow-400 transition-colors hover:scale-110" 
                  onClick={handleNotifications}
                />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {notifications}
                  </span>
                )}
              </div>
              
              <Search 
                className="h-5 w-5 cursor-pointer hover:text-yellow-400 transition-colors hover:scale-110" 
                onClick={handleSearch}
              />
              
              <Button variant="ghost" onClick={signOut} size="sm" className="hover:bg-red-600 transition-colors hover:scale-105">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-gray-800 border-b border-gray-700 p-4 animate-slide-down">
          <div className="max-w-7xl mx-auto">
            <input
              type="text"
              placeholder="Search live matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              autoFocus
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Sports */}
          <div className="lg:col-span-1">
            <SportsMenu 
              sports={sportsCategories}
              selectedSport={selectedSport}
              onSportSelect={handleSportSelect}
              loading={loading}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Update Matches Button */}
            <div className="mb-6 flex gap-4 animate-fade-in">
              <Button 
                onClick={refreshMatches} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Updating...' : 'Update Matches'}
              </Button>
              
              <div className="flex bg-gray-800 rounded-lg p-1">
                {['Live', 'Upcoming', 'Finished', 'My Bets'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded font-semibold transition-all hover:scale-105 ${
                      activeTab === tab 
                        ? 'bg-yellow-400 text-black shadow-lg' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {tab}
                    {tab === 'Live' && (
                      <Badge className="ml-2 bg-red-500 text-white text-xs animate-pulse">
                        {liveMatches.length}
                      </Badge>
                    )}
                    {tab === 'My Bets' && (
                      <Badge className="ml-2 bg-blue-500 text-white text-xs">
                        {userBets.length}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Matches Display */}
            {activeTab === 'My Bets' ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Your Bets</h3>
                {userBets.map((bet) => (
                  <Card key={bet.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{bet.team_choice}</p>
                          <p className="text-sm text-gray-400">Amount: ${bet.amount}</p>
                        </div>
                        <Badge className={`${
                          bet.status === 'won' ? 'bg-green-500' :
                          bet.status === 'lost' ? 'bg-red-500' :
                          bet.status === 'void' ? 'bg-gray-500' : 'bg-yellow-500'
                        }`}>
                          {bet.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {userBets.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No bets placed yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Match Header */}
                <div className="grid grid-cols-12 gap-4 text-gray-400 text-sm px-4">
                  <div className="col-span-6">Teams • {selectedSport} • {activeTab}: {filteredMatches.length}</div>
                  <div className="col-span-2 text-center">1</div>
                  <div className="col-span-2 text-center">X</div>
                  <div className="col-span-2 text-center">2</div>
                </div>

                {filteredMatches.map((match, index) => (
                  <Card key={match.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Teams and League Info */}
                        <div className="col-span-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-400">
                              {match.country} • {match.league}
                            </span>
                            {match.status === 'live' && (
                              <Badge className="bg-red-500 text-white text-xs animate-pulse">
                                LIVE
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center justify-between">
                              <span>{match.home_team}</span>
                              {match.home_score !== null && (
                                <span className="text-yellow-400 font-bold">{match.home_score}</span>
                              )}
                            </div>
                            <div className="font-medium flex items-center justify-between">
                              <span>{match.away_team}</span>
                              {match.away_score !== null && (
                                <span className="text-yellow-400 font-bold">{match.away_score}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {new Date(match.start_time).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Odds */}
                        <div className="col-span-2">
                          <Button 
                            variant="outline" 
                            className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all"
                            onClick={() => handleBetClick(match, match.home_team, match.home_odds)}
                            disabled={!profile || profile.balance <= 0}
                          >
                            {match.home_odds}
                          </Button>
                        </div>
                        <div className="col-span-2">
                          {match.draw_odds && (
                            <Button 
                              variant="outline" 
                              className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all"
                              onClick={() => handleBetClick(match, 'Draw', match.draw_odds)}
                              disabled={!profile || profile.balance <= 0}
                            >
                              {match.draw_odds}
                            </Button>
                          )}
                        </div>
                        <div className="col-span-2">
                          <Button 
                            variant="outline" 
                            className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all"
                            onClick={() => handleBetClick(match, match.away_team, match.away_odds)}
                            disabled={!profile || profile.balance <= 0}
                          >
                            {match.away_odds}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredMatches.length === 0 && !loading && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-400 mb-4">
                        {searchQuery ? `No matches found for "${searchQuery}"` : `No ${activeTab.toLowerCase()} matches available`}
                      </p>
                      <div className="flex gap-4 justify-center">
                        {searchQuery && (
                          <Button onClick={() => setSearchQuery('')} variant="outline">
                            Clear Search
                          </Button>
                        )}
                        <Button onClick={refreshMatches}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Matches
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - User Bets & Betslip */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 mb-6 animate-fade-in">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400 animate-bounce" />
                  <h3 className="font-semibold mb-2">Normal ({userBets.length})</h3>
                  <div className="flex gap-2 text-sm">
                    <button 
                      onClick={handleShikishaBet}
                      className="px-3 py-1 bg-green-500 text-black rounded hover:bg-green-600 transition-all hover:scale-105"
                    >
                      Shikisha Bet ({userBets.length})
                    </button>
                    <button 
                      onClick={handleVirtuals}
                      className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-all hover:scale-105"
                    >
                      Virtuals (0)
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Your Recent Bets</h4>
                  {userBets.slice(0, 5).map((bet) => (
                    <Card key={bet.id} className="bg-gray-700 hover:bg-gray-600 transition-all hover:scale-105">
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
                        className="mt-2 bg-yellow-400 text-black hover:bg-yellow-500 transition-all hover:scale-105"
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

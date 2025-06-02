
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthForm } from './AuthForm';
import { useToast } from '@/hooks/use-toast';
import { useSportsData } from '@/hooks/useSportsData';
import { 
  Menu, 
  Search, 
  Bell, 
  TrendingUp,
  Plus,
  Trophy,
  Clock,
  Star,
  Filter,
  RefreshCw
} from 'lucide-react';

const sportsCategories = [
  { name: 'Soccer', icon: '⚽' },
  { name: 'Boxing', icon: '🥊' },
  { name: 'Rugby', icon: '🏉' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Baseball', icon: '⚾' },
  { name: 'Cricket', icon: '🏏' },
  { name: 'Hockey', icon: '🏒' }
];

export function PublicLandingPage() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Live');
  
  const { 
    liveMatches, 
    loading, 
    selectedSport, 
    liveCount, 
    fetchLiveMatches, 
    changeSport 
  } = useSportsData();

  const { toast } = useToast();

  const handleAuthClick = () => {
    setShowAuthForm(true);
    toast({
      title: "Welcome!",
      description: "Please sign up or log in to start betting"
    });
  };

  const handleSportSelect = (sport: string) => {
    changeSport(sport);
    toast({
      title: "Sport changed",
      description: `Now showing ${sport} matches`
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

  const handleLiveClick = () => {
    setActiveTab('Live');
    toast({
      title: "Live matches",
      description: `Viewing ${liveCount} live matches`
    });
  };

  const handleJackpotsClick = () => {
    toast({
      title: "Jackpots",
      description: "Sign up to view available jackpots worth over $1M!"
    });
    setShowAuthForm(true);
  };

  const handleShikishaClick = () => {
    toast({
      title: "Shikisha Bet",
      description: "Multi-bet feature available after registration"
    });
    setShowAuthForm(true);
  };

  const handlePromotionsClick = () => {
    toast({
      title: "Promotions",
      description: "14 active promotions available for new users!"
    });
    setShowAuthForm(true);
  };

  const handleOddsClick = (team: string, odds: number) => {
    toast({
      title: "Sign up required",
      description: `Sign up to bet on ${team} at ${odds} odds`
    });
    setShowAuthForm(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Live') {
      fetchLiveMatches();
    }
    toast({
      title: "Tab changed",
      description: `Viewing ${tab} matches`
    });
  };

  const filteredMatches = liveMatches.filter(match => 
    `${match.homeTeam} ${match.awayTeam}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showAuthForm) {
    return <AuthForm onBack={() => setShowAuthForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Menu */}
            <div className="flex items-center gap-6">
              <Menu className="h-6 w-6 cursor-pointer hover:text-yellow-400 transition-colors animate-pulse" />
              <div className="text-2xl font-bold text-yellow-400 hover:scale-105 transition-transform cursor-pointer">
                BetoWise!
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <span className="text-yellow-400 cursor-pointer hover:underline transition-all">Home</span>
              <div 
                className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleLiveClick}
              >
                <span>Live</span>
                <Badge variant="destructive" className="text-xs animate-pulse">{liveCount}</Badge>
              </div>
              <span 
                className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleJackpotsClick}
              >
                Jackpots
              </span>
              <div 
                className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleShikishaClick}
              >
                <span>Shikisha Bet</span>
                <Badge variant="destructive" className="text-xs">6</Badge>
              </div>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105" onClick={handleAuthClick}>Aviator</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105" onClick={handleAuthClick}>Ligi Bigi</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105" onClick={handleAuthClick}>Casino</span>
              <div 
                className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handlePromotionsClick}
              >
                <span>Promotions</span>
                <Badge variant="destructive" className="text-xs animate-bounce">14</Badge>
              </div>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105" onClick={handleAuthClick}>Virtuals</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105" onClick={handleAuthClick}>BetoWise Fasta</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105" onClick={handleAuthClick}>Crash Games</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105" onClick={handleAuthClick}>Live Score</span>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAuthClick}
                className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black transition-all hover:scale-105"
              >
                Login
              </Button>
              <Button 
                size="sm"
                onClick={handleAuthClick}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold hover:scale-105 transition-all"
              >
                Register
              </Button>
              <Bell 
                className="h-5 w-5 cursor-pointer hover:text-yellow-400 transition-colors animate-pulse" 
                onClick={() => toast({ title: "Notifications", description: "Sign up to receive live match notifications" })}
              />
              <Search 
                className="h-5 w-5 cursor-pointer hover:text-yellow-400 transition-colors hover:scale-110" 
                onClick={handleSearch}
              />
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
            <div className="bg-gray-800 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Sports</h3>
                <RefreshCw 
                  className={`h-4 w-4 cursor-pointer hover:text-yellow-400 transition-colors ${loading ? 'animate-spin' : 'hover:scale-110'}`}
                  onClick={() => fetchLiveMatches()}
                />
              </div>
              <div className="space-y-2">
                {sportsCategories.map((sport) => (
                  <div
                    key={sport.name}
                    className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-all hover:scale-105 transform ${
                      selectedSport === sport.name
                        ? 'bg-yellow-400 text-black shadow-lg'
                        : 'hover:bg-gray-700 hover:shadow-md'
                    }`}
                    onClick={() => handleSportSelect(sport.name)}
                  >
                    <span className="text-lg animate-bounce">{sport.icon}</span>
                    <span className="text-sm font-medium">{sport.name}</span>
                    {selectedSport === sport.name && (
                      <Badge className="ml-auto bg-black text-yellow-400 text-xs">
                        {filteredMatches.length}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Market Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 relative overflow-hidden hover:shadow-xl transition-all cursor-pointer hover:scale-105 animate-fade-in">
              <div className="relative z-10">
                <div className="text-2xl font-bold mb-2 animate-pulse">MARKET Live</div>
                <div className="bg-yellow-400 text-black px-4 py-2 rounded font-bold text-lg inline-block hover:bg-yellow-300 transition-colors">
                  THE STOCK MARKET
                </div>
              </div>
              <div className="absolute inset-0 opacity-20">
                <TrendingUp className="h-full w-full animate-pulse" />
              </div>
            </div>

            {/* Match Navigation */}
            <div className="flex items-center gap-4 mb-6 animate-fade-in">
              <div className="flex bg-gray-800 rounded-lg p-1">
                {['Live', 'Upcoming', 'Popular', 'Favorites'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 py-2 rounded font-semibold transition-all hover:scale-105 ${
                      activeTab === tab 
                        ? 'bg-yellow-400 text-black shadow-lg' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {tab}
                    {tab === 'Live' && (
                      <Badge className="ml-2 bg-red-500 text-white text-xs animate-pulse">
                        {liveCount}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="hover:bg-gray-700 transition-all hover:scale-105"
                onClick={() => fetchLiveMatches()}
                disabled={loading}
              >
                <Filter className="h-4 w-4 mr-2" />
                {loading ? 'Updating...' : 'Refresh'}
              </Button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8 animate-pulse">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading {selectedSport} matches...</p>
              </div>
            )}

            {/* Matches */}
            {!loading && (
              <div className="space-y-4">
                {/* Match Header */}
                <div className="grid grid-cols-12 gap-4 text-gray-400 text-sm px-4 animate-fade-in">
                  <div className="col-span-6">
                    Teams • {selectedSport} • Live: {filteredMatches.filter(m => m.status === 'live').length}
                  </div>
                  <div className="col-span-2 text-center">1</div>
                  <div className="col-span-2 text-center">X</div>
                  <div className="col-span-2 text-center">2</div>
                </div>

                {filteredMatches.map((match, index) => (
                  <Card 
                    key={match.id} 
                    className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all hover:shadow-xl hover:scale-105 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Teams and League Info */}
                        <div className="col-span-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs">🌍</span>
                            <span className="text-sm text-gray-400">
                              {match.country} • {match.league}
                            </span>
                            <Star className="h-3 w-3 text-yellow-400 animate-pulse" />
                            {match.status === 'live' && (
                              <Badge className="bg-red-500 text-white text-xs animate-pulse">
                                LIVE
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium hover:text-yellow-400 transition-colors">
                              {match.homeTeam}
                            </div>
                            <div className="font-medium hover:text-yellow-400 transition-colors">
                              {match.awayTeam}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">{match.time}</span>
                          </div>
                        </div>

                        {/* Odds */}
                        <div className="col-span-2">
                          <Button 
                            variant="outline" 
                            className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-110 shadow-lg"
                            onClick={() => handleOddsClick(match.homeTeam, match.homeOdds)}
                          >
                            {match.homeOdds}
                          </Button>
                        </div>
                        <div className="col-span-2">
                          <Button 
                            variant="outline" 
                            className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-110 shadow-lg"
                            onClick={() => handleOddsClick('Draw', match.drawOdds)}
                          >
                            {match.drawOdds}
                          </Button>
                        </div>
                        <div className="col-span-2">
                          <Button 
                            variant="outline" 
                            className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-110 shadow-lg"
                            onClick={() => handleOddsClick(match.awayTeam, match.awayOdds)}
                          >
                            {match.awayOdds}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Additional Markets */}
                      <div className="mt-3 text-right">
                        <span 
                          className="text-green-400 text-sm cursor-pointer hover:underline flex items-center justify-end gap-1 hover:text-green-300 transition-all hover:scale-105"
                          onClick={handleAuthClick}
                        >
                          <Plus className="h-3 w-3" />
                          {Math.floor(Math.random() * 50) + 30} Markets
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredMatches.length === 0 && !loading && (
                  <Card className="bg-gray-800 border-gray-700 animate-fade-in">
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-400 mb-4">
                        {searchQuery ? `No matches found for "${searchQuery}"` : `No ${selectedSport} matches available`}
                      </p>
                      <div className="flex gap-4 justify-center">
                        {searchQuery && (
                          <Button onClick={() => setSearchQuery('')} variant="outline">
                            Clear Search
                          </Button>
                        )}
                        <Button 
                          onClick={() => fetchLiveMatches()} 
                          className="hover:scale-105 transition-transform"
                        >
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

          {/* Right Sidebar - Betslip */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 animate-fade-in">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400 animate-bounce" />
                  <h3 className="font-semibold mb-2">Normal (0)</h3>
                  <div className="flex gap-2 text-sm">
                    <button 
                      className="px-3 py-1 bg-green-500 text-black rounded hover:bg-green-600 transition-all hover:scale-105"
                      onClick={handleShikishaClick}
                    >
                      Shikisha Bet (0)
                    </button>
                    <button 
                      className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-all hover:scale-105"
                      onClick={handleAuthClick}
                    >
                      Virtuals (0)
                    </button>
                  </div>
                </div>
                
                <div className="text-center py-8 text-gray-400">
                  <p className="mb-4">Do you have a shared betslip code? Enter it here.</p>
                  <div className="mb-4">
                    <input 
                      type="text" 
                      placeholder="e.g. VBmSU"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all hover:border-yellow-400"
                    />
                  </div>
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600 text-black mb-4 transition-all hover:scale-105"
                    onClick={handleAuthClick}
                  >
                    Load Betslip
                  </Button>
                  
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <p className="text-sm mb-4">Ready to start betting on live matches?</p>
                    <Button 
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition-all hover:scale-105 animate-pulse"
                      onClick={handleAuthClick}
                    >
                      Sign Up Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

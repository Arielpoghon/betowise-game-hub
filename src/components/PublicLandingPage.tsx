
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthForm } from './AuthForm';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeMatches } from '@/hooks/useRealTimeMatches';
import { SportsHamburgerMenu } from './SportsHamburgerMenu';
import { 
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

export function PublicLandingPage() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Live');
  
  const { 
    matches,
    liveMatches, 
    upcomingMatches,
    loading, 
    selectedSport, 
    changeSport,
    refreshMatches
  } = useRealTimeMatches();

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
      description: `Now showing ${sport === 'All' ? 'all' : sport} matches`
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

  const handleOddsClick = (team: string, odds: string) => {
    toast({
      title: "Sign up required",
      description: `Sign up to bet on ${team} at ${odds} odds`
    });
    setShowAuthForm(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    toast({
      title: "Tab changed",
      description: `Viewing ${tab} matches`
    });
  };

  const getDisplayMatches = () => {
    switch (activeTab) {
      case 'Live':
        return liveMatches;
      case 'Upcoming':
        return upcomingMatches;
      default:
        return matches;
    }
  };

  const filteredMatches = getDisplayMatches().filter(match => 
    `${match.home_team} ${match.away_team}`.toLowerCase().includes(searchQuery.toLowerCase())
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
              <SportsHamburgerMenu 
                onSportSelect={handleSportSelect}
                selectedSport={selectedSport}
              />
              <div className="text-2xl font-bold text-yellow-400 hover:scale-105 transition-transform cursor-pointer">
                BetoWise!
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <span className="text-yellow-400 cursor-pointer hover:underline transition-all">Home</span>
              <div 
                className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={() => handleTabChange('Live')}
              >
                <span>Live</span>
                <Badge variant="destructive" className="text-xs animate-pulse">{liveMatches.length}</Badge>
              </div>
              <span 
                className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105"
                onClick={handleAuthClick}
              >
                Jackpots
              </span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105" onClick={handleAuthClick}>Aviator</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105" onClick={handleAuthClick}>Casino</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors hover:scale-105" onClick={handleAuthClick}>Virtuals</span>
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
          {/* Left Sidebar - Quick Stats */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Current Sport</h3>
                <RefreshCw 
                  className={`h-4 w-4 cursor-pointer hover:text-yellow-400 transition-colors ${loading ? 'animate-spin' : 'hover:scale-110'}`}
                  onClick={refreshMatches}
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  {selectedSport}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Live:</span>
                    <Badge className="bg-red-500 text-white animate-pulse">
                      {liveMatches.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Upcoming:</span>
                    <Badge className="bg-blue-500 text-white">
                      {upcomingMatches.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <Badge className="bg-green-500 text-white">
                      {matches.length}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Match Navigation */}
            <div className="flex items-center gap-4 mb-6 animate-fade-in">
              <div className="flex bg-gray-800 rounded-lg p-1">
                {['Live', 'Upcoming', 'All'].map((tab) => (
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
                        {liveMatches.length}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="hover:bg-gray-700 transition-all hover:scale-105"
                onClick={refreshMatches}
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
                    Teams • {selectedSport} • {activeTab}: {filteredMatches.length}
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
                            <div className="font-medium hover:text-yellow-400 transition-colors flex items-center justify-between">
                              <span>{match.home_team}</span>
                              {match.home_score !== null && (
                                <span className="text-yellow-400 font-bold">{match.home_score}</span>
                              )}
                            </div>
                            <div className="font-medium hover:text-yellow-400 transition-colors flex items-center justify-between">
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
                            className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-110 shadow-lg"
                            onClick={() => handleOddsClick(match.home_team, match.home_odds)}
                          >
                            {match.home_odds}
                          </Button>
                        </div>
                        <div className="col-span-2">
                          {match.draw_odds && (
                            <Button 
                              variant="outline" 
                              className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-110 shadow-lg"
                              onClick={() => handleOddsClick('Draw', match.draw_odds)}
                            >
                              {match.draw_odds}
                            </Button>
                          )}
                        </div>
                        <div className="col-span-2">
                          <Button 
                            variant="outline" 
                            className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-110 shadow-lg"
                            onClick={() => handleOddsClick(match.away_team, match.away_odds)}
                          >
                            {match.away_odds}
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
                        {searchQuery ? `No matches found for "${searchQuery}"` : `No ${activeTab.toLowerCase()} ${selectedSport} matches available`}
                      </p>
                      <div className="flex gap-4 justify-center">
                        {searchQuery && (
                          <Button onClick={() => setSearchQuery('')} variant="outline">
                            Clear Search
                          </Button>
                        )}
                        <Button 
                          onClick={refreshMatches} 
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
                  <h3 className="font-semibold mb-2">Betslip (0)</h3>
                </div>
                
                <div className="text-center py-8 text-gray-400">
                  <p className="mb-4">Ready to start betting on live matches?</p>
                  <Button 
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition-all hover:scale-105 animate-pulse"
                    onClick={handleAuthClick}
                  >
                    Sign Up Now
                  </Button>
                  
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Live Matches:</span>
                        <Badge className="bg-red-500 text-white animate-pulse">
                          {liveMatches.length}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Upcoming:</span>
                        <Badge className="bg-blue-500 text-white">
                          {upcomingMatches.length}
                        </Badge>
                      </div>
                    </div>
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

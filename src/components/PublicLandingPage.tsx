
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthForm } from './AuthForm';
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

  const handleAuthClick = () => {
    setShowAuthForm(true);
  };

  const handleSportSelect = (sport: string) => {
    changeSport(sport);
  };

  const handleSearch = () => {
    setShowSearch(!showSearch);
  };

  const handleOddsClick = (team: string, odds: string) => {
    setShowAuthForm(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
      {/* Header - Responsive */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo and Menu - Responsive */}
            <div className="flex items-center gap-2 sm:gap-6 min-w-0">
              <SportsHamburgerMenu 
                onSportSelect={handleSportSelect}
                selectedSport={selectedSport}
              />
              <div className="text-lg sm:text-2xl font-bold text-yellow-400 hover:scale-105 transition-transform cursor-pointer truncate">
                BetoWise!
              </div>
            </div>

            {/* Main Navigation - Hidden on mobile, shown on md+ */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm">
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

            {/* Auth Buttons - Responsive */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAuthClick}
                className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black transition-all hover:scale-105 text-xs sm:text-sm px-2 sm:px-4"
              >
                Login
              </Button>
              <Button 
                size="sm"
                onClick={handleAuthClick}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold hover:scale-105 transition-all text-xs sm:text-sm px-2 sm:px-4"
              >
                Register
              </Button>
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-yellow-400 transition-colors animate-pulse" />
              <Search 
                className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-yellow-400 transition-colors hover:scale-110" 
                onClick={handleSearch}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Shown only on small screens */}
      <div className="md:hidden bg-gray-800 border-b border-gray-700 px-2 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-yellow-400 whitespace-nowrap"
          >
            Home
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="whitespace-nowrap"
            onClick={() => handleTabChange('Live')}
          >
            Live <Badge variant="destructive" className="ml-1 text-xs">{liveMatches.length}</Badge>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="whitespace-nowrap"
            onClick={handleAuthClick}
          >
            Jackpots
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="whitespace-nowrap"
            onClick={handleAuthClick}
          >
            Aviator
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="whitespace-nowrap"
            onClick={handleAuthClick}
          >
            Casino
          </Button>
        </div>
      </div>

      {/* Search Bar - Responsive */}
      {showSearch && (
        <div className="bg-gray-800 border-b border-gray-700 p-2 sm:p-4 animate-slide-down">
          <div className="max-w-7xl mx-auto">
            <input
              type="text"
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-sm sm:text-base"
              autoFocus
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Left Sidebar - Hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block lg:col-span-1">
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

          {/* Main Content - Responsive */}
          <div className="col-span-1 lg:col-span-2">
            {/* Match Navigation - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6 animate-fade-in">
              <div className="flex bg-gray-800 rounded-lg p-1 overflow-x-auto">
                {['Live', 'Upcoming', 'All'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-3 sm:px-4 py-2 rounded font-semibold transition-all hover:scale-105 whitespace-nowrap text-sm sm:text-base ${
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
                size="sm"
                className="hover:bg-gray-700 transition-all hover:scale-105 text-xs sm:text-sm"
                onClick={refreshMatches}
                disabled={loading}
              >
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>

            {/* Loading State - Responsive */}
            {loading && (
              <div className="text-center py-6 sm:py-8 animate-pulse">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm sm:text-base">Loading {selectedSport} matches...</p>
              </div>
            )}

            {/* Matches - Responsive */}
            {!loading && (
              <div className="space-y-3 sm:space-y-4">
                {/* Match Header - Hidden on mobile */}
                <div className="hidden sm:grid grid-cols-12 gap-4 text-gray-400 text-sm px-4 animate-fade-in">
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
                    className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all hover:shadow-xl hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-3 sm:p-4">
                      {/* Desktop Layout */}
                      <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
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

                      {/* Mobile Layout */}
                      <div className="sm:hidden">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs">🌍</span>
                          <span className="text-xs text-gray-400 truncate">
                            {match.country} • {match.league}
                          </span>
                          {match.status === 'live' && (
                            <Badge className="bg-red-500 text-white text-xs animate-pulse">
                              LIVE
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 mb-3">
                          <div className="font-medium text-sm flex items-center justify-between">
                            <span className="truncate mr-2">{match.home_team}</span>
                            {match.home_score !== null && (
                              <span className="text-yellow-400 font-bold">{match.home_score}</span>
                            )}
                          </div>
                          <div className="font-medium text-sm flex items-center justify-between">
                            <span className="truncate mr-2">{match.away_team}</span>
                            {match.away_score !== null && (
                              <span className="text-yellow-400 font-bold">{match.away_score}</span>
                            )}
                          </div>
                        </div>

                        {/* Mobile Odds Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all text-xs"
                            onClick={() => handleOddsClick(match.home_team, match.home_odds)}
                          >
                            1: {match.home_odds}
                          </Button>
                          {match.draw_odds && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all text-xs"
                              onClick={() => handleOddsClick('Draw', match.draw_odds)}
                            >
                              X: {match.draw_odds}
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all text-xs"
                            onClick={() => handleOddsClick(match.away_team, match.away_odds)}
                          >
                            2: {match.away_odds}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(match.start_time).toLocaleString()}</span>
                          </div>
                          <span 
                            className="text-green-400 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={handleAuthClick}
                          >
                            <Plus className="h-3 w-3" />
                            +{Math.floor(Math.random() * 50) + 30}
                          </span>
                        </div>
                      </div>
                      
                      {/* Additional Markets - Desktop only */}
                      <div className="hidden sm:block mt-3 text-right">
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
                    <CardContent className="p-6 sm:p-8 text-center">
                      <p className="text-gray-400 mb-4 text-sm sm:text-base">
                        {searchQuery ? `No matches found for "${searchQuery}"` : `No ${activeTab.toLowerCase()} ${selectedSport} matches available`}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                        {searchQuery && (
                          <Button onClick={() => setSearchQuery('')} variant="outline" size="sm">
                            Clear Search
                          </Button>
                        )}
                        <Button 
                          onClick={refreshMatches} 
                          className="hover:scale-105 transition-transform"
                          size="sm"
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

          {/* Right Sidebar - Responsive */}
          <div className="col-span-1 lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 animate-fade-in">
              <CardContent className="p-3 sm:p-4">
                <div className="text-center mb-4">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-yellow-400 animate-bounce" />
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Betslip (0)</h3>
                </div>
                
                <div className="text-center py-4 sm:py-8 text-gray-400">
                  <p className="mb-4 text-xs sm:text-sm">Ready to start betting on matches?</p>
                  <Button 
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition-all hover:scale-105 animate-pulse text-xs sm:text-sm"
                    onClick={handleAuthClick}
                    size="sm"
                  >
                    Sign Up Now
                  </Button>
                  
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-700">
                    <div className="space-y-2 text-xs sm:text-sm">
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

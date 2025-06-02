
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthForm } from './AuthForm';
import { useToast } from '@/hooks/use-toast';
import { 
  Menu, 
  Search, 
  Bell, 
  TrendingUp,
  Plus,
  Trophy,
  Clock,
  Star,
  Filter
} from 'lucide-react';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  time: string;
  homeOdds: string;
  drawOdds: string;
  awayOdds: string;
  additionalMarkets: number;
}

const sampleMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Flamengo Rj',
    awayTeam: 'Fortaleza Ec',
    league: 'Brasileiro Serie A',
    country: 'Brazil',
    time: '02/06, 00:30',
    homeOdds: '1.37',
    drawOdds: '4.70',
    awayOdds: '8.20',
    additionalMarkets: 84
  },
  {
    id: '2',
    homeTeam: 'Sc Corinthians',
    awayTeam: 'Ec Vitoria',
    league: 'Brasileiro Serie A',
    country: 'Brazil',
    time: '02/06, 00:30',
    homeOdds: '1.67',
    drawOdds: '3.50',
    awayOdds: '5.60',
    additionalMarkets: 84
  },
  {
    id: '3',
    homeTeam: 'Cunupia Fc',
    awayTeam: 'Caledonia',
    league: 'TT Premier League',
    country: 'Trinidad and Tobago',
    time: '02/06, 00:00',
    homeOdds: '6.00',
    drawOdds: '6.40',
    awayOdds: '1.29',
    additionalMarkets: 6
  }
];

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

export function PublicLandingPage() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [selectedSport, setSelectedSport] = useState('Soccer');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Highlights');

  const { toast } = useToast();

  const handleAuthClick = () => {
    setShowAuthForm(true);
    toast({
      title: "Welcome!",
      description: "Please sign up or log in to start betting"
    });
  };

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
    toast({
      title: "Sport selected",
      description: `Viewing ${sport} matches`
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

  const filteredMatches = sampleMatches.filter(match => 
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
              <Menu className="h-6 w-6 cursor-pointer hover:text-yellow-400 transition-colors" />
              <div className="text-2xl font-bold text-yellow-400 hover:scale-105 transition-transform cursor-pointer">
                BetoWise!
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
              <span className="cursor-pointer hover:text-yellow-400 transition-colors">BetoWise Fasta</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors">Crash Games</span>
              <span className="cursor-pointer hover:text-yellow-400 transition-colors">Live Score</span>
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
                className="h-5 w-5 cursor-pointer hover:text-yellow-400 transition-colors" 
                onClick={() => toast({ title: "Notifications", description: "Sign up to receive notifications" })}
              />
              <Search 
                className="h-5 w-5 cursor-pointer hover:text-yellow-400 transition-colors" 
                onClick={handleSearch}
              />
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative z-10">
                <div className="text-2xl font-bold mb-2">MARKET Live</div>
                <div className="bg-yellow-400 text-black px-4 py-2 rounded font-bold text-lg inline-block hover:bg-yellow-300 transition-colors">
                  THE STOCK MARKET
                </div>
              </div>
              <div className="absolute inset-0 opacity-20">
                <TrendingUp className="h-full w-full animate-pulse" />
              </div>
            </div>

            {/* Match Navigation */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex bg-gray-800 rounded-lg p-1">
                {['Highlights', 'Upcoming', 'Countries', 'Quick-e'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 py-2 rounded font-semibold transition-all ${
                      activeTab === tab 
                        ? 'bg-yellow-400 text-black' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
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
                            {match.country} • {match.league}
                          </span>
                          <Star className="h-3 w-3 text-yellow-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">{match.homeTeam}</div>
                          <div className="font-medium">{match.awayTeam}</div>
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
                          className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-105"
                          onClick={() => handleOddsClick(match.homeTeam, match.homeOdds)}
                        >
                          {match.homeOdds}
                        </Button>
                      </div>
                      <div className="col-span-2">
                        <Button 
                          variant="outline" 
                          className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-105"
                          onClick={() => handleOddsClick('Draw', match.drawOdds)}
                        >
                          {match.drawOdds}
                        </Button>
                      </div>
                      <div className="col-span-2">
                        <Button 
                          variant="outline" 
                          className="w-full bg-gray-700 border-gray-600 hover:bg-green-600 hover:border-green-500 transition-all hover:scale-105"
                          onClick={() => handleOddsClick(match.awayTeam, match.awayOdds)}
                        >
                          {match.awayOdds}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Additional Markets */}
                    <div className="mt-3 text-right">
                      <span 
                        className="text-green-400 text-sm cursor-pointer hover:underline flex items-center justify-end gap-1 hover:text-green-300 transition-colors"
                        onClick={handleAuthClick}
                      >
                        <Plus className="h-3 w-3" />
                        {match.additionalMarkets} Markets
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredMatches.length === 0 && searchQuery && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400 mb-4">No matches found for "{searchQuery}"</p>
                    <Button onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Sidebar - Betslip */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400 animate-pulse" />
                  <h3 className="font-semibold mb-2">Normal (0)</h3>
                  <div className="flex gap-2 text-sm">
                    <button 
                      className="px-3 py-1 bg-green-500 text-black rounded hover:bg-green-600 transition-colors"
                      onClick={handleAuthClick}
                    >
                      Shikisha Bet (0)
                    </button>
                    <button 
                      className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
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
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                    />
                  </div>
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600 text-black mb-4 transition-all hover:scale-105"
                    onClick={handleAuthClick}
                  >
                    Load Betslip
                  </Button>
                  
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <p className="text-sm mb-4">Ready to start betting?</p>
                    <Button 
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition-all hover:scale-105"
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

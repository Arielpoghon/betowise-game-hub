
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthForm } from './AuthForm';
import { 
  Menu, 
  Search, 
  Bell, 
  TrendingUp,
  Plus,
  Trophy,
  Clock
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

  if (showAuthForm) {
    return <AuthForm onBack={() => setShowAuthForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Menu */}
            <div className="flex items-center gap-6">
              <Menu className="h-6 w-6 cursor-pointer" />
              <div className="text-2xl font-bold text-yellow-400">
                BetoWise!
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <span className="text-yellow-400 cursor-pointer">Home</span>
              <div className="flex items-center gap-1 cursor-pointer">
                <span>Live</span>
                <Badge variant="destructive" className="text-xs">113</Badge>
              </div>
              <span className="cursor-pointer">Jackpots</span>
              <div className="flex items-center gap-1 cursor-pointer">
                <span>Shikisha Bet</span>
                <Badge variant="destructive" className="text-xs">6</Badge>
              </div>
              <span className="cursor-pointer">Aviator</span>
              <span className="cursor-pointer">Ligi Bigi</span>
              <span className="cursor-pointer">Casino</span>
              <div className="flex items-center gap-1 cursor-pointer">
                <span>Promotions</span>
                <Badge variant="destructive" className="text-xs">14</Badge>
              </div>
              <span className="cursor-pointer">Virtuals</span>
              <span className="cursor-pointer">BetoWise Fasta</span>
              <span className="cursor-pointer">Crash Games</span>
              <span className="cursor-pointer">Live Score</span>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAuthForm(true)}
                className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black"
              >
                Login
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowAuthForm(true)}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold"
              >
                Register
              </Button>
              <Bell className="h-5 w-5 cursor-pointer" />
              <Search className="h-5 w-5 cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

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
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                      sport.active || selectedSport === sport.name
                        ? 'bg-gray-700 text-yellow-400'
                        : 'hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedSport(sport.name)}
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-2xl font-bold mb-2">MARKET Live</div>
                <div className="bg-yellow-400 text-black px-4 py-2 rounded font-bold text-lg inline-block">
                  THE STOCK MARKET
                </div>
              </div>
              <div className="absolute inset-0 opacity-20">
                <TrendingUp className="h-full w-full" />
              </div>
            </div>

            {/* Match Navigation */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold">
                  Highlights
                </button>
                <button className="px-4 py-2 text-gray-300">Upcoming</button>
                <button className="px-4 py-2 text-gray-300">Countries</button>
                <button className="px-4 py-2 text-gray-300">Quick-e</button>
              </div>
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

              {sampleMatches.map((match) => (
                <Card key={match.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Teams and League Info */}
                      <div className="col-span-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs">🇧🇷</span>
                          <span className="text-sm text-gray-400">
                            {match.country} • {match.league}
                          </span>
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
                          className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600"
                          onClick={() => setShowAuthForm(true)}
                        >
                          {match.homeOdds}
                        </Button>
                      </div>
                      <div className="col-span-2">
                        <Button 
                          variant="outline" 
                          className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600"
                          onClick={() => setShowAuthForm(true)}
                        >
                          {match.drawOdds}
                        </Button>
                      </div>
                      <div className="col-span-2">
                        <Button 
                          variant="outline" 
                          className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600"
                          onClick={() => setShowAuthForm(true)}
                        >
                          {match.awayOdds}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Additional Markets */}
                    <div className="mt-3 text-right">
                      <span 
                        className="text-green-400 text-sm cursor-pointer hover:underline flex items-center justify-end gap-1"
                        onClick={() => setShowAuthForm(true)}
                      >
                        <Plus className="h-3 w-3" />
                        {match.additionalMarkets} Markets
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Betslip */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                  <h3 className="font-semibold mb-2">Normal (0)</h3>
                  <div className="flex gap-2 text-sm">
                    <button className="px-3 py-1 bg-green-500 text-black rounded">
                      Shikisha Bet (0)
                    </button>
                    <button className="px-3 py-1 bg-gray-700 rounded">
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
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-center"
                    />
                  </div>
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600 text-black"
                    onClick={() => setShowAuthForm(true)}
                  >
                    Load Betslip
                  </Button>
                  
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <p className="text-sm mb-4">Ready to start betting?</p>
                    <Button 
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                      onClick={() => setShowAuthForm(true)}
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

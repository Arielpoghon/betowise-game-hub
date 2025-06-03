
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, Trophy, Target, Users, Timer, Star, RefreshCw } from 'lucide-react';
import { useRealTimeMatches } from '@/hooks/useRealTimeMatches';

const sportsCategories = [
  { name: 'All', icon: '🌍', color: 'bg-blue-500' },
  { name: 'Soccer', icon: '⚽', color: 'bg-green-500' },
  { name: 'Basketball', icon: '🏀', color: 'bg-orange-500' },
  { name: 'Tennis', icon: '🎾', color: 'bg-yellow-500' },
  { name: 'Boxing', icon: '🥊', color: 'bg-red-500' },
  { name: 'Rugby', icon: '🏉', color: 'bg-purple-500' },
  { name: 'Cricket', icon: '🏏', color: 'bg-indigo-500' },
  { name: 'Hockey', icon: '🏒', color: 'bg-cyan-500' }
];

interface SportsHamburgerMenuProps {
  onSportSelect: (sport: string) => void;
  selectedSport: string;
}

export function SportsHamburgerMenu({ onSportSelect, selectedSport }: SportsHamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { liveMatches, upcomingMatches, loading, refreshMatches } = useRealTimeMatches();

  const handleSportClick = (sport: string) => {
    onSportSelect(sport);
    setIsOpen(false);
  };

  const getSportMatchCount = (sport: string) => {
    if (sport === 'All') {
      return liveMatches.length + upcomingMatches.length;
    }
    const sportLive = liveMatches.filter(m => m.sport === sport).length;
    const sportUpcoming = upcomingMatches.filter(m => m.sport === sport).length;
    return sportLive + sportUpcoming;
  };

  const getSportLiveCount = (sport: string) => {
    if (sport === 'All') {
      return liveMatches.length;
    }
    return liveMatches.filter(m => m.sport === sport).length;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-gray-700 transition-all hover:scale-105">
          <Menu className="h-5 w-5 mr-2" />
          Sports Menu
          {liveMatches.length > 0 && (
            <Badge className="ml-2 bg-red-500 text-white text-xs animate-pulse">
              {liveMatches.length} LIVE
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-gray-800 border-gray-700 w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-yellow-400 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Sports Categories
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {/* Refresh Button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-400">Live Sports</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMatches}
              disabled={loading}
              className="hover:scale-105 transition-transform"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Popular Sports Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              All Sports
            </h3>
            <div className="space-y-2">
              {sportsCategories.map((sport) => {
                const matchCount = getSportMatchCount(sport.name);
                const liveCount = getSportLiveCount(sport.name);
                
                return (
                  <div
                    key={sport.name}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                      selectedSport === sport.name
                        ? 'bg-yellow-400 text-black shadow-lg'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                    onClick={() => handleSportClick(sport.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sport.color} text-white text-sm font-bold`}>
                        {sport.icon}
                      </div>
                      <div>
                        <div className="font-medium">{sport.name}</div>
                        <div className="text-xs opacity-75">
                          {matchCount} matches
                          {liveCount > 0 && ` • ${liveCount} live`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {liveCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs animate-pulse">
                          {liveCount}
                        </Badge>
                      )}
                      {selectedSport === sport.name && (
                        <Badge className="bg-black text-yellow-400 text-xs">
                          SELECTED
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Live Statistics
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Live Matches:</span>
                <Badge className="bg-red-500 text-white animate-pulse">
                  {liveMatches.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Upcoming Matches:</span>
                <Badge className="bg-blue-500 text-white">
                  {upcomingMatches.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Sports Available:</span>
                <Badge className="bg-green-500 text-white">
                  {sportsCategories.length - 1}
                </Badge>
              </div>
            </div>
          </div>

          {/* Featured Matches */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Live Now
            </h3>
            <div className="space-y-2">
              {liveMatches.slice(0, 3).map((match) => (
                <div
                  key={match.id}
                  className="bg-gray-700 rounded p-2 text-xs hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{match.home_team} vs {match.away_team}</div>
                    <Badge className="bg-red-500 text-white text-xs animate-pulse">
                      LIVE
                    </Badge>
                  </div>
                  <div className="text-gray-400 mt-1">
                    {match.league} • {match.sport}
                  </div>
                  {match.home_score !== null && match.away_score !== null && (
                    <div className="text-yellow-400 font-bold mt-1">
                      {match.home_score} - {match.away_score}
                    </div>
                  )}
                </div>
              ))}
              {liveMatches.length === 0 && (
                <div className="text-gray-400 text-center py-4">
                  No live matches at the moment
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

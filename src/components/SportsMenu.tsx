
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Trophy, Target, Users, Timer, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Sport {
  name: string;
  icon: string;
  endpoint: string;
  liveCount: number;
  upcomingCount: number;
}

interface SportsMenuProps {
  sports: Sport[];
  selectedSport: string;
  onSportSelect: (sport: string) => void;
  loading: boolean;
}

export function SportsMenu({ sports, selectedSport, onSportSelect, loading }: SportsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSportClick = (sport: string) => {
    onSportSelect(sport);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-gray-700 transition-all hover:scale-105">
          <Menu className="h-5 w-5 mr-2" />
          Sports Menu
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-gray-800 border-gray-700 w-80">
        <SheetHeader>
          <SheetTitle className="text-yellow-400 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Sports Categories
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-3">
          {/* Popular Sports Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Popular Sports
            </h3>
            <div className="space-y-2">
              {sports.slice(0, 4).map((sport) => (
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
                    <span className="text-xl animate-bounce">{sport.icon}</span>
                    <div>
                      <div className="font-medium">{sport.name}</div>
                      <div className="text-xs opacity-75">
                        {sport.liveCount} live • {sport.upcomingCount} upcoming
                      </div>
                    </div>
                  </div>
                  {sport.liveCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs animate-pulse">
                      LIVE
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* All Sports Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              All Sports
            </h3>
            <div className="space-y-2">
              {sports.map((sport) => (
                <div
                  key={sport.name}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all hover:scale-105 ${
                    selectedSport === sport.name
                      ? 'bg-yellow-400 text-black'
                      : 'hover:bg-gray-700'
                  }`}
                  onClick={() => handleSportClick(sport.name)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sport.icon}</span>
                    <span className="text-sm font-medium">{sport.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {sport.liveCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {sport.liveCount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Quick Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Live Games:</span>
                <Badge className="bg-red-500 text-white animate-pulse">
                  {sports.reduce((total, sport) => total + sport.liveCount, 0)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Total Upcoming:</span>
                <Badge className="bg-blue-500 text-white">
                  {sports.reduce((total, sport) => total + sport.upcomingCount, 0)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Sports Available:</span>
                <Badge className="bg-green-500 text-white">
                  {sports.length}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, ChevronDown, RefreshCw, Globe, Trophy } from 'lucide-react';

interface Sport {
  name: string;
  count: number;
  icon: string;
}

interface ComprehensiveSportsMenuProps {
  sports: Sport[];
  selectedSport: string;
  onSportSelect: (sport: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function ComprehensiveSportsMenu({ 
  sports, 
  selectedSport, 
  onSportSelect, 
  onRefresh,
  loading 
}: ComprehensiveSportsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalMatches = sports.reduce((sum, sport) => sum + sport.count, 0);

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-yellow-400" />
          <h3 className="font-semibold text-white">Sports</h3>
        </div>
        <Button
          onClick={onRefresh}
          disabled={loading}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Current Selection */}
      <div className="text-center">
        <div className="text-lg font-bold text-yellow-400 mb-1">
          {selectedSport}
        </div>
        <div className="text-sm text-gray-300">
          {selectedSport === 'All' ? `${totalMatches} total matches` : 
           `${sports.find(s => s.name === selectedSport)?.count || 0} matches`}
        </div>
      </div>

      <Separator className="bg-gray-600" />

      {/* Desktop Menu */}
      <div className="hidden md:block">
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {/* All Sports Option */}
            <Button
              onClick={() => onSportSelect('All')}
              variant={selectedSport === 'All' ? 'default' : 'ghost'}
              className={`w-full justify-between text-left ${
                selectedSport === 'All' 
                  ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span>All Sports</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {totalMatches}
              </Badge>
            </Button>

            {/* Individual Sports */}
            {sports.map((sport) => (
              <Button
                key={sport.name}
                onClick={() => onSportSelect(sport.name)}
                variant={selectedSport === sport.name ? 'default' : 'ghost'}
                className={`w-full justify-between text-left ${
                  selectedSport === sport.name 
                    ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
                    : 'text-white hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sport.icon}</span>
                  <span className="truncate">{sport.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {sport.count}
                </Badge>
              </Button>
            ))}

            {sports.length === 0 && !loading && (
              <div className="text-center py-4 text-gray-400">
                <p className="mb-2">No sports data available</p>
                <Button 
                  onClick={onRefresh}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Fetch Sports Data
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between text-white border-gray-600 hover:bg-gray-700"
            >
              <div className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                <span>Select Sport</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-800 border-gray-600">
            <DropdownMenuItem
              onClick={() => {
                onSportSelect('All');
                setIsOpen(false);
              }}
              className="text-white hover:bg-gray-700"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>All Sports</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {totalMatches}
                </Badge>
              </div>
            </DropdownMenuItem>
            
            {sports.map((sport) => (
              <DropdownMenuItem
                key={sport.name}
                onClick={() => {
                  onSportSelect(sport.name);
                  setIsOpen(false);
                }}
                className="text-white hover:bg-gray-700"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span>{sport.icon}</span>
                    <span>{sport.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {sport.count}
                  </Badge>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
          <p className="text-sm text-gray-400">Fetching comprehensive sports data...</p>
        </div>
      )}
    </div>
  );
}

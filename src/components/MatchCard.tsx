
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Use the Match type from useRealTimeMatches hook
interface Match {
  id: string;
  title: string;
  home_team: string;
  away_team: string;
  league: string;
  country: string;
  sport: string;
  status: string;
  start_time: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  home_odds: string;
  draw_odds: string | null;
  away_odds: string;
  external_id: string;
}

interface MatchCardProps {
  match: Match;
  onBet: (match: Match, team: string, odds: number) => void;
  disabled?: boolean;
}

export function MatchCard({ match, onBet, disabled = false }: MatchCardProps) {
  const isOpen = match.status === 'upcoming' || match.status === 'live';
  const homeOdds = typeof match.home_odds === 'string' ? parseFloat(match.home_odds) : match.home_odds;
  const awayOdds = typeof match.away_odds === 'string' ? parseFloat(match.away_odds) : match.away_odds;
  const drawOdds = match.draw_odds ? (typeof match.draw_odds === 'string' ? parseFloat(match.draw_odds) : match.draw_odds) : null;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{match.title}</CardTitle>
          <Badge className={isOpen ? 'bg-green-500' : 'bg-gray-500'}>
            {match.status}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>{new Date(match.start_time).toLocaleString()}</p>
          {match.league && <p className="font-medium">{match.league}</p>}
          {match.country && <p>{match.country}</p>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onBet(match, match.home_team || 'Home', homeOdds || 1.0)}
              disabled={disabled || !isOpen}
              variant={isOpen ? "default" : "secondary"}
              className="w-full"
              size="sm"
            >
              <div className="text-center">
                <div className="font-medium text-xs">{match.home_team || 'Home'}</div>
                <div className="text-xs opacity-75">{homeOdds?.toFixed(2)}x</div>
              </div>
            </Button>
            
            <Button
              onClick={() => onBet(match, match.away_team || 'Away', awayOdds || 1.0)}
              disabled={disabled || !isOpen}
              variant={isOpen ? "default" : "secondary"}
              className="w-full"
              size="sm"
            >
              <div className="text-center">
                <div className="font-medium text-xs">{match.away_team || 'Away'}</div>
                <div className="text-xs opacity-75">{awayOdds?.toFixed(2)}x</div>
              </div>
            </Button>
          </div>
          
          {drawOdds && (
            <Button
              onClick={() => onBet(match, 'Draw', drawOdds)}
              disabled={disabled || !isOpen}
              variant={isOpen ? "outline" : "secondary"}
              className="w-full"
              size="sm"
            >
              <div className="text-center">
                <div className="font-medium text-xs">Draw</div>
                <div className="text-xs opacity-75">{drawOdds.toFixed(2)}x</div>
              </div>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

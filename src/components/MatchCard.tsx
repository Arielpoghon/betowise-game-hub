
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Match {
  id: string;
  title: string;
  team_a: string;
  team_b: string;
  start_time: string;
  status: string;
  odds_team_a: number;
  odds_team_b: number;
  odds_draw: number;
}

interface MatchCardProps {
  match: Match;
  onBet: (match: Match, team: string, odds: number) => void;
  disabled?: boolean;
}

export function MatchCard({ match, onBet, disabled }: MatchCardProps) {
  const startTime = new Date(match.start_time);
  const isOpen = match.status === 'open';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{match.title}</CardTitle>
          <Badge variant={isOpen ? 'default' : 'secondary'}>
            {match.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(startTime, 'PPP p')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => onBet(match, 'team_a', match.odds_team_a)}
              disabled={!isOpen || disabled}
            >
              <span className="font-semibold">{match.team_a}</span>
              <span className="text-sm text-muted-foreground">
                {match.odds_team_a}x
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => onBet(match, 'draw', match.odds_draw)}
              disabled={!isOpen || disabled}
            >
              <span className="font-semibold">Draw</span>
              <span className="text-sm text-muted-foreground">
                {match.odds_draw}x
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => onBet(match, 'team_b', match.odds_team_b)}
              disabled={!isOpen || disabled}
            >
              <span className="font-semibold">{match.team_b}</span>
              <span className="text-sm text-muted-foreground">
                {match.odds_team_b}x
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

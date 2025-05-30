
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Match {
  id: string;
  title: string;
  start_time: string;
  status: string;
  created_at: string;
}

interface MatchCardProps {
  match: Match;
  onBet: (match: Match, team: string, odds: number) => void;
  disabled?: boolean;
}

export function MatchCard({ match, onBet, disabled = false }: MatchCardProps) {
  const isOpen = match.status === 'open';
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{match.title}</CardTitle>
          <Badge className={isOpen ? 'bg-green-500' : 'bg-gray-500'}>
            {match.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date(match.start_time).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onBet(match, 'Team A', 2.0)}
            disabled={disabled || !isOpen}
            variant={isOpen ? "default" : "secondary"}
            className="w-full"
          >
            <div className="text-center">
              <div className="font-medium">Team A</div>
              <div className="text-sm opacity-75">2.0x</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onBet(match, 'Team B', 2.0)}
            disabled={disabled || !isOpen}
            variant={isOpen ? "default" : "secondary"}
            className="w-full"
          >
            <div className="text-center">
              <div className="font-medium">Team B</div>
              <div className="text-sm opacity-75">2.0x</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchCountdown } from './MatchCountdown';
import { Star, Lock } from 'lucide-react';

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
  current_minute?: number;
  half_number?: number;
  is_halftime?: boolean;
  is_fixed_match?: boolean | null;
  fixed_home_score?: number | null;
  fixed_away_score?: number | null;
  fixed_outcome_set?: boolean | null;
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
  
  const isFixedMatch = match.is_fixed_match;
  const hasFixedOutcome = isFixedMatch && match.fixed_outcome_set;
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${isFixedMatch ? 'border-green-500 bg-green-50' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {match.title}
            {isFixedMatch && (
              <div className="flex items-center gap-1">
                <Lock className="h-4 w-4 text-green-600" />
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
            )}
          </CardTitle>
          <Badge className={
            match.status === 'live' ? 'bg-green-500' : 
            match.status === 'upcoming' ? 'bg-blue-500' : 
            'bg-gray-500'
          }>
            {match.status}
          </Badge>
        </div>

        {/* Fixed Match Info */}
        {isFixedMatch && hasFixedOutcome && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-800">FIXED MATCH</span>
            </div>
            <div className="text-green-700 font-medium">
              Guaranteed Result: {match.home_team} {match.fixed_home_score} - {match.fixed_away_score} {match.away_team}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Bet with confidence - outcome guaranteed as shown!
            </p>
          </div>
        )}
        
        {/* Live Scores Display */}
        {match.status === 'live' && (match.home_score !== null || match.away_score !== null) && (
          <div className="text-center py-2">
            <div className="text-2xl font-bold">
              {match.home_team}: {match.home_score || 0} - {match.away_score || 0} :{match.away_team}
            </div>
          </div>
        )}

        {/* Final Scores for Finished Matches */}
        {match.status === 'finished' && (
          <div className="text-center py-2">
            <div className="text-xl font-bold text-gray-700">
              Final: {match.home_team} {match.home_score || 0} - {match.away_score || 0} {match.away_team}
            </div>
            {isFixedMatch && (
              <p className="text-green-600 text-sm font-medium mt-1">
                ✅ Fixed outcome delivered as predicted!
              </p>
            )}
          </div>
        )}
        
        <MatchCountdown 
          startTime={match.start_time}
          status={match.status}
          currentMinute={match.current_minute}
          halfNumber={match.half_number}
          isHalftime={match.is_halftime}
        />
        
        <div className="text-sm text-muted-foreground space-y-1">
          <p>{new Date(match.start_time).toLocaleString('en-US', {
            timeZone: 'Africa/Nairobi',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} EAT</p>
          {match.league && <p className="font-medium">{match.league}</p>}
          {match.country && <p>{match.country}</p>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Betting Buttons - Only show for upcoming and live matches */}
          {isOpen && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => onBet(match, match.home_team || 'Home', homeOdds || 1.0)}
                  disabled={disabled}
                  variant="default"
                  className={`w-full ${isFixedMatch ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  size="sm"
                >
                  <div className="text-center">
                    <div className="font-medium text-xs">{match.home_team || 'Home'}</div>
                    <div className="text-xs opacity-75">{homeOdds?.toFixed(2)}x</div>
                    {isFixedMatch && match.fixed_home_score !== null && (
                      <div className="text-xs text-green-200">Score: {match.fixed_home_score}</div>
                    )}
                  </div>
                </Button>
                
                <Button
                  onClick={() => onBet(match, match.away_team || 'Away', awayOdds || 1.0)}
                  disabled={disabled}
                  variant="default"
                  className={`w-full ${isFixedMatch ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  size="sm"
                >
                  <div className="text-center">
                    <div className="font-medium text-xs">{match.away_team || 'Away'}</div>
                    <div className="text-xs opacity-75">{awayOdds?.toFixed(2)}x</div>
                    {isFixedMatch && match.fixed_away_score !== null && (
                      <div className="text-xs text-green-200">Score: {match.fixed_away_score}</div>
                    )}
                  </div>
                </Button>
              </div>
              
              {drawOdds && (
                <Button
                  onClick={() => onBet(match, 'Draw', drawOdds)}
                  disabled={disabled}
                  variant="outline"
                  className={`w-full ${isFixedMatch ? 'border-green-600 text-green-600 hover:bg-green-50' : ''}`}
                  size="sm"
                >
                  <div className="text-center">
                    <div className="font-medium text-xs">Draw</div>
                    <div className="text-xs opacity-75">{drawOdds.toFixed(2)}x</div>
                    {isFixedMatch && match.fixed_home_score === match.fixed_away_score && (
                      <div className="text-xs text-green-600">Score: {match.fixed_home_score}-{match.fixed_away_score}</div>
                    )}
                  </div>
                </Button>
              )}
            </>
          )}

          {/* Show message for finished matches */}
          {match.status === 'finished' && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500">This match has finished</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

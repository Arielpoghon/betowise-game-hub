import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  home_score: number | null;
  away_score: number | null;
  home_odds: number;
  draw_odds: number | null;
  away_odds: number;
  current_minute: number | null;
  half_number: number | null;
  is_halftime: boolean | null;
  actual_start_time: string | null;
  halftime_start_time: string | null;
  finished_at: string | null;
  game_duration_minutes: number | null;
  halftime_duration_minutes: number | null;
}

export function GameManager() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMatch, setNewMatch] = useState({
    title: '',
    home_team: '',
    away_team: '',
    league: '',
    country: '',
    sport: 'Soccer',
    start_time: '',
    home_odds: 1.90,
    draw_odds: 3.00,
    away_odds: 4.45
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch matches',
        variant: 'destructive'
      });
    } else {
      // Ensure all required fields exist with defaults
      const formattedMatches = (data || []).map((match: any) => ({
        ...match,
        current_minute: match.current_minute ?? 0,
        half_number: match.half_number ?? 1,
        is_halftime: match.is_halftime ?? false,
        actual_start_time: match.actual_start_time ?? null,
        halftime_start_time: match.halftime_start_time ?? null,
        finished_at: match.finished_at ?? null,
        game_duration_minutes: match.game_duration_minutes ?? 90,
        halftime_duration_minutes: match.halftime_duration_minutes ?? 10
      }));
      setMatches(formattedMatches);
    }
    setLoading(false);
  };

  const addMatch = async () => {
    if (!newMatch.title || !newMatch.home_team || !newMatch.away_team || !newMatch.start_time) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    // Convert to EAT timezone
    const startTimeEAT = new Date(newMatch.start_time).toISOString();

    const { error } = await supabase
      .from('matches')
      .insert({
        title: newMatch.title,
        home_team: newMatch.home_team,
        away_team: newMatch.away_team,
        league: newMatch.league,
        country: newMatch.country,
        sport: newMatch.sport,
        status: 'upcoming',
        start_time: startTimeEAT,
        match_date: startTimeEAT.split('T')[0],
        home_odds: newMatch.home_odds,
        draw_odds: newMatch.draw_odds,
        away_odds: newMatch.away_odds,
        home_score: null,
        away_score: null
      });

    if (error) {
      console.error('Error adding match:', error);
      toast({
        title: 'Error',
        description: 'Failed to add match',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Match added successfully',
      });
      setNewMatch({
        title: '',
        home_team: '',
        away_team: '',
        league: '',
        country: '',
        sport: 'Soccer',
        start_time: '',
        home_odds: 1.90,
        draw_odds: 3.00,
        away_odds: 4.45
      });
      fetchMatches();
    }
  };

  const updateScore = async (matchId: string, homeScore: number, awayScore: number) => {
    const { error } = await supabase
      .from('matches')
      .update({ 
        home_score: homeScore, 
        away_score: awayScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (error) {
      console.error('Error updating score:', error);
      toast({
        title: 'Error',
        description: 'Failed to update score',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Score updated successfully',
      });
      fetchMatches();
    }
  };

  const updateMatchStatus = async (matchId: string, status: string) => {
    const { error } = await supabase
      .from('matches')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Match status updated successfully',
      });
      fetchMatches();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Match</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="home_team">Home Team</Label>
              <Input
                id="home_team"
                value={newMatch.home_team}
                onChange={(e) => setNewMatch({ ...newMatch, home_team: e.target.value })}
                placeholder="Enter home team name"
              />
            </div>
            <div>
              <Label htmlFor="away_team">Away Team</Label>
              <Input
                id="away_team"
                value={newMatch.away_team}
                onChange={(e) => setNewMatch({ ...newMatch, away_team: e.target.value })}
                placeholder="Enter away team name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Match Title</Label>
            <Input
              id="title"
              value={newMatch.title}
              onChange={(e) => setNewMatch({ ...newMatch, title: e.target.value })}
              placeholder="Home Team vs Away Team"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="league">League</Label>
              <Input
                id="league"
                value={newMatch.league}
                onChange={(e) => setNewMatch({ ...newMatch, league: e.target.value })}
                placeholder="Premier League"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={newMatch.country}
                onChange={(e) => setNewMatch({ ...newMatch, country: e.target.value })}
                placeholder="Kenya"
              />
            </div>
            <div>
              <Label htmlFor="sport">Sport</Label>
              <Select value={newMatch.sport} onValueChange={(value) => setNewMatch({ ...newMatch, sport: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soccer">Soccer</SelectItem>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Tennis">Tennis</SelectItem>
                  <SelectItem value="Cricket">Cricket</SelectItem>
                  <SelectItem value="Rugby">Rugby</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="start_time">Start Time (EAT)</Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={newMatch.start_time}
              onChange={(e) => setNewMatch({ ...newMatch, start_time: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="home_odds">Home Odds</Label>
              <Input
                id="home_odds"
                type="number"
                step="0.01"
                value={newMatch.home_odds}
                onChange={(e) => setNewMatch({ ...newMatch, home_odds: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="draw_odds">Draw Odds</Label>
              <Input
                id="draw_odds"
                type="number"
                step="0.01"
                value={newMatch.draw_odds || ''}
                onChange={(e) => setNewMatch({ ...newMatch, draw_odds: e.target.value ? parseFloat(e.target.value) : null })}
              />
            </div>
            <div>
              <Label htmlFor="away_odds">Away Odds</Label>
              <Input
                id="away_odds"
                type="number"
                step="0.01"
                value={newMatch.away_odds}
                onChange={(e) => setNewMatch({ ...newMatch, away_odds: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <Button onClick={addMatch} className="w-full">
            Add Match
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Existing Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading matches...</p>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{match.title}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      match.status === 'live' ? 'bg-green-100 text-green-800' :
                      match.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {match.status} {match.current_minute && `(${match.current_minute}')`}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Home Score</Label>
                      <Input
                        type="number"
                        value={match.home_score || 0}
                        onChange={(e) => updateScore(match.id, parseInt(e.target.value) || 0, match.away_score || 0)}
                      />
                    </div>
                    <div>
                      <Label>Away Score</Label>
                      <Input
                        type="number"
                        value={match.away_score || 0}
                        onChange={(e) => updateScore(match.id, match.home_score || 0, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateMatchStatus(match.id, 'upcoming')}
                      disabled={match.status === 'upcoming'}
                    >
                      Set Upcoming
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateMatchStatus(match.id, 'live')}
                      disabled={match.status === 'live'}
                    >
                      Set Live
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateMatchStatus(match.id, 'finished')}
                      disabled={match.status === 'finished'}
                    >
                      Set Finished
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Start Time: {new Date(match.start_time).toLocaleString('en-US', {
                      timeZone: 'Africa/Nairobi'
                    })} EAT
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

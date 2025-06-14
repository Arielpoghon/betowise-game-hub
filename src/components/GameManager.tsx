
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  is_fixed_match: boolean | null;
  fixed_home_score: number | null;
  fixed_away_score: number | null;
  fixed_outcome_set: boolean | null;
  admin_notes: string | null;
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
    away_odds: 4.45,
    is_fixed_match: false,
    fixed_home_score: 0,
    fixed_away_score: 0,
    admin_notes: ''
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
      .limit(20);

    if (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch matches',
        variant: 'destructive'
      });
    } else {
      const formattedMatches = (data || []).map((match: any) => ({
        ...match,
        current_minute: match.current_minute ?? 0,
        half_number: match.half_number ?? 1,
        is_halftime: match.is_halftime ?? false,
        actual_start_time: match.actual_start_time ?? null,
        halftime_start_time: match.halftime_start_time ?? null,
        finished_at: match.finished_at ?? null,
        game_duration_minutes: match.game_duration_minutes ?? 90,
        halftime_duration_minutes: match.halftime_duration_minutes ?? 10,
        is_fixed_match: match.is_fixed_match ?? false,
        fixed_home_score: match.fixed_home_score ?? null,
        fixed_away_score: match.fixed_away_score ?? null,
        fixed_outcome_set: match.fixed_outcome_set ?? false,
        admin_notes: match.admin_notes ?? null
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

    const startTimeEAT = new Date(newMatch.start_time).toISOString();
    
    const matchData = {
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
      away_score: null,
      is_fixed_match: newMatch.is_fixed_match,
      fixed_home_score: newMatch.is_fixed_match ? newMatch.fixed_home_score : null,
      fixed_away_score: newMatch.is_fixed_match ? newMatch.fixed_away_score : null,
      fixed_outcome_set: newMatch.is_fixed_match,
      admin_notes: newMatch.admin_notes || null
    };

    const { data: matchResult, error } = await supabase
      .from('matches')
      .insert(matchData)
      .select()
      .single();

    if (error) {
      console.error('Error adding match:', error);
      toast({
        title: 'Error',
        description: 'Failed to add match',
        variant: 'destructive'
      });
      return;
    }

    // If it's a fixed match, also create the fixed outcome record
    if (newMatch.is_fixed_match && matchResult) {
      const { error: outcomeError } = await supabase
        .from('fixed_match_outcomes')
        .insert({
          match_id: matchResult.id,
          predicted_home_score: newMatch.fixed_home_score,
          predicted_away_score: newMatch.fixed_away_score
        });

      if (outcomeError) {
        console.error('Error adding fixed outcome:', outcomeError);
      }
    }

    toast({
      title: 'Success',
      description: `${newMatch.is_fixed_match ? 'Fixed' : 'Regular'} match added successfully`,
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
      away_odds: 4.45,
      is_fixed_match: false,
      fixed_home_score: 0,
      fixed_away_score: 0,
      admin_notes: ''
    });
    fetchMatches();
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

  const finishFixedMatch = async (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || !match.is_fixed_match) return;

    const { error } = await supabase
      .from('matches')
      .update({
        status: 'finished',
        home_score: match.fixed_home_score,
        away_score: match.fixed_away_score,
        finished_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (error) {
      console.error('Error finishing fixed match:', error);
      toast({
        title: 'Error',
        description: 'Failed to finish fixed match',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Fixed match finished with predicted score',
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

          {/* Fixed Match Section */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="is_fixed_match"
                checked={newMatch.is_fixed_match}
                onCheckedChange={(checked) => setNewMatch({ ...newMatch, is_fixed_match: checked })}
              />
              <Label htmlFor="is_fixed_match" className="font-semibold text-green-600">
                Fixed Match (Predetermined Outcome)
              </Label>
            </div>

            {newMatch.is_fixed_match && (
              <div className="space-y-4 bg-green-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fixed_home_score">Fixed Home Score</Label>
                    <Input
                      id="fixed_home_score"
                      type="number"
                      min="0"
                      value={newMatch.fixed_home_score}
                      onChange={(e) => setNewMatch({ ...newMatch, fixed_home_score: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fixed_away_score">Fixed Away Score</Label>
                    <Input
                      id="fixed_away_score"
                      type="number"
                      min="0"
                      value={newMatch.fixed_away_score}
                      onChange={(e) => setNewMatch({ ...newMatch, fixed_away_score: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="admin_notes">Admin Notes</Label>
                  <Textarea
                    id="admin_notes"
                    value={newMatch.admin_notes}
                    onChange={(e) => setNewMatch({ ...newMatch, admin_notes: e.target.value })}
                    placeholder="Internal notes about this fixed match..."
                  />
                </div>
              </div>
            )}
          </div>

          <Button onClick={addMatch} className="w-full">
            Add {newMatch.is_fixed_match ? 'Fixed' : 'Regular'} Match
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
                <div key={match.id} className={`border rounded-lg p-4 space-y-3 ${match.is_fixed_match ? 'bg-green-50 border-green-200' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{match.title}</h3>
                      {match.is_fixed_match && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          FIXED MATCH: {match.fixed_home_score} - {match.fixed_away_score}
                        </span>
                      )}
                    </div>
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
                      <Label>Current Home Score</Label>
                      <Input
                        type="number"
                        value={match.home_score || 0}
                        onChange={(e) => updateScore(match.id, parseInt(e.target.value) || 0, match.away_score || 0)}
                        disabled={match.is_fixed_match && match.status === 'finished'}
                      />
                    </div>
                    <div>
                      <Label>Current Away Score</Label>
                      <Input
                        type="number"
                        value={match.away_score || 0}
                        onChange={(e) => updateScore(match.id, match.home_score || 0, parseInt(e.target.value) || 0)}
                        disabled={match.is_fixed_match && match.status === 'finished'}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
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
                    
                    {match.is_fixed_match && match.status !== 'finished' && (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => finishFixedMatch(match.id)}
                      >
                        Finish with Fixed Score
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Start Time: {new Date(match.start_time).toLocaleString('en-US', {
                      timeZone: 'Africa/Nairobi'
                    })} EAT</p>
                    {match.admin_notes && (
                      <p className="text-green-600 font-medium">Notes: {match.admin_notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface League {
  id: string;
  sport_name: string;
  country: string;
  league_name: string;
  season: string;
}

export function GameManager() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    home_team: '',
    away_team: '',
    league: '',
    country: '',
    sport: 'Soccer',
    status: 'upcoming',
    start_time: '',
    match_date: '',
    match_time: '',
    home_odds: '1.90',
    draw_odds: '3.00',
    away_odds: '4.45',
    venue: '',
    season: '2024/2025',
    round_info: '',
    referee: '',
    weather_conditions: '',
    match_notes: '',
    over_under_odds: '',
    asian_handicap_odds: '',
    both_teams_score_odds: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    const { data, error } = await supabase
      .from('sports_leagues')
      .select('*')
      .eq('active', true)
      .order('sport_name', { ascending: true });

    if (error) {
      console.error('Error fetching leagues:', error);
      return;
    }

    setLeagues(data || []);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.home_team || !formData.away_team) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const matchData = {
        ...formData,
        home_odds: parseFloat(formData.home_odds) || null,
        draw_odds: parseFloat(formData.draw_odds) || null,
        away_odds: parseFloat(formData.away_odds) || null,
        over_under_odds: parseFloat(formData.over_under_odds) || null,
        asian_handicap_odds: parseFloat(formData.asian_handicap_odds) || null,
        both_teams_score_odds: parseFloat(formData.both_teams_score_odds) || null,
      };

      const { error } = await supabase
        .from('matches')
        .insert([matchData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Game Added",
        description: "The game has been successfully added to the database",
      });

      // Reset form
      setFormData({
        title: '',
        home_team: '',
        away_team: '',
        league: '',
        country: '',
        sport: 'Soccer',
        status: 'upcoming',
        start_time: '',
        match_date: '',
        match_time: '',
        home_odds: '1.90',
        draw_odds: '3.00',
        away_odds: '4.45',
        venue: '',
        season: '2024/2025',
        round_info: '',
        referee: '',
        weather_conditions: '',
        match_notes: '',
        over_under_odds: '',
        asian_handicap_odds: '',
        both_teams_score_odds: ''
      });

    } catch (error: any) {
      console.error('Error adding game:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add game",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Game</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Game Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Atlantis vs Inter Turku"
                required
              />
            </div>

            <div>
              <Label htmlFor="sport">Sport</Label>
              <Select value={formData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
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

            <div>
              <Label htmlFor="home_team">Home Team *</Label>
              <Input
                id="home_team"
                value={formData.home_team}
                onChange={(e) => handleInputChange('home_team', e.target.value)}
                placeholder="Home team name"
                required
              />
            </div>

            <div>
              <Label htmlFor="away_team">Away Team *</Label>
              <Input
                id="away_team"
                value={formData.away_team}
                onChange={(e) => handleInputChange('away_team', e.target.value)}
                placeholder="Away team name"
                required
              />
            </div>

            <div>
              <Label htmlFor="league">League</Label>
              <Input
                id="league"
                value={formData.league}
                onChange={(e) => handleInputChange('league', e.target.value)}
                placeholder="e.g., YKKONEN"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="e.g., Finland"
              />
            </div>

            <div>
              <Label htmlFor="match_date">Match Date</Label>
              <Input
                id="match_date"
                type="date"
                value={formData.match_date}
                onChange={(e) => handleInputChange('match_date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="match_time">Match Time</Label>
              <Input
                id="match_time"
                type="time"
                value={formData.match_time}
                onChange={(e) => handleInputChange('match_time', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="start_time">Start Time (Full DateTime)</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="postponed">Postponed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="home_odds">Home Team Odds</Label>
              <Input
                id="home_odds"
                type="number"
                step="0.01"
                value={formData.home_odds}
                onChange={(e) => handleInputChange('home_odds', e.target.value)}
                placeholder="1.90"
              />
            </div>

            <div>
              <Label htmlFor="draw_odds">Draw Odds</Label>
              <Input
                id="draw_odds"
                type="number"
                step="0.01"
                value={formData.draw_odds}
                onChange={(e) => handleInputChange('draw_odds', e.target.value)}
                placeholder="3.00"
              />
            </div>

            <div>
              <Label htmlFor="away_odds">Away Team Odds</Label>
              <Input
                id="away_odds"
                type="number"
                step="0.01"
                value={formData.away_odds}
                onChange={(e) => handleInputChange('away_odds', e.target.value)}
                placeholder="4.45"
              />
            </div>

            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="Stadium name"
              />
            </div>

            <div>
              <Label htmlFor="season">Season</Label>
              <Input
                id="season"
                value={formData.season}
                onChange={(e) => handleInputChange('season', e.target.value)}
                placeholder="2024/2025"
              />
            </div>

            <div>
              <Label htmlFor="round_info">Round Info</Label>
              <Input
                id="round_info"
                value={formData.round_info}
                onChange={(e) => handleInputChange('round_info', e.target.value)}
                placeholder="Round 1, Matchday 1"
              />
            </div>

            <div>
              <Label htmlFor="referee">Referee</Label>
              <Input
                id="referee"
                value={formData.referee}
                onChange={(e) => handleInputChange('referee', e.target.value)}
                placeholder="Referee name"
              />
            </div>

            <div>
              <Label htmlFor="weather_conditions">Weather</Label>
              <Input
                id="weather_conditions"
                value={formData.weather_conditions}
                onChange={(e) => handleInputChange('weather_conditions', e.target.value)}
                placeholder="Clear, 22°C"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="match_notes">Match Notes</Label>
            <Textarea
              id="match_notes"
              value={formData.match_notes}
              onChange={(e) => handleInputChange('match_notes', e.target.value)}
              placeholder="Additional match information"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="over_under_odds">Over/Under Odds</Label>
              <Input
                id="over_under_odds"
                type="number"
                step="0.01"
                value={formData.over_under_odds}
                onChange={(e) => handleInputChange('over_under_odds', e.target.value)}
                placeholder="1.85"
              />
            </div>

            <div>
              <Label htmlFor="asian_handicap_odds">Asian Handicap Odds</Label>
              <Input
                id="asian_handicap_odds"
                type="number"
                step="0.01"
                value={formData.asian_handicap_odds}
                onChange={(e) => handleInputChange('asian_handicap_odds', e.target.value)}
                placeholder="1.95"
              />
            </div>

            <div>
              <Label htmlFor="both_teams_score_odds">Both Teams Score Odds</Label>
              <Input
                id="both_teams_score_odds"
                type="number"
                step="0.01"
                value={formData.both_teams_score_odds}
                onChange={(e) => handleInputChange('both_teams_score_odds', e.target.value)}
                placeholder="1.70"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Add Game
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

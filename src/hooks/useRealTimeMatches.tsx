
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameTimer } from './useGameTimer';

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
  match_time: string | null;
  home_score: number | null;
  away_score: number | null;
  home_odds: string;
  draw_odds: string | null;
  away_odds: string;
  external_id: string;
  venue: string | null;
  season: string | null;
  round_info: string | null;
  home_team_logo: string | null;
  away_team_logo: string | null;
  referee: string | null;
  weather_conditions: string | null;
  attendance: number | null;
  match_notes: string | null;
  over_under_odds: number | null;
  asian_handicap_odds: number | null;
  both_teams_score_odds: number | null;
  correct_score_odds: any | null;
  first_half_result_odds: any | null;
  total_goals_odds: any | null;
  updated_at: string | null;
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

export function useRealTimeMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const { toast } = useToast();

  useGameTimer();

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('matches')
        .select('*')
        .order('start_time', { ascending: false });

      if (selectedSport !== 'All') {
        query = query.eq('sport', selectedSport);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error:', error);
        return;
      }

      const formattedMatches = (data || []).map((match: any) => ({
        ...match,
        home_odds: match.home_odds?.toString() || '1.00',
        draw_odds: match.draw_odds?.toString() || null,
        away_odds: match.away_odds?.toString() || '1.00',
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
    } catch (error: any) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeSport = (sport: string) => {
    setSelectedSport(sport);
  };

  useEffect(() => {
    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          console.log('Match update received:', payload);
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [selectedSport]);

  const liveMatches = matches.filter(match => match.status === 'live');
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const finishedMatches = matches.filter(match => match.status === 'finished');

  // Separate fixed matches for easier identification
  const fixedMatches = matches.filter(match => match.is_fixed_match);
  const regularMatches = matches.filter(match => !match.is_fixed_match);

  return {
    matches,
    liveMatches,
    upcomingMatches,
    finishedMatches,
    fixedMatches,
    regularMatches,
    loading,
    selectedSport,
    changeSport,
    refreshMatches: fetchMatches
  };
}


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export function useRealTimeMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('All');
  const { toast } = useToast();

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      // First, trigger the fetch-matches function to get fresh data
      const { error: fetchError } = await supabase.functions.invoke('fetch-matches');
      
      if (fetchError) {
        console.error('Error fetching fresh matches:', fetchError);
      }

      // Then get matches from database
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
        throw error;
      }

      setMatches(data || []);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error loading matches",
        description: error.message || "Failed to load match data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const changeSport = (sport: string) => {
    setSelectedSport(sport);
  };

  // Real-time subscription for matches
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
          // Refresh matches when changes occur
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch matches when component mounts or sport changes
  useEffect(() => {
    fetchMatches();
  }, [selectedSport]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatches();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedSport]);

  const liveMatches = matches.filter(match => match.status === 'live');
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const finishedMatches = matches.filter(match => match.status === 'finished');

  return {
    matches,
    liveMatches,
    upcomingMatches,
    finishedMatches,
    loading,
    selectedSport,
    changeSport,
    refreshMatches: fetchMatches
  };
}

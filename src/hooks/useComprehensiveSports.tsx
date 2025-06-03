
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Sport {
  name: string;
  count: number;
  icon: string;
}

interface ComprehensiveMatch {
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

export function useComprehensiveSports() {
  const [matches, setMatches] = useState<ComprehensiveMatch[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const { toast } = useToast();

  const fetchComprehensiveData = async () => {
    try {
      setLoading(true);
      
      toast({
        title: "Fetching comprehensive sports data",
        description: "This may take a moment as we fetch from TheSportsDB..."
      });

      // Trigger the comprehensive fetch function
      const { error: fetchError } = await supabase.functions.invoke('fetch-comprehensive-sports');
      
      if (fetchError) {
        console.error('Error fetching comprehensive data:', fetchError);
        toast({
          title: "Error fetching data",
          description: fetchError.message || "Failed to fetch comprehensive sports data",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Data updated successfully",
          description: "Comprehensive sports data has been fetched from TheSportsDB"
        });
      }

      // Fetch updated matches from database
      await loadMatches();

    } catch (error: any) {
      console.error('Error in comprehensive fetch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch comprehensive data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      let query = supabase
        .from('matches')
        .select('*')
        .order('start_time', { ascending: false });

      if (selectedSport !== 'All') {
        query = query.eq('sport', selectedSport);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const formattedMatches = (data || []).map(match => ({
        ...match,
        home_odds: match.home_odds?.toString() || '1.00',
        draw_odds: match.draw_odds?.toString() || null,
        away_odds: match.away_odds?.toString() || '1.00'
      }));

      setMatches(formattedMatches);

      // Calculate sports with counts
      const sportCounts = formattedMatches.reduce((acc, match) => {
        acc[match.sport] = (acc[match.sport] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sportsWithCounts = Object.entries(sportCounts).map(([sport, count]) => ({
        name: sport,
        count,
        icon: getSportIcon(sport)
      }));

      setSports(sportsWithCounts);

    } catch (error: any) {
      console.error('Error loading matches:', error);
      toast({
        title: "Error loading matches",
        description: error.message || "Failed to load match data",
        variant: "destructive"
      });
    }
  };

  const getSportIcon = (sport: string): string => {
    const iconMap: Record<string, string> = {
      'Soccer': '⚽',
      'Basketball': '🏀',
      'Tennis': '🎾',
      'Baseball': '⚾',
      'American Football': '🏈',
      'Hockey': '🏒',
      'Cricket': '🏏',
      'Rugby': '🏉',
      'Boxing': '🥊',
      'Golf': '⛳',
      'Swimming': '🏊',
      'Athletics': '🏃',
      'Cycling': '🚴',
      'Motorsport': '🏎️',
      'Volleyball': '🏐',
      'Table Tennis': '🏓',
      'Badminton': '🏸',
      'Handball': '🤾',
      'Wrestling': '🤼',
      'Martial Arts': '🥋',
    };
    
    return iconMap[sport] || '🏆';
  };

  const changeSport = (sport: string) => {
    setSelectedSport(sport);
  };

  // Load matches when component mounts or sport changes
  useEffect(() => {
    loadMatches();
  }, [selectedSport]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('comprehensive-matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          console.log('Match update received:', payload);
          loadMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSport]);

  const liveMatches = matches.filter(match => match.status === 'live');
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const finishedMatches = matches.filter(match => match.status === 'finished');

  return {
    matches,
    sports,
    liveMatches,
    upcomingMatches,
    finishedMatches,
    loading,
    selectedSport,
    changeSport,
    fetchComprehensiveData,
    refreshMatches: loadMatches
  };
}

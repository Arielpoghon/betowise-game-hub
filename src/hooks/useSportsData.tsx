
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SportDBMatch {
  idEvent: string;
  strEvent: string;
  strSport: string;
  strLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  dateEvent: string;
  strTime: string;
  strStatus: string;
  strCountry: string;
}

export interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  sport: string;
  time: string;
  status: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
}

const SPORT_ENDPOINTS = {
  'Soccer': 'soccer',
  'Boxing': 'boxing',
  'Rugby': 'rugby',
  'Tennis': 'tennis',
  'Basketball': 'basketball',
  'Baseball': 'baseball',
  'Cricket': 'cricket',
  'Hockey': 'hockey'
};

export function useSportsData() {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState('Soccer');
  const [liveCount, setLiveCount] = useState(0);
  const { toast } = useToast();

  const generateRealisticOdds = () => {
    const homeOdds = 1.2 + Math.random() * 3.8; // 1.2 to 5.0
    const awayOdds = 1.2 + Math.random() * 3.8;
    const drawOdds = 3.0 + Math.random() * 4.0; // 3.0 to 7.0
    
    return {
      homeOdds: parseFloat(homeOdds.toFixed(2)),
      drawOdds: parseFloat(drawOdds.toFixed(2)),
      awayOdds: parseFloat(awayOdds.toFixed(2))
    };
  };

  const fetchLiveMatches = async (sport: string = selectedSport) => {
    setLoading(true);
    try {
      // Fetch live events for the selected sport
      const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/latestscore.php?s=${SPORT_ENDPOINTS[sport as keyof typeof SPORT_ENDPOINTS] || 'soccer'}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch live matches');
      }

      const data = await response.json();
      console.log('SportDB Response:', data);

      if (data?.events && Array.isArray(data.events)) {
        const matches: LiveMatch[] = data.events
          .filter((event: any) => event && event.strEvent)
          .slice(0, 10) // Limit to 10 matches
          .map((event: any) => {
            const odds = generateRealisticOdds();
            return {
              id: event.idEvent || Math.random().toString(),
              homeTeam: event.strHomeTeam || 'Home Team',
              awayTeam: event.strAwayTeam || 'Away Team',
              league: event.strLeague || 'Unknown League',
              country: event.strCountry || 'Unknown',
              sport: event.strSport || sport,
              time: event.dateEvent && event.strTime ? 
                `${event.dateEvent} ${event.strTime}` : 
                new Date().toLocaleString(),
              status: event.strStatus === 'Match Finished' ? 'finished' : 'live',
              ...odds
            };
          });

        setLiveMatches(matches);
        setLiveCount(matches.filter(m => m.status === 'live').length);
        
        toast({
          title: "Matches updated!",
          description: `Found ${matches.length} ${sport} matches`
        });
      } else {
        // Fallback with realistic sample data if API doesn't return matches
        const fallbackMatches = generateFallbackMatches(sport);
        setLiveMatches(fallbackMatches);
        setLiveCount(Math.floor(Math.random() * 50) + 80); // Random live count between 80-130
        
        toast({
          title: "Sample matches loaded",
          description: `Showing sample ${sport} matches`
        });
      }
    } catch (error) {
      console.error('Error fetching live matches:', error);
      
      // Generate realistic fallback data
      const fallbackMatches = generateFallbackMatches(sport);
      setLiveMatches(fallbackMatches);
      setLiveCount(Math.floor(Math.random() * 50) + 80);
      
      toast({
        title: "Connection issue",
        description: `Showing sample ${sport} matches`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackMatches = (sport: string): LiveMatch[] => {
    const sportTeams = {
      'Soccer': [
        ['Manchester United', 'Liverpool'], ['Barcelona', 'Real Madrid'], 
        ['Bayern Munich', 'Dortmund'], ['PSG', 'Marseille'],
        ['Juventus', 'AC Milan'], ['Arsenal', 'Chelsea']
      ],
      'Boxing': [
        ['Anthony Joshua', 'Tyson Fury'], ['Canelo Alvarez', 'Gennady Golovkin'],
        ['Terence Crawford', 'Errol Spence'], ['Ryan Garcia', 'Gervonta Davis']
      ],
      'Tennis': [
        ['Novak Djokovic', 'Rafael Nadal'], ['Carlos Alcaraz', 'Daniil Medvedev'],
        ['Stefanos Tsitsipas', 'Alexander Zverev'], ['Jannik Sinner', 'Holger Rune']
      ],
      'Basketball': [
        ['Lakers', 'Warriors'], ['Celtics', 'Heat'], ['Nets', 'Sixers'], ['Bucks', 'Nuggets']
      ],
      'Rugby': [
        ['England', 'Wales'], ['France', 'Ireland'], ['South Africa', 'New Zealand'], ['Australia', 'Scotland']
      ]
    };

    const teams = sportTeams[sport as keyof typeof sportTeams] || sportTeams['Soccer'];
    
    return teams.map((teamPair, index) => {
      const odds = generateRealisticOdds();
      const isLive = Math.random() > 0.3; // 70% chance of being live
      
      return {
        id: `${sport}-${index}`,
        homeTeam: teamPair[0],
        awayTeam: teamPair[1],
        league: `${sport} Championship`,
        country: 'International',
        sport,
        time: new Date(Date.now() + (index * 3600000)).toLocaleString(),
        status: isLive ? 'live' : 'upcoming',
        ...odds
      };
    });
  };

  const changeSport = (sport: string) => {
    setSelectedSport(sport);
    fetchLiveMatches(sport);
  };

  useEffect(() => {
    fetchLiveMatches();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLiveMatches();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedSport]);

  return {
    liveMatches,
    loading,
    selectedSport,
    liveCount,
    fetchLiveMatches,
    changeSport
  };
}


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
  intHomeScore?: string;
  intAwayScore?: string;
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
  homeScore?: number;
  awayScore?: number;
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
    if (loading) return; // Prevent multiple simultaneous requests
    
    setLoading(true);
    console.log(`Fetching ${sport} matches from SportDB...`);
    
    try {
      // Try multiple SportDB endpoints for better data coverage
      const endpoints = [
        `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${new Date().toISOString().split('T')[0]}&s=${SPORT_ENDPOINTS[sport as keyof typeof SPORT_ENDPOINTS] || 'soccer'}`,
        `https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=133604`, // Example league ID
        `https://www.thesportsdb.com/api/v1/json/3/latestscore.php?s=${SPORT_ENDPOINTS[sport as keyof typeof SPORT_ENDPOINTS] || 'soccer'}`
      ];

      let matchesFound = false;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint);
          
          if (!response.ok) {
            console.log(`Endpoint failed with status: ${response.status}`);
            continue;
          }

          const data = await response.json();
          console.log(`SportDB Response for ${sport}:`, data);

          if (data?.events && Array.isArray(data.events) && data.events.length > 0) {
            const matches: LiveMatch[] = data.events
              .filter((event: any) => event && event.strEvent && event.strHomeTeam && event.strAwayTeam)
              .slice(0, 15) // Limit to 15 matches for better performance
              .map((event: any) => {
                const odds = generateRealisticOdds();
                const isLive = event.strStatus === 'Match Finished' ? false : Math.random() > 0.6; // 40% chance of being live
                
                return {
                  id: event.idEvent || Math.random().toString(),
                  homeTeam: event.strHomeTeam,
                  awayTeam: event.strAwayTeam,
                  league: event.strLeague || `${sport} League`,
                  country: event.strCountry || 'International',
                  sport: event.strSport || sport,
                  time: event.dateEvent && event.strTime ? 
                    `${event.dateEvent} ${event.strTime}` : 
                    new Date().toLocaleString(),
                  status: isLive ? 'live' : (event.strStatus === 'Match Finished' ? 'finished' : 'upcoming'),
                  homeScore: event.intHomeScore ? parseInt(event.intHomeScore) : undefined,
                  awayScore: event.intAwayScore ? parseInt(event.intAwayScore) : undefined,
                  ...odds
                };
              });

            setLiveMatches(matches);
            setLiveCount(matches.filter(m => m.status === 'live').length);
            matchesFound = true;
            
            toast({
              title: "Real matches loaded!",
              description: `Found ${matches.length} ${sport} matches from SportDB`
            });
            
            console.log(`Successfully loaded ${matches.length} matches for ${sport}`);
            break;
          }
        } catch (endpointError) {
          console.log(`Endpoint error:`, endpointError);
          continue;
        }
      }

      // If no real matches found, use realistic fallback data
      if (!matchesFound) {
        console.log(`No real matches found for ${sport}, using fallback data`);
        const fallbackMatches = generateFallbackMatches(sport);
        setLiveMatches(fallbackMatches);
        setLiveCount(fallbackMatches.filter(m => m.status === 'live').length);
        
        toast({
          title: "Sample matches loaded",
          description: `No live ${sport} matches found on SportDB, showing sample data`
        });
      }
    } catch (error) {
      console.error('Error fetching live matches:', error);
      
      // Generate realistic fallback data
      const fallbackMatches = generateFallbackMatches(sport);
      setLiveMatches(fallbackMatches);
      setLiveCount(fallbackMatches.filter(m => m.status === 'live').length);
      
      toast({
        title: "Connection issue",
        description: `Showing sample ${sport} matches due to connection error`,
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
        ['Juventus', 'AC Milan'], ['Arsenal', 'Chelsea'],
        ['Manchester City', 'Tottenham'], ['Inter Milan', 'Roma']
      ],
      'Boxing': [
        ['Anthony Joshua', 'Tyson Fury'], ['Canelo Alvarez', 'Gennady Golovkin'],
        ['Terence Crawford', 'Errol Spence'], ['Ryan Garcia', 'Gervonta Davis'],
        ['Dmitry Bivol', 'Artur Beterbiev'], ['Naoya Inoue', 'Stephen Fulton']
      ],
      'Tennis': [
        ['Novak Djokovic', 'Rafael Nadal'], ['Carlos Alcaraz', 'Daniil Medvedev'],
        ['Stefanos Tsitsipas', 'Alexander Zverev'], ['Jannik Sinner', 'Holger Rune'],
        ['Iga Swiatek', 'Aryna Sabalenka'], ['Coco Gauff', 'Jessica Pegula']
      ],
      'Basketball': [
        ['Lakers', 'Warriors'], ['Celtics', 'Heat'], ['Nets', 'Sixers'], 
        ['Bucks', 'Nuggets'], ['Suns', 'Clippers'], ['Bulls', 'Knicks']
      ],
      'Rugby': [
        ['England', 'Wales'], ['France', 'Ireland'], ['South Africa', 'New Zealand'], 
        ['Australia', 'Scotland'], ['Italy', 'Argentina'], ['Japan', 'Fiji']
      ],
      'Baseball': [
        ['Yankees', 'Red Sox'], ['Dodgers', 'Giants'], ['Astros', 'Rangers'],
        ['Braves', 'Mets'], ['Phillies', 'Marlins'], ['Cardinals', 'Cubs']
      ],
      'Cricket': [
        ['India', 'Australia'], ['England', 'Pakistan'], ['South Africa', 'New Zealand'],
        ['Sri Lanka', 'Bangladesh'], ['West Indies', 'Afghanistan'], ['Ireland', 'Zimbabwe']
      ],
      'Hockey': [
        ['Rangers', 'Bruins'], ['Leafs', 'Canadiens'], ['Kings', 'Sharks'],
        ['Lightning', 'Panthers'], ['Avalanche', 'Stars'], ['Oilers', 'Flames']
      ]
    };

    const teams = sportTeams[sport as keyof typeof sportTeams] || sportTeams['Soccer'];
    
    return teams.map((teamPair, index) => {
      const odds = generateRealisticOdds();
      const isLive = Math.random() > 0.4; // 60% chance of being live
      const isFinished = Math.random() > 0.7; // 30% chance of being finished
      
      return {
        id: `${sport}-fallback-${index}`,
        homeTeam: teamPair[0],
        awayTeam: teamPair[1],
        league: `${sport} Championship`,
        country: 'International',
        sport,
        time: new Date(Date.now() + (index * 3600000)).toLocaleString(),
        status: isFinished ? 'finished' : (isLive ? 'live' : 'upcoming'),
        homeScore: isFinished ? Math.floor(Math.random() * 5) : undefined,
        awayScore: isFinished ? Math.floor(Math.random() * 5) : undefined,
        ...odds
      };
    });
  };

  const changeSport = (sport: string) => {
    if (sport === selectedSport) return; // Prevent unnecessary updates
    
    console.log(`Changing sport to: ${sport}`);
    setSelectedSport(sport);
  };

  // Only fetch when sport changes, not on mount
  useEffect(() => {
    fetchLiveMatches(selectedSport);
  }, [selectedSport]);

  // Auto-refresh every 5 minutes (reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing matches...');
      fetchLiveMatches(selectedSport);
    }, 300000); // 5 minutes

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

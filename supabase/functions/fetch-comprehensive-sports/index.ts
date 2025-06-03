
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Sport {
  idSport: string;
  strSport: string;
  strFormat: string;
  strSportThumb?: string;
  strSportDescription?: string;
}

interface League {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strLeagueAlternate?: string;
  intFormedYear?: string;
  strCountry?: string;
  strWebsite?: string;
  strFacebook?: string;
  strTwitter?: string;
  strYoutube?: string;
  strDescriptionEN?: string;
  strBadge?: string;
  strLogo?: string;
  strPoster?: string;
  strTrophy?: string;
  strBanner?: string;
  strComplete?: string;
  strLocked?: string;
}

interface Match {
  idEvent: string;
  strEvent: string;
  strEventAlternate?: string;
  strFilename?: string;
  strSport: string;
  idLeague: string;
  strLeague: string;
  strSeason?: string;
  strDescriptionEN?: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore?: string;
  intAwayScore?: string;
  intRound?: string;
  strOfficial?: string;
  strTimestamp?: string;
  dateEvent: string;
  dateEventLocal?: string;
  strTime?: string;
  strTimeLocal?: string;
  strTVStation?: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strResult?: string;
  strVenue?: string;
  strCountry?: string;
  strCity?: string;
  strPoster?: string;
  strSquare?: string;
  strFanart?: string;
  strThumb?: string;
  strBanner?: string;
  strMap?: string;
  strTweet1?: string;
  strTweet2?: string;
  strTweet3?: string;
  strVideo?: string;
  strStatus?: string;
  strPostponed?: string;
  strLocked?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = Deno.env.get('THESPORTSDB_API_KEY');
    if (!apiKey) {
      throw new Error('TheSportsDB API key not configured');
    }

    console.log('Starting comprehensive sports data fetch...');

    // Step 1: Get all sports
    console.log('Fetching all sports...');
    const sportsResponse = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/all_sports.php`);
    
    if (!sportsResponse.ok) {
      throw new Error(`Failed to fetch sports: ${sportsResponse.status}`);
    }

    const sportsData = await sportsResponse.json();
    const sports: Sport[] = sportsData.sports || [];
    
    console.log(`Found ${sports.length} sports`);

    let totalMatches = 0;
    const allMatches = [];

    // Step 2 & 3: For each sport, get leagues and matches
    for (const sport of sports.slice(0, 10)) { // Limit to first 10 sports to avoid timeout
      try {
        console.log(`Processing sport: ${sport.strSport}`);

        // Get all leagues for this sport
        const leaguesResponse = await fetch(
          `https://www.thesportsdb.com/api/v1/json/${apiKey}/search_all_leagues.php?s=${encodeURIComponent(sport.strSport)}`
        );

        if (!leaguesResponse.ok) {
          console.log(`Failed to fetch leagues for ${sport.strSport}: ${leaguesResponse.status}`);
          continue;
        }

        const leaguesData = await leaguesResponse.json();
        const leagues: League[] = leaguesData.leagues || [];
        
        console.log(`Found ${leagues.length} leagues for ${sport.strSport}`);

        // For each league, get upcoming and past matches
        for (const league of leagues.slice(0, 3)) { // Limit to first 3 leagues per sport
          try {
            console.log(`Processing league: ${league.strLeague}`);

            // Get upcoming matches
            const upcomingResponse = await fetch(
              `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnextleague.php?id=${league.idLeague}`
            );

            if (upcomingResponse.ok) {
              const upcomingData = await upcomingResponse.json();
              const upcomingMatches: Match[] = upcomingData.events || [];
              
              console.log(`Found ${upcomingMatches.length} upcoming matches for ${league.strLeague}`);

              // Process upcoming matches
              for (const match of upcomingMatches.slice(0, 5)) { // Limit matches per league
                const processedMatch = {
                  external_id: match.idEvent,
                  title: match.strEvent || `${match.strHomeTeam} vs ${match.strAwayTeam}`,
                  home_team: match.strHomeTeam,
                  away_team: match.strAwayTeam,
                  league: match.strLeague,
                  country: match.strCountry || league.strCountry || 'International',
                  sport: match.strSport || sport.strSport,
                  status: 'upcoming',
                  start_time: match.dateEvent && match.strTime ? 
                    new Date(`${match.dateEvent} ${match.strTime}`).toISOString() : 
                    new Date(match.dateEvent || Date.now()).toISOString(),
                  match_date: new Date(match.dateEvent || Date.now()).toISOString(),
                  home_score: match.intHomeScore ? parseInt(match.intHomeScore) : null,
                  away_score: match.intAwayScore ? parseInt(match.intAwayScore) : null,
                  home_odds: (Math.random() * 3 + 1).toFixed(2),
                  draw_odds: sport.strSport.toLowerCase() === 'soccer' ? (Math.random() * 4 + 2).toFixed(2) : null,
                  away_odds: (Math.random() * 3 + 1).toFixed(2)
                };

                allMatches.push(processedMatch);
                totalMatches++;
              }
            }

            // Get past matches
            const pastResponse = await fetch(
              `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventspastleague.php?id=${league.idLeague}`
            );

            if (pastResponse.ok) {
              const pastData = await pastResponse.json();
              const pastMatches: Match[] = pastData.events || [];
              
              console.log(`Found ${pastMatches.length} past matches for ${league.strLeague}`);

              // Process past matches
              for (const match of pastMatches.slice(0, 3)) { // Limit past matches
                const processedMatch = {
                  external_id: match.idEvent,
                  title: match.strEvent || `${match.strHomeTeam} vs ${match.strAwayTeam}`,
                  home_team: match.strHomeTeam,
                  away_team: match.strAwayTeam,
                  league: match.strLeague,
                  country: match.strCountry || league.strCountry || 'International',
                  sport: match.strSport || sport.strSport,
                  status: 'finished',
                  start_time: match.dateEvent && match.strTime ? 
                    new Date(`${match.dateEvent} ${match.strTime}`).toISOString() : 
                    new Date(match.dateEvent || Date.now()).toISOString(),
                  match_date: new Date(match.dateEvent || Date.now()).toISOString(),
                  home_score: match.intHomeScore ? parseInt(match.intHomeScore) : null,
                  away_score: match.intAwayScore ? parseInt(match.intAwayScore) : null,
                  home_odds: (Math.random() * 3 + 1).toFixed(2),
                  draw_odds: sport.strSport.toLowerCase() === 'soccer' ? (Math.random() * 4 + 2).toFixed(2) : null,
                  away_odds: (Math.random() * 3 + 1).toFixed(2)
                };

                allMatches.push(processedMatch);
                totalMatches++;
              }
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));

          } catch (leagueError) {
            console.error(`Error processing league ${league.strLeague}:`, leagueError);
          }
        }

        // Add delay between sports
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (sportError) {
        console.error(`Error processing sport ${sport.strSport}:`, sportError);
      }
    }

    // Step 5: Get live soccer scores (limited)
    try {
      console.log('Fetching live soccer scores...');
      const liveResponse = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/latestsoccer.php`);
      
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        const liveMatches: Match[] = liveData.events || [];
        
        console.log(`Found ${liveMatches.length} live soccer matches`);

        for (const match of liveMatches) {
          const processedMatch = {
            external_id: match.idEvent,
            title: match.strEvent || `${match.strHomeTeam} vs ${match.strAwayTeam}`,
            home_team: match.strHomeTeam,
            away_team: match.strAwayTeam,
            league: match.strLeague,
            country: match.strCountry || 'International',
            sport: 'Soccer',
            status: 'live',
            start_time: match.dateEvent && match.strTime ? 
              new Date(`${match.dateEvent} ${match.strTime}`).toISOString() : 
              new Date().toISOString(),
            match_date: new Date(match.dateEvent || Date.now()).toISOString(),
            home_score: match.intHomeScore ? parseInt(match.intHomeScore) : null,
            away_score: match.intAwayScore ? parseInt(match.intAwayScore) : null,
            home_odds: (Math.random() * 3 + 1).toFixed(2),
            draw_odds: (Math.random() * 4 + 2).toFixed(2),
            away_odds: (Math.random() * 3 + 1).toFixed(2)
          };

          allMatches.push(processedMatch);
          totalMatches++;
        }
      }
    } catch (liveError) {
      console.error('Error fetching live soccer scores:', liveError);
    }

    // Insert or update matches in database
    console.log(`Inserting ${allMatches.length} matches into database...`);
    
    for (const match of allMatches) {
      try {
        const { error } = await supabase
          .from('matches')
          .upsert(match, { onConflict: 'external_id' });
        
        if (error) {
          console.error('Error inserting match:', error);
        }
      } catch (insertError) {
        console.error('Error during match insertion:', insertError);
      }
    }

    console.log(`Successfully processed ${totalMatches} matches`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully fetched and stored ${totalMatches} matches from TheSportsDB`,
        matches: totalMatches,
        breakdown: {
          total: allMatches.length,
          upcoming: allMatches.filter(m => m.status === 'upcoming').length,
          finished: allMatches.filter(m => m.status === 'finished').length,
          live: allMatches.filter(m => m.status === 'live').length
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Comprehensive fetch error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to fetch comprehensive sports data from TheSportsDB'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

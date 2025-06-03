
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch matches from TheSportsDB API
    const sports = ['Soccer', 'Basketball', 'Tennis', 'Boxing', 'Rugby'];
    const allMatches = [];

    for (const sport of sports) {
      try {
        // Get recent matches
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=4328&r=38&s=2023-2024`);
        const data = await response.json();
        
        if (data.events) {
          const matches = data.events.slice(0, 10).map((event: any) => ({
            external_id: event.idEvent,
            title: `${event.strHomeTeam} vs ${event.strAwayTeam}`,
            home_team: event.strHomeTeam,
            away_team: event.strAwayTeam,
            league: event.strLeague,
            country: event.strCountry || 'International',
            sport: sport,
            status: event.strStatus === 'Match Finished' ? 'finished' : 
                   event.strStatus === 'Not Started' ? 'upcoming' : 'live',
            start_time: event.dateEvent ? new Date(event.dateEvent).toISOString() : new Date().toISOString(),
            match_date: event.dateEvent ? new Date(event.dateEvent).toISOString() : new Date().toISOString(),
            home_score: event.intHomeScore ? parseInt(event.intHomeScore) : null,
            away_score: event.intAwayScore ? parseInt(event.intAwayScore) : null,
            home_odds: (Math.random() * 3 + 1).toFixed(2),
            draw_odds: (Math.random() * 4 + 2).toFixed(2),
            away_odds: (Math.random() * 3 + 1).toFixed(2)
          }));
          
          allMatches.push(...matches);
        }
      } catch (error) {
        console.error(`Error fetching ${sport} matches:`, error);
      }
    }

    // Add some sample live matches for immediate display
    const sampleMatches = [
      {
        external_id: 'live_1',
        title: 'Manchester United vs Liverpool',
        home_team: 'Manchester United',
        away_team: 'Liverpool',
        league: 'Premier League',
        country: 'England',
        sport: 'Soccer',
        status: 'live',
        start_time: new Date().toISOString(),
        match_date: new Date().toISOString(),
        home_score: 1,
        away_score: 2,
        home_odds: '2.10',
        draw_odds: '3.20',
        away_odds: '3.50'
      },
      {
        external_id: 'live_2',
        title: 'Lakers vs Warriors',
        home_team: 'Los Angeles Lakers',
        away_team: 'Golden State Warriors',
        league: 'NBA',
        country: 'USA',
        sport: 'Basketball',
        status: 'live',
        start_time: new Date().toISOString(),
        match_date: new Date().toISOString(),
        home_score: 95,
        away_score: 88,
        home_odds: '1.85',
        draw_odds: null,
        away_odds: '2.95'
      },
      {
        external_id: 'upcoming_1',
        title: 'Barcelona vs Real Madrid',
        home_team: 'Barcelona',
        away_team: 'Real Madrid',
        league: 'La Liga',
        country: 'Spain',
        sport: 'Soccer',
        status: 'upcoming',
        start_time: new Date(Date.now() + 3600000).toISOString(),
        match_date: new Date(Date.now() + 3600000).toISOString(),
        home_score: null,
        away_score: null,
        home_odds: '2.40',
        draw_odds: '3.10',
        away_odds: '2.90'
      }
    ];

    allMatches.push(...sampleMatches);

    // Insert or update matches in database
    for (const match of allMatches) {
      const { error } = await supabase
        .from('matches')
        .upsert(match, { onConflict: 'external_id' });
      
      if (error) {
        console.error('Error inserting match:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Fetched and stored ${allMatches.length} matches`,
        matches: allMatches.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});


import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useGameTimer() {
  useEffect(() => {
    const updateGameStatus = async () => {
      try {
        // Call the function to finish fixed matches automatically
        const { error } = await supabase.rpc('finish_fixed_matches');
        
        if (error) {
          console.error('Error finishing fixed matches:', error);
        } else {
          console.log('Fixed matches processing completed');
        }

        // Also call the bet outcomes processing
        const { error: betError } = await supabase.rpc('process_bet_outcomes');
        
        if (betError) {
          console.error('Error processing bet outcomes:', betError);
        } else {
          console.log('Bet outcomes processing completed');
        }
      } catch (error) {
        console.error('Error in game timer:', error);
      }
    };

    // Initial call
    updateGameStatus();

    // Set up interval to call every 30 seconds
    const interval = setInterval(updateGameStatus, 30000);

    return () => clearInterval(interval);
  }, []);
}

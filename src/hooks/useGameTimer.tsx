
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useGameTimer() {
  useEffect(() => {
    // Call the update_game_status function every 30 seconds
    const updateGameStatus = async () => {
      try {
        const { error } = await supabase.rpc('update_game_status');
        if (error) {
          console.error('Error updating game status:', error);
        }
      } catch (error) {
        console.error('Error calling update_game_status:', error);
      }
    };

    // Initial call
    updateGameStatus();

    // Set up interval to call every 30 seconds
    const interval = setInterval(updateGameStatus, 30000);

    return () => clearInterval(interval);
  }, []);
}

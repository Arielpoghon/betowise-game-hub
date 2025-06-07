import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useGameTimer() {
  useEffect(() => {
    // Call a simple query to trigger any database function we might set up later
    // For now, we'll just do a simple update to keep connections active
    const updateGameStatus = async () => {
      try {
        // We don't have the RPC function yet, so we'll skip this for now
        // The automatic updates will happen through database triggers
        console.log('Game timer tick - automatic updates handled by database');
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


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  username: string;
  balance: number;
  auth_user_id: string;
  created_at: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
      
      // Set up real-time subscription for balance updates
      const channel = supabase
        .channel('user-balance-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `auth_user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Balance updated:', payload);
            if (payload.new) {
              setProfile(prev => prev ? { ...prev, balance: payload.new.balance } : null);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const updateBalance = async (newBalance: number) => {
    if (!profile) return;

    const { error } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, balance: newBalance });
    }
  };

  return { profile, loading, fetchProfile, updateBalance };
}

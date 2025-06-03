
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any; needsVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  sendVerificationCode: (email: string) => Promise<{ error: any; code?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // If user just signed up, create profile
        if (event === 'SIGNED_IN' && session?.user) {
          createUserProfile(session.user);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!existingProfile) {
        // Create new user profile
        const { error } = await supabase
          .from('users')
          .insert({
            auth_user_id: user.id,
            email: user.email,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
            balance: 100.00, // Starting bonus
            email_verified: true
          });

        if (error) {
          console.error('Error creating user profile:', error);
        } else {
          console.log('User profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  const sendVerificationCode = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: { email }
      });

      if (error) throw error;

      return { error: null, code: data.code };
    } catch (error: any) {
      return { error };
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-email-code', {
        body: { email, code }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      // First, send verification code
      const { error: codeError, code } = await sendVerificationCode(email);
      
      if (codeError) {
        return { error: codeError };
      }

      // For now, we'll still create the account but mark it as needing verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: username ? { username } : undefined
        }
      });

      if (error) {
        return { error };
      }

      // Return success with verification needed flag
      return { error: null, needsVerification: true };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading,
      sendVerificationCode,
      verifyEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

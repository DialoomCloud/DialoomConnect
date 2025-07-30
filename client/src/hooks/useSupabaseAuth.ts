import { useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Sync user data to our database when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          await syncUserToDatabase(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user
  };
}

// Sync Supabase user to our PostgreSQL database
async function syncUserToDatabase(user: User) {
  try {
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || null,
      lastName: user.user_metadata?.last_name || user.user_metadata?.name?.split(' ').slice(1).join(' ') || null,
      profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    };

    // Get session to access token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.error('No access token available');
      return;
    }

    // Call our API to upsert user
    const response = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      console.error('Failed to sync user to database');
    }
  } catch (error) {
    console.error('Error syncing user to database:', error);
  }
}
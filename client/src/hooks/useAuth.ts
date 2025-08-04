import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isAdmin?: boolean;
}

export function useAuth() {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(true);

  // Get user details from our API
  const { data: userDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: !!supabaseUser,
    retry: false,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setIsSupabaseLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      // Invalidate user details query when auth state changes
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user: userDetails as AuthUser | undefined,
    isLoading: isSupabaseLoading || isDetailsLoading,
    isAuthenticated: !!supabaseUser && !!userDetails,
  };
}

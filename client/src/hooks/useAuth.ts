import { useSupabaseAuth } from './useSupabaseAuth';

export function useAuth() {
  const { user, loading, isAuthenticated } = useSupabaseAuth();

  return {
    user,
    isLoading: loading,
    isAuthenticated,
  };
}

import { useQuery } from "@tanstack/react-query";

export function useAdminAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check if user has admin role
  const isAdmin = user && (
    (user as any).roles?.includes('admin') || 
    (user as any).isAdmin === true
  );

  return {
    adminUser: isAdmin ? user : null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: !!isAdmin,
  };
}
import { useQuery } from "@tanstack/react-query";

const ADMIN_USERNAMES = ['dialoomroot', 'marcgarcia10', 'nachosaladrigas'];

export function useAdminAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check if user is admin based on email
  const isAdmin = user && ADMIN_USERNAMES.includes((user as any).email?.split('@')[0] || '');

  return {
    adminUser: isAdmin ? user : null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: !!isAdmin,
  };
}
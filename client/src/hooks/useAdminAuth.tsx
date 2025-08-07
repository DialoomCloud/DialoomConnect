import { useQuery } from "@tanstack/react-query";

const ADMIN_USERNAMES = ['dialoomroot', 'marc10garciabcn', 'nachosaladrigas'];

export function useAdminAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check if user is admin - first check email username, then check isAdmin flag
  const isAdminByEmail = user && ADMIN_USERNAMES.includes((user as any).email?.split('@')[0] || '');
  const isAdminByFlag = user && (user as any).isAdmin === true;
  const isAdmin = isAdminByEmail || isAdminByFlag;

  return {
    adminUser: isAdmin ? user : null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: !!isAdmin,
  };
}
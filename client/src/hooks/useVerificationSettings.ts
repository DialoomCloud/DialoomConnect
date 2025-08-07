import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface VerificationSettings {
  showVerified: boolean;
  showRecommended: boolean;
}

export function useVerificationSettings() {
  return useQuery<VerificationSettings>({
    queryKey: ["/api/admin/verification-settings"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/admin/verification-settings");
        return response.json();
      } catch (error) {
        // If endpoint fails (e.g., user not admin), return default settings
        return { showVerified: false, showRecommended: false };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
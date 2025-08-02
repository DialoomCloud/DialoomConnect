import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ThemeConfig {
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo?: {
    url: string;
  };
}

export function useThemeConfig() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/config/theme"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/admin/config");
        const configs = await response.json();
        
        // Parse theme configuration
        let themeConfig: ThemeConfig = {};
        
        const colorsConfig = configs.find((c: any) => c.key === 'theme_colors');
        if (colorsConfig) {
          themeConfig.colors = JSON.parse(colorsConfig.value);
        }
        
        const logoConfig = configs.find((c: any) => c.key === 'theme_logo');
        if (logoConfig) {
          themeConfig.logo = JSON.parse(logoConfig.value);
        }
        
        return themeConfig;
      } catch (error) {
        console.error("Error fetching theme config:", error);
        return null;
      }
    },
    // Don't retry on 401 errors
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  return {
    themeConfig: data,
    logoUrl: data?.logo?.url || '/uploads/images/dialoomblue.png',
    colors: data?.colors || {
      primary: '#008B9A',
      secondary: '#00B8CC',
      accent: '#B8DCE1'
    },
    isLoading,
  };
}
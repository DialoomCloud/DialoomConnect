import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import { Search, User, Mail, MapPin, CheckCircle, Eye, Sparkles, Brain } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";

type SearchResult = UserType & { relevance?: number };

export default function HostSearch() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [aiResults, setAiResults] = useState<SearchResult[]>([]);
  const [isAISearch, setIsAISearch] = useState(false);

  const { data: hosts, isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/hosts"],
  });

  // AI Search mutation
  const aiSearchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/hosts/search", { query });
      return response.json();
    },
    onSuccess: (data) => {
      setAiResults(data.results || []);
      setIsAISearch(true);
    },
    onError: (error) => {
      console.error("AI search failed:", error);
      setIsAISearch(false);
    }
  });

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.length > 2) {
        // Trigger AI search for meaningful queries
        aiSearchMutation.mutate(searchTerm);
      } else {
        setIsAISearch(false);
        setAiResults([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const filteredHosts = hosts?.filter((host) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      host.firstName?.toLowerCase().includes(search) ||
      host.lastName?.toLowerCase().includes(search) ||
      host.email?.toLowerCase().includes(search) ||
      host.title?.toLowerCase().includes(search)
    );
  });

  const displayHosts = isAISearch ? aiResults : filteredHosts;

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-[hsl(17,12%,6%)] mb-4">{t('hosts.title')}</h1>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
            {t('hosts.subtitle')} <br />
            <span className="inline-flex items-center gap-1 text-[hsl(188,100%,38%)] font-medium">
              <Brain className="w-4 h-4" />
              {isAISearch ? t('hosts.aiSearchActive') : t('hosts.aiSearchHint')}
            </span>
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {aiSearchMutation.isPending ? (
                <Sparkles className="absolute left-3 top-3 h-5 w-5 text-[hsl(188,100%,38%)] animate-spin" />
              ) : (
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              )}
              <Input
                type="text"
                placeholder={t('hosts.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-6 text-lg shadow-lg border-0 focus:ring-2 focus:ring-[hsl(188,100%,38%)] transition-all"
              />
              {isAISearch && (
                <div className="absolute right-3 top-3">
                  <Badge className="bg-[hsl(188,100%,38%)] text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    IA
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Search status */}
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              {isAISearch && aiResults.length > 0 && (
                <p className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4 text-[hsl(188,100%,38%)]" />
                  {t('hosts.foundResults', { count: aiResults.length })}
                </p>
              )}
              {aiSearchMutation.isPending && (
                <p className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-[hsl(188,100%,38%)]" />
                  {t('hosts.analyzing')}
                </p>
              )}
            </div>
          )}
        </div>

        {isLoading || aiSearchMutation.isPending ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(188,100%,38%)]"></div>
          </div>
        ) : displayHosts && displayHosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayHosts.map((host, index) => (
              <Card 
                key={host.id} 
                className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center border-4 border-[hsl(188,100%,95%)] animate-glow">
                      {host.profileImageUrl ? (
                        <img 
                          src={host.profileImageUrl.startsWith('http') || host.profileImageUrl.startsWith('/') ? host.profileImageUrl : `/storage/${host.profileImageUrl}`} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-1">
                      {host.firstName && host.lastName 
                        ? `${host.firstName} ${host.lastName}` 
                        : host.email}
                    </h3>
                    {host.title && (
                      <p className="text-gray-600 mb-3">{host.title}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-[hsl(188,80%,95%)] text-[hsl(188,80%,42%)] hover:bg-[hsl(188,80%,90%)]">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {t('home.verified')}
                      </Badge>
                      {isAISearch && (host as SearchResult).relevance && (host as SearchResult).relevance! > 0.7 && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {Math.round((host as SearchResult).relevance! * 100)}{t('hosts.relevant')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {host.email && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-2 text-[hsl(188,100%,38%)]" />
                        <span className="truncate">{host.email}</span>
                      </div>
                    )}
                    {host.city && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-[hsl(188,100%,38%)]" />
                        <span>{host.city}</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/user/${host.id}`}>
                    <Button 
                      className="w-full bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] glow-button relative overflow-hidden"
                    >
                      <Eye className="w-4 h-4 mr-2 relative z-10" />
                      <span className="relative z-10">{t('hosts.viewProfile')}</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('hosts.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
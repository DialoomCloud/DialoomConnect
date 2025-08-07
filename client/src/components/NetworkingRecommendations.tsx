import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Star, MapPin, Briefcase, MessageCircle, Eye, X, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVerificationSettings } from '@/hooks/useVerificationSettings';

interface NetworkingRecommendation {
  id: string;
  recommendedUserId: string;
  matchType: 'skills_complement' | 'common_interests' | 'similar_goals' | 'location_based';
  matchScore: number;
  reasoning: string;
  status: 'pending' | 'viewed' | 'contacted' | 'dismissed';
  createdAt: string;
  recommendedUser: {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    description?: string;
    city?: string;
    nationality?: string;
    profileImageUrl?: string;
    isHost: boolean;
    isVerified: boolean;
  };
}

export default function NetworkingRecommendations() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: verificationSettings } = useVerificationSettings();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Fetch networking recommendations
  const { data: recommendations = [], isLoading, refetch } = useQuery<NetworkingRecommendation[]>({
    queryKey: ['/api/networking/recommendations'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate new recommendations
  const generateMutation = useMutation({
    mutationFn: () => apiRequest('/api/networking/recommendations/generate', {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/networking/recommendations'] });
    },
  });

  // Update recommendation status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/api/networking/recommendations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/networking/recommendations'] });
    },
  });

  const getMatchTypeLabel = (type: string) => {
    const labels = {
      skills_complement: t('networking.matchTypes.skillsComplement', 'Skills Complement'),
      common_interests: t('networking.matchTypes.commonInterests', 'Common Interests'),
      similar_goals: t('networking.matchTypes.similarGoals', 'Similar Goals'),
      location_based: t('networking.matchTypes.locationBased', 'Location Based'),
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getMatchTypeColor = (type: string) => {
    const colors = {
      skills_complement: 'bg-blue-100 text-blue-800',
      common_interests: 'bg-green-100 text-green-800',
      similar_goals: 'bg-purple-100 text-purple-800',
      location_based: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(188,100%,38%)]" />
        <span className="ml-2 text-gray-600">{t('networking.loading', 'Loading recommendations...')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(17,12%,6%)] flex items-center">
            <Users className="mr-2 h-6 w-6 text-[hsl(188,100%,38%)]" />
            {t('networking.title', 'Networking Recommendations')}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('networking.description', 'AI-powered suggestions for meaningful professional connections')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,38%)] hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('networking.refresh', 'Refresh')}
          </Button>
          
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,35%)] text-white"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Star className="w-4 h-4 mr-2" />
            )}
            {t('networking.generate', 'Generate New')}
          </Button>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('networking.noRecommendations', 'No networking recommendations yet')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('networking.noRecommendationsDesc', 'Complete your profile and generate recommendations to find meaningful professional connections')}
            </p>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,35%)] text-white"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Star className="w-4 h-4 mr-2" />
              )}
              {t('networking.generateFirst', 'Generate First Recommendations')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <Card 
              key={rec.id} 
              className={`transition-all duration-200 hover:shadow-lg ${
                rec.status === 'dismissed' ? 'opacity-60' : ''
              } ${expandedCard === rec.id ? 'md:col-span-2' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={rec.recommendedUser.profileImageUrl} 
                        alt={`${rec.recommendedUser.firstName} ${rec.recommendedUser.lastName}`} 
                      />
                      <AvatarFallback>
                        {rec.recommendedUser.firstName?.[0]}{rec.recommendedUser.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-[hsl(17,12%,6%)]">
                        {rec.recommendedUser.firstName} {rec.recommendedUser.lastName}
                        {rec.recommendedUser.isVerified && verificationSettings?.showVerified && (
                          <span className="ml-1 text-green-500">✓</span>
                        )}
                      </h3>
                      {rec.recommendedUser.title && (
                        <p className="text-sm text-gray-600">{rec.recommendedUser.title}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getMatchTypeColor(rec.matchType)} text-xs`}>
                      {getMatchTypeLabel(rec.matchType)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {rec.matchScore}% {t('networking.match', 'match')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  {rec.recommendedUser.city && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {rec.recommendedUser.city}
                    </div>
                  )}
                  {rec.recommendedUser.isHost && (
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {t('networking.hostAvailable', 'Host')}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>{t('networking.whyMatch', 'Why this match:')}</strong> {rec.reasoning}
                  </p>
                </div>

                {expandedCard === rec.id && rec.recommendedUser.description && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">{rec.recommendedUser.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedCard(expandedCard === rec.id ? null : rec.id)}
                    className="text-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,38%)]/10"
                  >
                    {expandedCard === rec.id ? t('networking.showLess', 'Show Less') : t('networking.showMore', 'Show More')}
                  </Button>

                  <div className="flex space-x-2">
                    {rec.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(rec.id, 'viewed')}
                          disabled={updateStatusMutation.isPending}
                          className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,35%)] text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('networking.markViewed', 'Viewed')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(rec.id, 'contacted')}
                          disabled={updateStatusMutation.isPending}
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {t('networking.markContacted', 'Contacted')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(rec.id, 'dismissed')}
                          disabled={updateStatusMutation.isPending}
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          {t('networking.dismiss', 'Dismiss')}
                        </Button>
                      </>
                    )}
                    
                    {rec.status === 'viewed' && (
                      <Badge variant="secondary" className="text-blue-600">
                        {t('networking.status.viewed', 'Viewed')}
                      </Badge>
                    )}
                    
                    {rec.status === 'contacted' && (
                      <Badge variant="secondary" className="text-green-600">
                        {t('networking.status.contacted', 'Contacted')}
                      </Badge>
                    )}
                    
                    {rec.status === 'dismissed' && (
                      <Badge variant="secondary" className="text-red-600">
                        {t('networking.status.dismissed', 'Dismissed')}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
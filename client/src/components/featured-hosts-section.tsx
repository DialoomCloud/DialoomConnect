import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";
import { Link } from "wouter";
import type { User } from "@shared/schema";
import { AvailabilityTooltip } from "@/components/availability-tooltip";
import { ReviewsModal } from "@/components/reviews-modal";
import { useIntelligentTranslation } from "@/hooks/useIntelligentTranslation";

// Component for individual host card with translation
function FeaturedHostCard({ host, onReviewsClick }: { host: User; onReviewsClick: (host: User, e: React.MouseEvent) => void }) {
  // Intelligent translation for host title
  const { 
    translatedDescription: translatedTitle, 
    isTranslating, 
    wasTranslated 
  } = useIntelligentTranslation({
    description: (host as any).title || 'Experto Profesional',
    hostId: host.id || '',
    enabled: !!((host as any).title) && !!(host.id)
  });

  return (
    <Link href={`/host/${host.id}`}>
      <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="text-center">
            {/* Host Profile Image - Doubled size */}
            <div className="relative w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-[hsl(188,100%,95%)]">
              {/* Always show initials as fallback */}
              <div className="w-full h-full bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {(host as any).firstName?.[0] || 'U'}{(host as any).lastName?.[0] || 'S'}
                </span>
              </div>
              {/* Show image on top if available */}
              {(host as any).profileImageUrl && (
                <img 
                  src={`/storage/${(host as any).profileImageUrl}`} 
                  alt={`${(host as any).firstName || ''} ${(host as any).lastName || ''}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    // Hide the image element to show initials fallback
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            {/* Host Name */}
            <h3 className="font-bold text-[hsl(17,12%,6%)] mb-1">
              {(host as any).firstName || 'Experto'} {(host as any).lastName || 'Profesional'}
            </h3>

            {/* Host Title - Elegant lowercase styling with translation */}
            <p className="text-[hsl(188,100%,38%)] font-semibold text-lg mb-2 capitalize relative">
              {isTranslating ? (
                <span className="animate-pulse">
                  {((host as any).title || 'Experto Profesional').toLowerCase()}
                </span>
              ) : (
                <span>
                  {translatedTitle.toLowerCase()}
                  {wasTranslated && (
                    <span className="ml-1 text-xs text-[hsl(188,100%,32%)] opacity-60" title="Traducido automáticamente">
                      ✨
                    </span>
                  )}
                </span>
              )}
            </p>

            {/* Rating - Clickable */}
            <div className="flex items-center justify-center mb-2">
              <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
              <span className="text-sm text-gray-600">
                {(host as any).rating ? `${(host as any).rating.toFixed(1)}` : '5.0'} 
                <button 
                  onClick={(e) => onReviewsClick(host, e)}
                  className="hover:text-[hsl(188,100%,38%)] hover:underline transition-colors cursor-pointer ml-1"
                >
                  (12 reseñas)
                </button>
              </span>
            </div>

            {/* Location */}
            {(host as any).city && (
              <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{(host as any).city}</span>
              </div>
            )}

            {/* Availability Status */}
            <div className="flex justify-center">
              <AvailabilityTooltip status="Alta" className="text-xs" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function FeaturedHostsSection() {
  const [selectedHost, setSelectedHost] = useState<User | null>(null);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  // Fetch featured hosts from the API
  const { data: featuredHosts = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/hosts/featured'],
    enabled: true,
  });

  const handleReviewsClick = (host: User, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedHost(host);
    setShowReviewsModal(true);
  };

  if (isLoading) {
    return (
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[hsl(17,12%,6%)]">
            Expertos Destacados
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white border-[hsl(220,13%,90%)] shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[hsl(17,12%,6%)]">
          Expertos Destacados
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {featuredHosts.slice(0, 3).map((host: User) => (
          <FeaturedHostCard 
            key={host.id} 
            host={host} 
            onReviewsClick={handleReviewsClick}
          />
        ))}
      </div>

      {/* Reviews Modal */}
      {selectedHost && (
        <ReviewsModal
          isOpen={showReviewsModal}
          onClose={() => setShowReviewsModal(false)}
          hostId={selectedHost.id}
          hostName={`${selectedHost.firstName || 'Experto'} ${selectedHost.lastName || 'Profesional'}`}
          totalReviews={12}
          averageRating={5.0}
        />
      )}
    </div>
  );
}
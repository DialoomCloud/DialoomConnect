import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";
import { Link } from "wouter";
import type { User } from "@shared/schema";

export function FeaturedHostsSection() {
  // Fetch featured hosts from the API
  const { data: featuredHosts = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/hosts/featured'],
    enabled: true,
  });

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
          <Link key={host.id} href={`/host/${host.id}`}>
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-center">
                  {/* Host Profile Image */}
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden border-4 border-[hsl(188,100%,95%)]">
                    {(host as any).profileImagePath ? (
                      <img 
                        src={`/storage/${(host as any).profileImagePath}`} 
                        alt={`${(host as any).firstName || ''} ${(host as any).lastName || ''}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {(host as any).firstName?.[0] || 'U'}{(host as any).lastName?.[0] || 'S'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Host Name */}
                  <h3 className="font-bold text-[hsl(17,12%,6%)] mb-1">
                    {(host as any).firstName || 'Experto'} {(host as any).lastName || 'Profesional'}
                  </h3>

                  {/* Host Title */}
                  <p className="text-[hsl(188,100%,38%)] font-medium text-sm mb-2">
                    {(host as any).title || 'Experto Profesional'}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                    <span className="text-sm text-gray-600">
                      {(host as any).rating ? `${(host as any).rating.toFixed(1)}` : '5.0'} 
                      ({(host as any).reviewCount || '0'} reseñas)
                    </span>
                  </div>

                  {/* Location */}
                  {(host as any).city && (
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{(host as any).city}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { MediaEmbed } from "@/components/media-embed";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { User, Phone, MapPin, Mail, Edit, Plus, CheckCircle } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  // Fetch media content
  const { data: mediaContent = [], isLoading: mediaLoading } = useQuery({
    queryKey: ["/api/media"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  if (authLoading || userLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(244,91%,68%)]"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-4">Tu Dashboard Personal</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gestiona toda tu información personal y contenido multimedia desde un panel centralizado
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center border-4 border-[hsl(244,91%,95%)]">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[hsl(17,12%,6%)]">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.email}
                  </h3>
                  {user.title && (
                    <p className="text-gray-600">{user.title}</p>
                  )}
                  <div className="flex justify-center mt-3">
                    <Badge className="bg-[hsl(159,61%,95%)] text-[hsl(159,61%,50%)] hover:bg-[hsl(159,61%,90%)]">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verificado
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  {user.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-5 h-5 mr-3 text-[hsl(244,91%,68%)]" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-3 text-[hsl(244,91%,68%)]" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-3 text-[hsl(244,91%,68%)]" />
                      <span className="text-sm">{user.address}</span>
                    </div>
                  )}
                </div>

                <Link href="/profile">
                  <Button className="w-full mt-6 bg-[hsl(244,91%,68%)] text-white hover:bg-[hsl(244,91%,60%)]">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Content Management */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[hsl(17,12%,6%)]">Contenido Multimedia</h3>
                  <Link href="/profile">
                    <Button className="bg-[hsl(159,61%,50%)] text-white hover:bg-[hsl(159,61%,45%)]">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </Link>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mediaLoading ? (
                    <>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-300 rounded mb-3"></div>
                          <div className="aspect-video bg-gray-300 rounded mb-3"></div>
                          <div className="h-3 bg-gray-300 rounded mb-1"></div>
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      ))}
                    </>
                  ) : mediaContent.length > 0 ? (
                    mediaContent.map((content: any) => (
                      <MediaEmbed key={content.id} content={content} />
                    ))
                  ) : (
                    <div className="md:col-span-2 text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No hay contenido multimedia</h4>
                      <p className="text-gray-600 mb-4">
                        Comienza agregando videos de YouTube, posts de Instagram o videos de TikTok
                      </p>
                      <Link href="/profile">
                        <Button className="bg-[hsl(244,91%,68%)] text-white hover:bg-[hsl(244,91%,60%)]">
                          Agregar contenido
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Add Content Placeholder - only show when there is content */}
                  {mediaContent.length > 0 && (
                    <Link href="/profile">
                      <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center aspect-video hover:border-[hsl(244,91%,68%)] transition-colors cursor-pointer">
                        <Plus className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 font-medium">Agregar nuevo contenido</p>
                        <p className="text-sm text-gray-400 mt-1">YouTube, Instagram o TikTok</p>
                      </div>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

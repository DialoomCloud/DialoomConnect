import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { ProfileEditModal } from "@/components/profile-edit-modal";
import { MediaUploadModal } from "@/components/media-upload-modal";
import { MediaEditModal } from "@/components/media-edit-modal";
import { MediaEmbed } from "@/components/media-embed";
import type { User, MediaContent } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { User as UserIcon, Phone, MapPin, Mail, Edit, Plus, CheckCircle, Trash2 } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContent, setEditingContent] = useState<MediaContent | null>(null);
  const queryClient = useQueryClient();

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
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  // Handle user error
  if (userError && isUnauthorizedError(userError as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  // Fetch media content
  const { data: mediaContent = [], isLoading: mediaLoading, error: mediaError } = useQuery<MediaContent[]>({
    queryKey: ["/api/media"],
    enabled: isAuthenticated,
  });

  // Handle media error
  if (mediaError && isUnauthorizedError(mediaError as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  // Delete media content mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Contenido eliminado",
        description: "El contenido multimedia ha sido eliminado exitosamente.",
      });
    },
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
      toast({
        title: "Error",
        description: "No se pudo eliminar el contenido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteMedia = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este contenido?")) {
      deleteMediaMutation.mutate(id);
    }
  };

  const handleEditMedia = (content: MediaContent) => {
    setEditingContent(content);
    setShowEditModal(true);
  };

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
          <h2 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-4">Gestión de Perfil</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Edita tu información personal y gestiona tu contenido multimedia
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
                      <UserIcon className="w-12 h-12 text-gray-400" />
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
                      <span className="truncate text-sm">{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-3 text-[hsl(244,91%,68%)]" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-3 text-[hsl(244,91%,68%)]" />
                      <span className="text-sm">{user.address}</span>
                    </div>
                  )}
                </div>

                {user.description && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{user.description}</p>
                  </div>
                )}

                <Button 
                  onClick={() => setShowProfileModal(true)}
                  className="w-full mt-6 bg-[hsl(244,91%,68%)] text-white hover:bg-[hsl(244,91%,60%)]"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Content Management */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[hsl(17,12%,6%)]">Contenido Multimedia</h3>
                  <Button 
                    onClick={() => setShowUploadModal(true)}
                    className="bg-[hsl(159,61%,50%)] text-white hover:bg-[hsl(159,61%,45%)]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
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
                    <>
                      {mediaContent.map((content: MediaContent) => (
                        <div key={content.id} className="relative group">
                          <MediaEmbed 
                            content={content} 
                            onEdit={handleEditMedia}
                            showEdit={true}
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteMedia(content.id)}
                            disabled={deleteMediaMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {/* Add Content Placeholder */}
                      <div 
                        onClick={() => setShowUploadModal(true)}
                        className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center aspect-video hover:border-[hsl(244,91%,68%)] transition-colors cursor-pointer"
                      >
                        <Plus className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 font-medium">Agregar nuevo contenido</p>
                        <p className="text-sm text-gray-400 mt-1">YouTube, Videos MP4 o Imágenes</p>
                      </div>
                    </>
                  ) : (
                    <div className="md:col-span-2 text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No hay contenido multimedia</h4>
                      <p className="text-gray-600 mb-4">
                        Comienza agregando videos de YouTube, videos MP4 locales o imágenes
                      </p>
                      <Button 
                        onClick={() => setShowUploadModal(true)}
                        className="bg-[hsl(244,91%,68%)] text-white hover:bg-[hsl(244,91%,60%)]"
                      >
                        Agregar contenido
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfileEditModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
      
      <MediaUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
      
      <MediaEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        content={editingContent}
      />
    </div>
  );
}

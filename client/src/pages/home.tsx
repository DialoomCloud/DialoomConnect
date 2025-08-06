import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SortableMediaGrid } from "@/components/sortable-media-grid";
import { MediaEditModal } from "@/components/media-edit-modal";
import { MediaViewerModal } from "@/components/media-viewer-modal";
import { MediaUploadModal } from "@/components/media-upload-modal";


import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { User as UserIcon, Phone, MapPin, Mail, Edit, Plus, CheckCircle, Trash2, Search, Users, Calendar, Video, Settings, Newspaper, Clock, Eye } from "lucide-react";
import type { User, MediaContent, NewsArticle } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { adminUser, isLoading: adminLoading } = useAdminAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingContent, setEditingContent] = useState<MediaContent | null>(null);
  const [viewingContent, setViewingContent] = useState<MediaContent | null>(null);
  const [replacingContent, setReplacingContent] = useState<MediaContent | null>(null);

  // Debug authentication state
  console.log("Home: Auth state", { isAuthenticated, authLoading, adminUser, adminLoading });

  // Remove automatic admin redirect - users should navigate manually

  // Only redirect to login if trying to access authenticated content
  // Keep home page accessible to anonymous users

  // Fetch user profile
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  // Handle user error - only show error, don't redirect
  if (userError && isUnauthorizedError(userError as Error)) {
    console.log("User not authenticated, showing limited content");
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
      window.location.href = "/login";
    }, 500);
  }



  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)] flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(188,100%,38%)]"></div>
          <div className="absolute inset-0 animate-glow rounded-full"></div>
        </div>
      </div>
    );
  }

  // Show public content for anonymous users
  if (!isAuthenticated && !adminUser) {
    console.log("Home: Rendering anonymous user view");
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(220,9%,98%)] to-[hsl(220,20%,95%)]">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold text-[hsl(17,12%,6%)] mb-6">
                Dialoom
              </h1>
              <h2 className="text-2xl text-[hsl(188,100%,38%)] font-semibold mb-4">
                Conecta. Aprende. Crece.
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                La plataforma que conecta a expertos y personas que buscan conocimiento a través de videollamadas personalizadas
              </p>
              
              {/* Main CTA */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-6">
                  ¿Listo para empezar a explorar?
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/hosts">
                    <Button className="bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)] px-8 py-3 text-lg">
                      Buscar Expertos
                    </Button>
                  </Link>
                  <Button
                    onClick={() => window.location.href = "/login"}
                    variant="outline" 
                    className="border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,38%)] hover:text-white px-8 py-3 text-lg"
                  >
                    Iniciar Sesión
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* How it Works Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-[hsl(17,12%,6%)] mb-12">
              ¿Cómo funciona?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[hsl(188,100%,38%)]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-3">
                  1. Busca Expertos
                </h3>
                <p className="text-gray-600">
                  Encuentra profesionales en tu área de interés y revisa sus perfiles
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-[hsl(188,100%,38%)]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-3">
                  2. Reserva tu Sesión
                </h3>
                <p className="text-gray-600">
                  Elige el horario que mejor te convenga y configura tu llamada
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-[hsl(188,100%,38%)]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-3">
                  3. Conecta y Aprende
                </h3>
                <p className="text-gray-600">
                  Disfruta de tu videollamada personalizada con el experto
                </p>
              </div>
            </div>
          </div>

          {/* Featured Hosts Section */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[hsl(17,12%,6%)]">
                Expertos Destacados
              </h2>
              <Link href="/hosts">
                <Button variant="outline" className="border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)]">
                  Ver Todos
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] rounded-full flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[hsl(17,12%,6%)] mb-1">
                          Expert {i}
                        </h3>
                        <p className="text-[hsl(188,100%,38%)] font-medium text-sm mb-2">
                          Especialista en Marketing Digital
                        </p>
                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-gray-600">5.0 (10 reseñas)</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          Experto en estrategias de marketing digital y crecimiento empresarial
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose Dialoom Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-[hsl(17,12%,6%)] mb-12">
              ¿Por qué elegir Dialoom?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg text-center p-6">
                <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[hsl(188,100%,38%)]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-3">
                  Expertos Verificados
                </h3>
                <p className="text-gray-600">
                  Todos nuestros profesionales pasan por un proceso de verificación riguroso
                </p>
              </Card>
              
              <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg text-center p-6">
                <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-[hsl(188,100%,38%)]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-3">
                  Horarios Flexibles
                </h3>
                <p className="text-gray-600">
                  Reserva sesiones cuando mejor te convenga, 24/7
                </p>
              </Card>
              
              <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg text-center p-6">
                <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-[hsl(188,100%,38%)]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-3">
                  Tecnología Avanzada
                </h3>
                <p className="text-gray-600">
                  Plataforma de videollamadas de alta calidad con funciones avanzadas
                </p>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para empezar a explorar?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a miles de usuarios que ya han encontrado su mentor ideal
            </p>
            <Button 
              onClick={() => window.location.href = "/login"}
              className="bg-white text-[hsl(188,100%,38%)] hover:bg-gray-100 px-8 py-3 text-lg font-bold"
            >
              Únete Ahora
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while user data is being fetched but navigation is ready
  if (isAuthenticated && (userLoading || !user)) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)]">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-4">{t('home.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          {/* Search Hosts */}
          <Link href="/hosts">
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift cursor-pointer group transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[hsl(188,100%,38%)] transition-colors">
                  <Users className="w-8 h-8 text-[hsl(188,100%,38%)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-[hsl(17,12%,6%)] mb-2">{t('home.searchHosts')}</h3>
                <p className="text-sm text-gray-600">{t('home.searchHostsDesc')}</p>
              </CardContent>
            </Card>
          </Link>



          {/* My Profile */}
          <Link href="/profile">
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift cursor-pointer group transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[hsl(340,82%,95%)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[hsl(340,82%,52%)] transition-colors">
                  <Settings className="w-8 h-8 text-[hsl(340,82%,52%)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-[hsl(17,12%,6%)] mb-2">{t('home.myProfile')}</h3>
                <p className="text-sm text-gray-600">{t('home.myProfileDesc')}</p>
              </CardContent>
            </Card>
          </Link>

          {/* My Dashboard */}
          <Link href="/dashboard">
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift cursor-pointer group transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[hsl(188,80%,95%)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[hsl(188,80%,42%)] transition-colors">
                  <Calendar className="w-8 h-8 text-[hsl(188,80%,42%)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-[hsl(17,12%,6%)] mb-2">{t('home.myDashboard')}</h3>
                <p className="text-sm text-gray-600">{t('home.myDashboardDesc')}</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Only show user-specific content if authenticated */}
        {isAuthenticated && user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information Card */}
            <div className="lg:col-span-1">
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift animate-fade-in-up">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center border-4 border-[hsl(188,100%,95%)]">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl.startsWith('http') ? user.profileImageUrl : `/storage/${user.profileImageUrl}`} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[hsl(17,12%,6%)]">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.email || 'Usuario'}
                  </h3>
                  {user?.title && (
                    <p className="text-gray-600">{user.title}</p>
                  )}
                  <div className="flex justify-center mt-3">
                    <Badge className="bg-[hsl(188,80%,95%)] text-[hsl(188,80%,42%)] hover:bg-[hsl(188,80%,90%)]">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t('home.verified')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  {user?.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-5 h-5 mr-3 text-[hsl(188,100%,38%)]" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  {user?.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-3 text-[hsl(188,100%,38%)]" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user?.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-3 text-[hsl(188,100%,38%)]" />
                      <span className="text-sm">{user.address}</span>
                    </div>
                  )}
                </div>

                {user && (
                  <Link href="/profile">
                    <Button className="w-full mt-6 bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)] glow-button relative overflow-hidden">
                      <Edit className="w-4 h-4 mr-2 relative z-10" />
                      <span className="relative z-10">{t('home.editProfile')}</span>
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content Management */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[hsl(17,12%,6%)]">{t('home.multimedia')}</h3>
                  <Link href="/profile">
                    <Button className="bg-[hsl(188,80%,42%)] text-white hover:bg-[hsl(188,80%,36%)] glow-button relative overflow-hidden">
                      <Plus className="w-4 h-4 mr-2 relative z-10" />
                      <span className="relative z-10">{t('home.add')}</span>
                    </Button>
                  </Link>
                </div>

                {mediaLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-300 rounded mb-3"></div>
                        <div className="aspect-video bg-gray-300 rounded mb-3"></div>
                        <div className="h-3 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : mediaContent.length > 0 ? (
                  <SortableMediaGrid
                    media={mediaContent}
                    showEdit={true}
                    onEdit={(c) => {
                      console.log('Edit handler called from home:', c);
                      setEditingContent(c);
                      setShowEditModal(true);
                    }}
                    onView={(c) => {
                      console.log('View handler called from home:', c);
                      setViewingContent(c);
                      setShowViewerModal(true);
                    }}
                    onAddNew={() => setLocation("/profile")}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{t('home.noContent')}</h4>
                    <p className="text-gray-600 mb-4">
                      {t('home.noContentSub')}
                    </p>
                    <Link href="/profile">
                      <Button className="bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)]">
                        {t('home.add')} {t('home.multimedia')}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </div>



      {/* Modals */}
      <MediaEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        content={editingContent}
      />
      
      <MediaViewerModal
        isOpen={showViewerModal}
        onClose={() => setShowViewerModal(false)}
        content={viewingContent}
        onEdit={(c) => {
          setEditingContent(c as MediaContent);
          setShowEditModal(true);
          setShowViewerModal(false);
        }}
        onDelete={() => {
          // Delete functionality handled by SortableMediaGrid
          setShowViewerModal(false);
        }}
        onReplace={(c) => {
          setReplacingContent(c);
          setShowUploadModal(true);
          setShowViewerModal(false);
        }}
      />
      
      <MediaUploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setReplacingContent(null);
        }}
        replaceContent={replacingContent}
      />
    </div>
  );
}

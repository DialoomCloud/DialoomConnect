import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaEmbed } from "@/components/media-embed";
import { MediaViewerModal } from "@/components/media-viewer-modal";
import { BookingFlow } from "@/components/booking-flow";
import { DateTimeSelector } from "@/components/date-time-selector";
import { PaymentMethods } from "@/components/payment-methods";
import { StripeConnectCheckout } from "@/components/stripe-connect-checkout";
import { User as UserIcon, Phone, MapPin, Mail, CheckCircle, Calendar, DollarSign, Clock, Monitor, Languages, Video, FileText, Star, Instagram, Twitter, Linkedin, Globe, Eye } from "lucide-react";
import type { User, MediaContent, HostAvailability, HostPricing } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";

export default function UserProfile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const params = useParams();
  const userId = params.id;
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [viewingContent, setViewingContent] = useState<MediaContent | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<{ duration: number; price: string } | null>(null);
  const [showDateTimeSelector, setShowDateTimeSelector] = useState(false);
  const [selectedBookingDate, setSelectedBookingDate] = useState<Date | null>(null);
  const [selectedBookingTime, setSelectedBookingTime] = useState<string | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Fetch user profile
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  // Fetch user's media content
  const { data: mediaContent = [], isLoading: mediaLoading } = useQuery<MediaContent[]>({
    queryKey: [`/api/users/${userId}/media`],
    enabled: !!userId,
  });

  // Fetch host availability
  const { data: availability } = useQuery<HostAvailability[]>({
    queryKey: [`/api/users/${userId}/availability`],
    enabled: !!userId,
  });

  // Fetch pricing options
  const { data: pricing } = useQuery<HostPricing[]>({
    queryKey: [`/api/users/${userId}/pricing`],
    enabled: !!userId,
  });
  
  // Fetch service prices from public endpoint
  const { data: servicePrices } = useQuery({
    queryKey: ["/api/config/service-prices"],
  });

  // Fetch host available services
  const { data: hostServices } = useQuery<any>({
    queryKey: [`/api/host/${userId}/services`],
    enabled: !!userId,
  });

  // Fetch user social profiles
  const { data: socialProfiles = [] } = useQuery<any[]>({
    queryKey: [`/api/user/social-profiles/${userId}`],
    enabled: !!userId,
  });

  if (userError) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('profile.notFound')}</h1>
          <p className="text-gray-600">{t('profile.notFoundDesc')}</p>
        </div>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getDayName = (day: number) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return t(`availability.${days[day]}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(220,9%,98%)] to-[hsl(220,20%,95%)]">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-[hsl(220,13%,90%)] p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Profile Photo & Basic Info */}
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center lg:items-start lg:flex-row lg:space-x-6">
                {/* Profile Photo */}
                <div className="relative mb-4 lg:mb-0 flex-shrink-0">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl.startsWith('/storage/') ? user.profileImageUrl : `/storage/${user.profileImageUrl}`}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-[hsl(188,100%,38%)] shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] flex items-center justify-center shadow-lg">
                      <UserIcon className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                    </div>
                  )}
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="text-center lg:text-left flex-grow">
                  <h1 className="text-xl lg:text-2xl font-bold text-[hsl(17,12%,6%)] mb-1">
                    {user.firstName} {user.lastName}
                  </h1>
                  {user.title && (
                    <p className="text-lg text-[hsl(188,100%,38%)] font-semibold mb-2">{user.title}</p>
                  )}
                  
                  {/* Rating Stars */}
                  <div className="flex items-center justify-center lg:justify-start mb-3">
                    <div className="flex items-center mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className="w-4 h-4 text-yellow-500 fill-yellow-500" 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">5.0</span>
                    <span className="text-sm text-[hsl(17,12%,60%)] ml-1">(12 reseñas)</span>
                  </div>

                  {/* Languages */}
                  <div className="mb-3">
                    <div className="flex items-center justify-center lg:justify-start mb-2">
                      <Languages className="w-4 h-4 mr-2 text-[hsl(188,100%,38%)]" />
                      <span className="text-sm font-medium text-[hsl(17,12%,20%)]">Idiomas</span>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center lg:justify-start">
                      <Badge variant="secondary" className="text-xs">Español</Badge>
                      <Badge variant="secondary" className="text-xs">Catalán</Badge>
                      <Badge variant="secondary" className="text-xs">Inglés</Badge>
                    </div>
                  </div>

                  {/* Availability Status with Color Indicator */}
                  <div className="flex justify-center lg:justify-start mb-3">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="font-medium">Disponibilidad:</span>
                      <span className="ml-1 font-bold">Alta</span>
                    </div>
                  </div>

                  {/* Topics during videocall */}
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-[hsl(17,12%,6%)] mb-2">Temas durante videollamada</h4>
                    <div className="flex flex-wrap gap-1 justify-center lg:justify-start">
                      <Badge className="bg-[hsl(188,100%,45%)] text-white hover:bg-[hsl(188,100%,40%)] text-xs">Marketing</Badge>
                      <Badge className="bg-[hsl(188,100%,45%)] text-white hover:bg-[hsl(188,100%,40%)] text-xs">Growth</Badge>
                      <Badge className="bg-[hsl(188,100%,45%)] text-white hover:bg-[hsl(188,100%,40%)] text-xs">Analytics</Badge>
                      <Badge className="bg-[hsl(188,100%,45%)] text-white hover:bg-[hsl(188,100%,40%)] text-xs">Ads</Badge>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] rounded-lg p-3 text-white text-center">
                      <div className="text-lg font-bold">150+</div>
                      <div className="text-xs opacity-90">Sesiones</div>
                    </div>
                    <div className="bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] rounded-lg p-3 text-white text-center">
                      <div className="text-lg font-bold">98%</div>
                      <div className="text-xs opacity-90">Satisfacción</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Description */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {/* Professional Description with More Button */}
                <div>
                  <h2 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-4">Descripción</h2>
                  <div className="bg-[hsl(220,9%,98%)] rounded-lg p-4 border border-[hsl(220,13%,90%)]">
                    <p className="text-[hsl(17,12%,20%)] leading-relaxed text-sm">
                      {user.description ? (
                        <>
                          {user.description.length > 150 ? (
                            <>
                              <span>{user.description.substring(0, 150)}...</span>
                              <button 
                                className="ml-2 text-[hsl(188,100%,38%)] hover:text-[hsl(188,100%,32%)] font-medium text-sm"
                                onClick={() => setShowFullDescription(!showFullDescription)}
                              >
                                {showFullDescription ? 'menos' : 'more'}
                              </button>
                              {showFullDescription && (
                                <div className="mt-2 p-3 bg-white rounded border border-[hsl(220,13%,90%)]">
                                  <p className="text-[hsl(17,12%,20%)] leading-relaxed text-sm">
                                    {user.description}
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            user.description
                          )}
                        </>
                      ) : (
                        "Información no disponible"
                      )}
                    </p>
                  </div>
                </div>

                {/* Social Links */}
                {socialProfiles && Array.isArray(socialProfiles) && socialProfiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-3">Redes Sociales</h3>
                    <div className="flex gap-3">
                      {socialProfiles.map((profile: any) => {
                        if (!profile?.platform?.baseUrl || !profile?.username) {
                          return null;
                        }

                        const getIcon = (platformName: string) => {
                          switch (platformName?.toLowerCase()) {
                            case 'instagram': return <Instagram className="w-5 h-5" />;
                            case 'twitter': return <Twitter className="w-5 h-5" />;
                            case 'linkedin': return <Linkedin className="w-5 h-5" />;
                            default: return <Globe className="w-5 h-5" />;
                          }
                        };

                        const platformUrl = profile.platform.baseUrl + profile.username;

                        return (
                          <a
                            key={profile.id}
                            href={platformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)] transition-colors"
                            title={`${profile.platform.name || 'Social'}: ${profile.username}`}
                          >
                            {getIcon(profile.platform.name || '')}
                          </a>
                        );
                      }).filter(Boolean)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Multimedia Section */}
        {mediaContent && mediaContent.length > 0 && (
          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[hsl(188,100%,38%)]" />
                Multimedia
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaContent.slice(0, 6).map((media) => (
                  <div key={media.id} className="group relative overflow-hidden rounded-lg bg-gray-100 hover:shadow-lg transition-all duration-300">
                    <MediaEmbed 
                      content={media}
                      showEdit={false}
                    />
                  </div>
                ))}
              </div>
              {mediaContent.length > 6 && (
                <div className="mt-4 text-center">
                  <button className="text-[hsl(188,100%,38%)] hover:text-[hsl(188,100%,32%)] text-sm font-medium">
                    Ver más contenido ({mediaContent.length - 6} elementos)
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pricing & Schedule Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Pricing Section */}
          <Card className="bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">TARIFAS</h2>
              
              {/* Pricing Options - Ordenadas por duración */}
              {pricing && pricing.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {pricing
                    .filter(p => p?.isActive !== false)
                    .sort((a, b) => {
                      // Ordenar por duración: 0 (gratis) primero, luego por duración ascendente
                      if (a.duration === 0 || !a.duration) return -1;
                      if (b.duration === 0 || !b.duration) return 1;
                      return (a.duration || 0) - (b.duration || 0);
                    })
                    .map((price) => (
                    <div 
                      key={price.id}
                      className="bg-white/20 rounded-lg p-3 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                      onClick={() => setSelectedPricing({ duration: price.duration || 0, price: String(price.price || '0') })}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="font-medium">
                            {(price.duration === 0 || !price.duration) ? 'Gratis' : `${price.duration} min`}
                          </span>
                        </div>
                        <div className="text-lg font-bold">
                          {(price.duration === 0 || !price.duration) ? 'Gratis' : `€${price.price || '0'}`}
                        </div>
                      </div>
                      
                      {/* Service Icons */}
                      <div className="flex gap-2 mt-2">
                        {price.includesScreenSharing && (
                          <div className="w-6 h-6 bg-white/30 rounded flex items-center justify-center" title="Compartir pantalla">
                            <Monitor className="w-3 h-3" />
                          </div>
                        )}
                        {price.includesRecording && (
                          <div className="w-6 h-6 bg-white/30 rounded flex items-center justify-center" title="Grabación">
                            <Video className="w-3 h-3" />
                          </div>
                        )}
                        {price.includesTranslation && (
                          <div className="w-6 h-6 bg-white/30 rounded flex items-center justify-center" title="Traducción">
                            <Languages className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/20 rounded-lg p-4 mb-6">
                  <p className="text-white/80 text-sm">No hay precios configurados</p>
                </div>
              )}

              {/* Book Call Button */}
              <Button 
                className="w-full bg-white text-[hsl(188,100%,38%)] hover:bg-gray-100 font-bold py-3"
                onClick={() => setShowBookingFlow(true)}
              >
                Reservar Llamada
              </Button>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card className="lg:col-span-2 bg-white border-[hsl(220,13%,90%)] shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[hsl(188,100%,38%)]" />
                Horarios Disponibles - {format(new Date(), 'MMMM yyyy', { locale: es })}
              </h3>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                {/* Calendar days */}
                {Array.from({ length: 35 }, (_, i) => (
                  <div 
                    key={i} 
                    className="aspect-square flex items-center justify-center text-sm hover:bg-[hsl(188,100%,95%)] rounded cursor-pointer"
                  >
                    {i % 7 === 0 || i % 7 === 6 ? '' : Math.floor(i / 7) + 1}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <h4 className="font-medium text-[hsl(17,12%,20%)]">Hoy disponible:</h4>
                <div className="grid grid-cols-4 gap-2">
                  {['09:00', '10:30', '14:00', '16:30'].map((time) => (
                    <button
                      key={time}
                      className="py-2 px-3 text-xs rounded-lg border border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,38%)] hover:text-white transition-colors"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4 border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,38%)] hover:text-white"
              >
                Ver Más Horarios
              </Button>
            </CardContent>
          </Card>

          {/* Payment Gateway */}
          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-4">Pasarela de Pago</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-[hsl(188,100%,38%)]" />
                </div>
                <p className="text-[hsl(17,12%,40%)] mb-4">
                  Proceso de pago seguro y rápido
                </p>
                <Button 
                  variant="outline" 
                  className="border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)]"
                >
                  Configurar Pago
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Multimedia Section */}
        <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-6 flex items-center">
              <Video className="w-5 h-5 mr-2 text-[hsl(188,100%,38%)]" />
              Multimedia
            </h3>
            
            {mediaLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                    <div className="aspect-video bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : mediaContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mediaContent.slice(0, 6).map((content: MediaContent) => (
                  <div key={content.id} className="cursor-pointer group" onClick={() => {
                    setViewingContent(content);
                    setShowViewerModal(true);
                  }}>
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video mb-3 group-hover:shadow-lg transition-shadow">
                      <MediaEmbed 
                        content={content} 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h4 className="font-medium text-[hsl(17,12%,20%)] mb-1 group-hover:text-[hsl(188,100%,38%)] transition-colors">
                      {content.title}
                    </h4>
                    <p className="text-sm text-[hsl(17,12%,40%)] line-clamp-2">
                      {content.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-[hsl(188,100%,38%)] mx-auto mb-4" />
                <p className="text-[hsl(17,12%,40%)]">No hay contenido multimedia disponible</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showViewerModal && viewingContent && (
        <MediaViewerModal
          content={viewingContent}
          isOpen={showViewerModal}
          onClose={() => setShowViewerModal(false)}
        />
      )}

      {showBookingFlow && (
        <BookingFlow
          host={user}
          isOpen={showBookingFlow}
          onClose={() => setShowBookingFlow(false)}
          hostServices={hostServices || {}}
        />
      )}
    </div>
  );
}
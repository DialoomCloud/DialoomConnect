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
  const { data: hostServices } = useQuery({
    queryKey: [`/api/host/${userId}/services`],
    enabled: !!userId,
  });

  // Fetch user social profiles
  const { data: socialProfiles } = useQuery({
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1">
              {/* Profile Image */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl.startsWith('/storage/') ? user.profileImageUrl : `/storage/${user.profileImageUrl}`}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[hsl(188,100%,38%)] shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] flex items-center justify-center shadow-lg">
                      <UserIcon className="w-16 h-16 text-white" />
                    </div>
                  )}
                  {user.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="text-center space-y-3">
                <h1 className="text-2xl font-bold text-[hsl(17,12%,6%)]">
                  {user.firstName} {user.lastName}
                </h1>
                {user.title && (
                  <p className="text-lg text-[hsl(188,100%,38%)] font-semibold">{user.title}</p>
                )}
                <div className="flex items-center justify-center text-[hsl(17,12%,40%)]">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span className="text-sm">5.0 (10 reseñas)</span>
                </div>
                
                {/* Contact Info */}
                <div className="space-y-2 pt-4">
                  {user.phone && (
                    <div className="flex items-center text-sm text-[hsl(17,12%,40%)]">
                      <Phone className="w-4 h-4 mr-2 text-[hsl(188,100%,38%)]" />
                      {user.phone}
                    </div>
                  )}
                  {user.email && (
                    <div className="flex items-center text-sm text-[hsl(17,12%,40%)]">
                      <Mail className="w-4 h-4 mr-2 text-[hsl(188,100%,38%)]" />
                      {user.email}
                    </div>
                  )}
                  {(user.city || user.countryCode) && (
                    <div className="flex items-center text-sm text-[hsl(17,12%,40%)]">
                      <MapPin className="w-4 h-4 mr-2 text-[hsl(188,100%,38%)]" />
                      {user.city}{user.city && user.countryCode && ', '}{user.countryCode}
                    </div>
                  )}
                </div>

                {/* Languages */}
                <div className="pt-4">
                  <div className="flex items-center justify-center mb-2">
                    <Languages className="w-4 h-4 mr-2 text-[hsl(188,100%,38%)]" />
                    <span className="text-sm font-medium text-[hsl(17,12%,20%)]">Idiomas</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <Badge variant="secondary" className="text-xs">Español</Badge>
                    <Badge variant="secondary" className="text-xs">Catalán</Badge>
                    <Badge variant="secondary" className="text-xs">Inglés</Badge>
                  </div>
                </div>

                {/* Availability Status */}
                <div className="pt-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Disponible ahora
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Description */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-4">Descripción</h2>
                  <div className="bg-[hsl(220,9%,98%)] p-4 rounded-lg border border-[hsl(220,13%,90%)]">
                    {user.description ? (
                      <p className="text-[hsl(17,12%,40%)] leading-relaxed text-sm">
                        {user.description}
                      </p>
                    ) : (
                      <p className="text-[hsl(17,12%,60%)] italic text-sm">
                        {t('profile.noDescription')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {socialProfiles && socialProfiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-3">Redes Sociales</h3>
                    <div className="flex gap-3">
                      {socialProfiles.map((profile: any) => {
                        const getIcon = (platformName: string) => {
                          switch (platformName.toLowerCase()) {
                            case 'instagram': return <Instagram className="w-5 h-5" />;
                            case 'twitter': return <Twitter className="w-5 h-5" />;
                            case 'linkedin': return <Linkedin className="w-5 h-5" />;
                            default: return <Globe className="w-5 h-5" />;
                          }
                        };

                        return (
                          <a
                            key={profile.id}
                            href={profile.platform.baseUrl + profile.username}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)] transition-colors"
                          >
                            {getIcon(profile.platform.name)}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Pricing & Booking */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] rounded-xl p-6 text-white">
                <h2 className="text-xl font-bold mb-4">Precios Dinámicos</h2>
                
                {/* Pricing Options */}
                {pricing && pricing.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {pricing.filter(p => p.isActive).map((price) => (
                      <div 
                        key={price.id}
                        className="bg-white/20 rounded-lg p-3 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                        onClick={() => setSelectedPricing({ duration: price.duration, price: price.price })}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="font-medium">
                              {price.duration === 0 ? 'Gratis' : `${price.duration} min`}
                            </span>
                          </div>
                          <div className="text-lg font-bold">
                            {price.duration === 0 ? 'Gratis' : `€${price.price}`}
                          </div>
                        </div>
                        
                        {/* Service Icons */}
                        <div className="flex gap-2 mt-2">
                          {price.includesScreenSharing && (
                            <div className="w-6 h-6 bg-white/30 rounded flex items-center justify-center">
                              <Monitor className="w-3 h-3" />
                            </div>
                          )}
                          {price.includesRecording && (
                            <div className="w-6 h-6 bg-white/30 rounded flex items-center justify-center">
                              <Video className="w-3 h-3" />
                            </div>
                          )}
                          {price.includesTranslation && (
                            <div className="w-6 h-6 bg-white/30 rounded flex items-center justify-center">
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

                {/* Duration Selector */}
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium">Duración de la sesión:</label>
                  <div className="flex gap-2">
                    {['5min', '30min', '60min'].map((duration) => (
                      <button
                        key={duration}
                        className="flex-1 py-2 px-3 text-sm rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Book Call Button */}
                <Button 
                  className="w-full bg-white text-[hsl(188,100%,38%)] hover:bg-gray-100 font-bold py-3"
                  onClick={() => setShowBookingFlow(true)}
                >
                  Reservar Llamada
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Schedule */}
          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[hsl(188,100%,38%)]" />
                Horarios Disponibles
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
          hostServices={hostServices}
        />
      )}
    </div>
  );
}
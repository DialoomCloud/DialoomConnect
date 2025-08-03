import { useEffect } from "react";
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
import { User as UserIcon, Phone, MapPin, Mail, CheckCircle, Calendar, DollarSign, Clock, Monitor, Languages, Video, FileText, Star, Instagram, Twitter, Linkedin, Globe } from "lucide-react";
import type { User, MediaContent, HostAvailability, HostPricing } from "@shared/schema";
import { useState } from "react";
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
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Image */}
              <div className="relative">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl.startsWith('http') || user.profileImageUrl.startsWith('/') ? user.profileImageUrl : `/storage/${user.profileImageUrl}`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-64 h-64 rounded-full object-cover border-4 border-[hsl(188,100%,38%)]"
                  />
                ) : (
                  <div className="w-64 h-64 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center">
                    <UserIcon className="w-32 h-32 text-[hsl(188,100%,38%)]" />
                  </div>
                )}
                {user.isVerified && (
                  <Badge className="absolute -bottom-2 right-2 bg-[hsl(188,80%,42%)] text-white">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {t('home.verified')}
                  </Badge>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-2">
                      {user.firstName} {user.lastName}
                    </h1>
                    {user.title && (
                      <p className="text-xl text-gray-600 mb-2">{user.title}</p>
                    )}
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">5.0</span>
                      <span className="text-gray-500">(12 reseñas)</span>
                    </div>
                  </div>

                  {/* Social Media Icons */}
                  <div className="flex gap-3">
                    {socialProfiles?.find((p: any) => p.platformId === 1) && (
                      <a 
                        href={socialProfiles.find((p: any) => p.platformId === 1)?.url || `https://instagram.com/${socialProfiles.find((p: any) => p.platformId === 1)?.username}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Instagram className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                    {socialProfiles?.find((p: any) => p.platformId === 2) && (
                      <a 
                        href={socialProfiles.find((p: any) => p.platformId === 2)?.url || `https://linkedin.com/in/${socialProfiles.find((p: any) => p.platformId === 2)?.username}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Linkedin className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                    {socialProfiles?.find((p: any) => p.platformId === 3) && (
                      <a 
                        href={socialProfiles.find((p: any) => p.platformId === 3)?.url || `https://twitter.com/${socialProfiles.find((p: any) => p.platformId === 3)?.username}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Twitter className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                    {socialProfiles?.find((p: any) => p.platformId === 4) && (
                      <a 
                        href={socialProfiles.find((p: any) => p.platformId === 4)?.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Globe className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                  </div>
                </div>

                {user.description && (
                  <p className="text-gray-700 mb-4">{user.description}</p>
                )}

                <div className="flex flex-wrap gap-4">
                  {user.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-5 h-5 mr-2 text-[hsl(188,100%,38%)]" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user.city && user.countryCode && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2 text-[hsl(188,100%,38%)]" />
                      <span>{user.city}, {user.countryCode}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-2 text-[hsl(188,100%,38%)]" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Availability & Pricing */}
          <div className="lg:col-span-1">
            {/* Pricing Card */}
            {pricing && pricing.length > 0 && (
              <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg mb-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-[hsl(188,80%,42%)]" />
                    {t('pricing.pricing')}
                  </h3>
                  <div className="space-y-3">
                    {pricing.filter(p => p.isActive).map((option) => (
                      <div key={option.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">
                          {option.duration === 0 ? t('pricing.freeSession') : `${option.duration} ${t('pricing.minutes')}`}
                        </span>
                        <span className="text-[hsl(188,80%,42%)] font-bold">
                          {option.price === "0.00" ? t('pricing.free') : `€${option.price}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Service Options - Available for selection */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-3">{t('userProfile.additionalServices')}:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-[hsl(188,100%,38%)]" />
                          <span>{t('userProfile.screenSharing')}</span>
                        </div>
                        <span className="font-medium text-[hsl(188,80%,42%)]">+€{(servicePrices as any)?.screenSharing || 10}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Languages className="w-4 h-4 text-[hsl(188,100%,38%)]" />
                          <span>{t('userProfile.simultaneousTranslation')}</span>
                        </div>
                        <span className="font-medium text-[hsl(188,80%,42%)]">+€{(servicePrices as any)?.translation || 25}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-[hsl(188,100%,38%)]" />
                          <span>{t('userProfile.recording')}</span>
                        </div>
                        <span className="font-medium text-[hsl(188,80%,42%)]">+€{(servicePrices as any)?.recording || 10}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[hsl(188,100%,38%)]" />
                          <span>{t('userProfile.transcription')}</span>
                        </div>
                        <span className="font-medium text-[hsl(188,80%,42%)]">+€{(servicePrices as any)?.transcription || 5}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)]"
                    onClick={() => setShowBookingFlow(true)}
                  >
                    {t('userProfile.bookCall')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Availability Card */}
            {availability && availability.length > 0 && (
              <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-[hsl(188,100%,38%)]" />
                    {t('availability.weeklySchedule')}
                  </h3>
                  <div className="space-y-2">
                    {availability.map((slot) => (
                      <div key={slot.id} className="text-sm">
                        <div className="font-medium text-gray-700">{slot.dayOfWeek !== null ? getDayName(slot.dayOfWeek) : format(new Date(slot.date!), "PPP", { locale: es })}</div>
                        <div className="text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Media Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-6">{t('home.multimedia')}</h3>
                
                {mediaLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                        <div className="aspect-video bg-gray-300 rounded mb-3"></div>
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : mediaContent.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mediaContent.map((content: MediaContent) => (
                      <div key={content.id} className="cursor-pointer" onClick={() => {
                        setViewingContent(content);
                        setShowViewerModal(true);
                      }}>
                        <MediaEmbed 
                          content={content} 
                          showEdit={false}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">{t('profile.noMedia')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Media Viewer Modal */}
      <MediaViewerModal
        isOpen={showViewerModal}
        onClose={() => setShowViewerModal(false)}
        content={viewingContent}
      />

      {/* Booking Flow Modal */}
      <BookingFlow
        isOpen={showBookingFlow}
        onClose={() => setShowBookingFlow(false)}
        host={{
          ...user,
          pricing: pricing,
          socialMedia: {
            instagram: socialProfiles?.find((p: any) => p.platformId === 1)?.username,
            linkedin: socialProfiles?.find((p: any) => p.platformId === 2)?.username,
            twitter: socialProfiles?.find((p: any) => p.platformId === 3)?.username,
            website: socialProfiles?.find((p: any) => p.platformId === 4)?.url
          },
          rating: 5.0,
          reviewCount: 12,
        }}
        hostServices={hostServices || {}}
      />
    </div>
  );
}
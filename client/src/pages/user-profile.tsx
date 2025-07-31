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
import { User as UserIcon, Phone, MapPin, Mail, CheckCircle, Calendar, DollarSign, Clock, Monitor, Languages, Video, FileText } from "lucide-react";
import type { User, MediaContent, HostAvailability, HostPricing } from "@shared/schema";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function UserProfile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const params = useParams();
  const userId = params.id;
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [viewingContent, setViewingContent] = useState<MediaContent | null>(null);

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
                    className="w-32 h-32 rounded-full object-cover border-4 border-[hsl(244,91%,68%)]"
                  />
                ) : (
                  <div className="w-32 h-32 bg-[hsl(244,91%,95%)] rounded-full flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-[hsl(244,91%,68%)]" />
                  </div>
                )}
                {user.isVerified && (
                  <Badge className="absolute -bottom-2 right-2 bg-[hsl(159,61%,50%)] text-white">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {t('home.verified')}
                  </Badge>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                {user.title && (
                  <p className="text-xl text-gray-600 mb-4">{user.title}</p>
                )}
                {user.description && (
                  <p className="text-gray-700 mb-4">{user.description}</p>
                )}

                <div className="flex flex-wrap gap-4">
                  {user.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-5 h-5 mr-2 text-[hsl(244,91%,68%)]" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user.city && user.countryCode && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2 text-[hsl(244,91%,68%)]" />
                      <span>{user.city}, {user.countryCode}</span>
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
                    <DollarSign className="w-5 h-5 mr-2 text-[hsl(159,61%,50%)]" />
                    {t('availability.pricing')}
                  </h3>
                  <div className="space-y-3">
                    {pricing.filter(p => p.isActive).map((option) => (
                      <div key={option.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">
                          {option.duration === 0 ? t('availability.freeSession') : `${option.duration} ${t('availability.minutes')}`}
                        </span>
                        <span className="text-[hsl(159,61%,50%)] font-bold">
                          {option.price === "0.00" ? t('availability.free') : `€${option.price}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Service Options */}
                  {pricing.some(p => p.includesScreenSharing || p.includesTranslation || p.includesRecording || p.includesTranscription) && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-600 mb-3">Servicios Incluidos:</p>
                      <div className="space-y-2">
                        {pricing.some(p => p.includesScreenSharing) && (
                          <div className="flex items-center gap-2 text-sm">
                            <Monitor className="w-4 h-4 text-[hsl(244,91%,68%)]" />
                            <span>Compartir Pantalla</span>
                          </div>
                        )}
                        {pricing.some(p => p.includesTranslation) && (
                          <div className="flex items-center gap-2 text-sm">
                            <Languages className="w-4 h-4 text-[hsl(244,91%,68%)]" />
                            <span>Traducción Simultánea</span>
                          </div>
                        )}
                        {pricing.some(p => p.includesRecording) && (
                          <div className="flex items-center gap-2 text-sm">
                            <Video className="w-4 h-4 text-[hsl(244,91%,68%)]" />
                            <span>Grabación de Sesión</span>
                          </div>
                        )}
                        {pricing.some(p => p.includesTranscription) && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-[hsl(244,91%,68%)]" />
                            <span>Transcripción Automática</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button className="w-full mt-4 bg-[hsl(244,91%,68%)] text-white hover:bg-[hsl(244,91%,60%)]" disabled>
                    {t('home.comingSoon')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Availability Card */}
            {availability && availability.length > 0 && (
              <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-[hsl(244,91%,68%)]" />
                    {t('availability.weeklySchedule')}
                  </h3>
                  <div className="space-y-2">
                    {availability.map((slot) => (
                      <div key={slot.id} className="text-sm">
                        <div className="font-medium text-gray-700">{slot.dayOfWeek !== null ? getDayName(slot.dayOfWeek) : format(new Date(slot.date!), "d 'de' MMMM", { locale: es })}</div>
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
    </div>
  );
}
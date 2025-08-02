import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Star, 
  TrendingUp,
  CalendarCheck,
  CalendarX,
  MessageSquare,
  Download,
  FileText,
  Settings,
  Upload,
  Video,
  Video as VideoIcon,
  Image,
  Trash2,
  Edit,
  Save,
  Globe,
  Phone,
  Mail,
  MapPin,
  Plus,
  CheckCircle2,
  CreditCard,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Import additional types and utilities
import type { Booking, Invoice, MediaContent, User, HostPricing } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { StripeConnectOnboarding } from "@/components/stripe-connect-onboarding";
import { SessionRatingModal } from "@/components/session-rating-modal";
import { HostVerificationForm } from "@/components/host-verification-form";

// Profile Management Component
function ProfileManagement({ userId }: { userId?: string }) {
  const { t } = useTranslation();
  const { data: userProfile, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple profile display for admin view */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.profileInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          {userProfile ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.name')}</p>
                <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.email')}</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.phone')}</p>
                <p className="font-medium">{userProfile.phone || t('dashboard.notConfigured')}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Visualización de administrador - datos limitados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Content Management Component
function ContentManagement({ userId }: { userId?: string }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  const { data: mediaContent = [], isLoading } = useQuery<MediaContent[]>({
    queryKey: ['/api/media'],
    enabled: !!userId,
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      return apiRequest('DELETE', `/api/media/${mediaId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('dashboard.myContent')}</h3>
        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.addContent')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaContent.map((content) => (
          <Card key={content.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {content.mediaType === 'youtube' && (
                <div className="flex items-center justify-center h-full">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {content.mediaType === 'image' && (
                <img 
                  src={content.mediaUrl} 
                  alt={content.title} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <CardContent className="p-4">
              <h4 className="font-medium truncate">{content.title}</h4>
              <p className="text-sm text-gray-500 mt-1">
                {format(new Date(content.createdAt), "d MMM yyyy", { locale: es })}
              </p>
              <div className="mt-3 flex gap-2">
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => deleteMediaMutation.mutate(content.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('dashboard.addContent')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">{t('dashboard.uploadDisabled')}</p>
              <Button 
                className="mt-4"
                onClick={() => setShowUploadModal(false)}
              >
                {t('dashboard.close')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Availability Management Component
function AvailabilityManagement({ userId }: { userId?: string }) {
  const { t } = useTranslation();
  const { data: pricing, isLoading: pricingLoading } = useQuery<HostPricing>({
    queryKey: [`/api/users/${userId}/pricing`],
    enabled: !!userId,
  });

  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: [`/api/users/${userId}/availability`],
    enabled: !!userId,
  });

  if (pricingLoading || availabilityLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pricing">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pricing">{t('common.pricing')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('dashboard.availability')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pricing" className="mt-6">
          {/* Simplified pricing display for admin view */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.pricingConfig')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">{t('dashboard.pricingDisabled')}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-6">
          {/* Simplified availability display for admin view */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.availabilitySchedule')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">{t('dashboard.scheduleDisabled')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Invoices tab component
function InvoicesTab({ userId }: { userId?: string }) {
  const { t } = useTranslation();
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
    enabled: !!userId,
  });

  const downloadInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      return apiRequest('GET', `/api/invoices/${invoiceId}/download`);
    },
    onSuccess: (data) => {
      // For now, just show the data. Later we'll handle PDF download
      console.log('Invoice data:', data);
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-gray-500 mt-2">{t('common.loading')}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>{t('dashboard.noInvoices')}</p>
          <p className="text-sm">{t('dashboard.invoicesGenerated')}</p>
        </div>
      ) : (
        invoices.map((invoice) => (
          <div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{t('dashboard.invoice')} #{invoice.invoiceNumber}</span>
                  <Badge variant="outline" className="text-xs">
                    {invoice.isDownloaded ? t('dashboard.downloaded') : t('dashboard.pending')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {t('dashboard.date')}: {format(new Date(invoice.issueDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
                {invoice.downloadCount > 0 && (
                  <p className="text-xs text-gray-500">
                    {t('dashboard.downloadedCount', { count: invoice.downloadCount })}
                  </p>
                )}
              </div>
              <div className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadInvoiceMutation.mutate(invoice.id)}
                  disabled={downloadInvoiceMutation.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloadInvoiceMutation.isPending ? t('dashboard.downloading') : t('dashboard.download')}
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const { adminUser, isLoading: adminLoading } = useAdminAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [ratingModalData, setRatingModalData] = useState<{ isOpen: boolean; bookingId: string; hostName: string } | null>(null);
  
  // Check if user is accessing as admin
  const isAdmin = !!adminUser && !user;
  const currentUser = user || (isAdmin ? { id: 'admin-view', name: 'Admin View', isAdmin: true } : null);

  // Fetch bookings - disabled for admin view
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user && !isAdmin,
  });

  // Calculate statistics
  const stats = {
    totalEarnings: isAdmin ? 0 : bookings
      .filter(b => b.status === "completed" && b.hostId === user?.id)
      .reduce((sum, b) => sum + parseFloat(b.price), 0),
    upcomingCalls: isAdmin ? 0 : bookings
      .filter(b => b.status === "confirmed" && new Date(b.scheduledDate) >= new Date())
      .length,
    completedCalls: isAdmin ? 0 : bookings.filter(b => b.status === "completed").length,
    averageRating: 4.8, // This would come from reviews
  };

  const upcomingBookings = isAdmin ? [] : bookings.filter(
    b => b.status === "confirmed" && new Date(b.scheduledDate) >= new Date()
  );

  const pastBookings = isAdmin ? [] : bookings.filter(
    b => b.status === "completed" || new Date(b.scheduledDate) < new Date()
  );

  if ((authLoading || adminLoading) || (!isAdmin && bookingsLoading)) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(188,100%,38%)]"></div>
      </div>
    );
  }
  
  // Show message if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('dashboard.accessRestricted')}</h2>
          <p className="text-gray-600 mb-6">{t('dashboard.mustLogin')}</p>
          <Button onClick={() => window.location.href = '/api/login'}>
            {t('auth.login')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin notice */}
        {isAdmin && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">
                <strong>{t('dashboard.adminMode')}:</strong> {t('dashboard.adminModeNotice')}
              </p>
            </div>
          </div>
        )}
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-4">{t('dashboard.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[hsl(188,80%,95%)] rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[hsl(188,80%,42%)]" />
                </div>
                <TrendingUp className="w-4 h-4 text-[hsl(188,80%,42%)]" />
              </div>
              <h3 className="text-2xl font-bold text-[hsl(17,12%,6%)]">€{stats.totalEarnings.toFixed(2)}</h3>
              <p className="text-sm text-gray-600">{t('dashboard.totalIncome')}</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6 text-[hsl(188,100%,38%)]" />
                </div>
                <span className="text-sm font-medium text-[hsl(188,100%,38%)]">+2</span>
              </div>
              <h3 className="text-2xl font-bold text-[hsl(17,12%,6%)]">{stats.upcomingCalls}</h3>
              <p className="text-sm text-gray-600">{t('dashboard.upcomingCalls')}</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[hsl(340,82%,95%)] rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-[hsl(340,82%,52%)]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[hsl(17,12%,6%)]">{stats.completedCalls}</h3>
              <p className="text-sm text-gray-600">{t('dashboard.completedCalls')}</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[hsl(48,96%,95%)] rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-[hsl(48,96%,53%)]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[hsl(17,12%,6%)]">{stats.averageRating}</h3>
              <p className="text-sm text-gray-600">{t('dashboard.averageRating')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel Access */}
        {user?.isAdmin && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">{t('admin.panelTitle')}</h3>
                    <p className="text-sm text-blue-700">{t('admin.panelDescription')}</p>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = '/admin-panel'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {t('admin.openPanel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Host Management Dashboard */}
        <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
          <CardHeader>
            <CardTitle>{t('dashboard.hostControlCenter')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-2">
                <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
                <TabsTrigger value="calls">{t('dashboard.calls')}</TabsTrigger>
                <TabsTrigger value="invoices">{t('dashboard.billing')}</TabsTrigger>
                <TabsTrigger value="profile">{t('dashboard.myProfile')}</TabsTrigger>
                <TabsTrigger value="content">{t('dashboard.content')}</TabsTrigger>
                <TabsTrigger value="availability">{t('dashboard.availability')}</TabsTrigger>
                <TabsTrigger value="stripe-connect">
                  <CreditCard className="w-4 h-4 mr-1" />
                  Stripe
                </TabsTrigger>
                <TabsTrigger value="verification">
                  <Shield className="w-4 h-4 mr-1" />
                  {t('dashboard.verification')}
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-700 font-medium">{t('dashboard.monthlyIncome')}</p>
                            <p className="text-2xl font-bold text-green-900">€245.00</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-700 font-medium">{t('dashboard.upcomingCalls')}</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.upcomingCalls}</p>
                          </div>
                          <CalendarCheck className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-700 font-medium">{t('dashboard.completed')}</p>
                            <p className="text-2xl font-bold text-purple-900">{stats.completedCalls}</p>
                          </div>
                          <Users className="h-8 w-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-yellow-700 font-medium">{t('dashboard.rating')}</p>
                            <p className="text-2xl font-bold text-yellow-900">{stats.averageRating}</p>
                          </div>
                          <Star className="h-8 w-8 text-yellow-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('dashboard.recentActivity')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{t('dashboard.newBookingConfirmed')}</p>
                            <p className="text-xs text-gray-500">{t('dashboard.user')} #12345 - 15 {t('dashboard.aug')}, 16:00</p>
                          </div>
                          <span className="text-sm font-semibold text-green-600">+€45</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{t('dashboard.paymentReceived')}</p>
                            <p className="text-xs text-gray-500">{t('dashboard.invoice')} #DIAL-2025-00023</p>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">€120</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Calls Tab */}
              <TabsContent value="calls" className="mt-6">
                <Tabs defaultValue="upcoming">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">{t('dashboard.upcoming')}</TabsTrigger>
                    <TabsTrigger value="past">{t('dashboard.past')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming" className="space-y-4 mt-4">
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {t('dashboard.noUpcomingCalls')}
                  </div>
                ) : (
                  upcomingBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {format(new Date(booking.scheduledDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                            </span>
                            <Clock className="w-4 h-4 text-gray-500 ml-4" />
                            <span>{booking.startTime} - {booking.duration} min</span>
                          </div>
                          <p className="text-sm text-gray-600">Invitado: Usuario #{booking.guestId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[hsl(188,80%,42%)]">€{booking.price}</p>
                          <Button 
                            size="sm" 
                            className="mt-2 bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
                            onClick={() => window.location.href = `/video-call/${booking.id}`}
                          >
                            <VideoIcon className="w-4 h-4 mr-1" />
                            Unirse a Llamada
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4 mt-4">
                {pastBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tienes llamadas pasadas
                  </div>
                ) : (
                  pastBookings.map((booking) => {
                    const needsRating = booking.status === "completed" && booking.guestId === user?.id && !booking.hasRating;
                    
                    return (
                      <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                {format(new Date(booking.scheduledDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                              </span>
                              <Badge 
                                variant={booking.status === "completed" ? "default" : "secondary"}
                                className="ml-2"
                              >
                                {booking.status === "completed" ? "Completada" : "Cancelada"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {booking.guestId === user?.id ? `Mentor: ${booking.hostName}` : `Invitado: Usuario #${booking.guestId}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[hsl(188,80%,42%)]">€{booking.price}</p>
                            {needsRating ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="mt-2"
                                onClick={() => setRatingModalData({ 
                                  isOpen: true, 
                                  bookingId: booking.id, 
                                  hostName: booking.hostName 
                                })}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Valorar sesión
                              </Button>
                            ) : booking.hasRating ? (
                              <Button size="sm" variant="outline" className="mt-2" disabled>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Valorada
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="mt-2">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Ver detalles
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Invoices Tab */}
              <TabsContent value="invoices" className="mt-6">
                <InvoicesTab userId={user?.id} />
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-6">
                <ProfileManagement userId={user?.id} />
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="mt-6">
                <ContentManagement userId={user?.id} />
              </TabsContent>

              {/* Availability Tab */}
              <TabsContent value="availability" className="mt-6">
                <AvailabilityManagement userId={user?.id} />
              </TabsContent>

              {/* Stripe Connect Tab */}
              <TabsContent value="stripe-connect" className="mt-6">
                <StripeConnectOnboarding />
              </TabsContent>

              {/* Host Verification Tab */}
              <TabsContent value="verification" className="mt-6">
                <HostVerificationForm userId={user?.id} userStatus={user?.hostVerificationStatus} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Billing Section */}
        <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Facturación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Este Mes</p>
                  <p className="text-2xl font-bold text-[hsl(188,80%,42%)]">€245.00</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Mes Pasado</p>
                  <p className="text-2xl font-bold text-gray-700">€180.00</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Anual</p>
                  <p className="text-2xl font-bold text-gray-700">€{stats.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline">
                  Descargar Factura
                </Button>
                <Button className="bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)]">
                  Configurar Pagos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
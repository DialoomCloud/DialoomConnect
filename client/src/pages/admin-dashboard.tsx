import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  DollarSign, 
  Palette, 
  Newspaper,
  Activity,
  Video,
  Clock,
  TrendingUp,
  Mail,
  Calendar,
  Filter,
  AlertCircle,
  Award,
  Star
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AdminUserManagement } from "@/components/admin-user-management";
import { AdminEmailManagement } from "@/components/admin-email-management";
import AdminNewsManagement from "@/components/admin-news-management";
import { AdminSettingsPanel } from "@/components/admin-settings-panel";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { adminUser, isLoading } = useAdminAuth();
  const [, setLocation] = useLocation();

  // Fetch admin statistics - must be called before conditional returns
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/stats");
      return response.json();
    },
    enabled: !!adminUser && !isLoading, // Only fetch when adminUser exists
  });

  useEffect(() => {
    if (!isLoading && !adminUser) {
      setLocation("/");
    }
  }, [isLoading, adminUser, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(188,100%,38%)]"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)]">
            {i18n.language === 'es' 
              ? 'Panel de Administración'
              : i18n.language === 'ca'
              ? 'Panell d\'Administració'
              : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {i18n.language === 'es' 
              ? 'Gestiona todos los aspectos de Dialoom'
              : i18n.language === 'ca'
              ? 'Gestiona tots els aspectes de Dialoom'
              : 'Manage all aspects of Dialoom'}
          </p>
        </div>

        {/* Main Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mb-8">
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                {i18n.language === 'es' ? 'General' : 'Overview'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="hosts">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Hosts</span>
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                {i18n.language === 'es' ? 'Sesiones' : 'Sessions'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                {i18n.language === 'es' ? 'Facturas' : 'Invoices'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                {i18n.language === 'es' ? 'Ajustes' : 'Settings'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                {i18n.language === 'es' ? 'Noticias' : 'News'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Palette className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                {i18n.language === 'es' ? 'Tema' : 'Theme'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                {i18n.language === 'es' ? 'Emails' : 'Emails'}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <AdminOverview />
          </TabsContent>

          {/* Hosts Management Tab */}
          <TabsContent value="hosts" className="space-y-4">
            <AdminUserManagement />
          </TabsContent>

          {/* Sessions Management Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <SessionsManagement />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <InvoicesManagement />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <AdminSettings />
          </TabsContent>



          {/* News Management Tab */}
          <TabsContent value="news" className="space-y-4">
            <NewsManagement />
          </TabsContent>

          {/* Theme Editor Tab */}
          <TabsContent value="theme" className="space-y-4">
            <ThemeEditor />
          </TabsContent>

          {/* Email Management Tab */}
          <TabsContent value="emails" className="space-y-4">
            <AdminEmailManagement />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {i18n.language === 'es' ? 'Total Hosts' : 'Total Hosts'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalHosts || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.newHostsThisMonth || 0} este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {i18n.language === 'es' ? 'Videollamadas' : 'Video Calls'}
              </CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCalls || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.callsToday || 0} hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {i18n.language === 'es' ? 'Ingresos del Mes' : 'Monthly Revenue'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats?.monthlyRevenue || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.revenueGrowth || 0}% vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {i18n.language === 'es' ? 'Tiempo Promedio' : 'Avg Time'}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgCallDuration || 0} min</div>
              <p className="text-xs text-muted-foreground">
                Por videollamada
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Admin Overview Component with Enhanced Analytics
function AdminOverview() {
  const { i18n } = useTranslation();
  
  // Fetch detailed statistics
  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/analytics");
      return response.json();
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/admin/recent-activity"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/recent-activity");
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              {i18n.language === 'es' ? 'Nuevos Registros' : 'New Registrations'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.newRegistrations?.week || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {i18n.language === 'es' ? 'Esta semana' : 'This week'}
              <span className={`ml-2 ${(analytics?.newRegistrations?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(analytics?.newRegistrations?.growth || 0) >= 0 ? '+' : ''}{analytics?.newRegistrations?.growth || 0}%
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              {i18n.language === 'es' ? 'Sesiones Reservadas' : 'Sessions Booked'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.sessionsBooked?.month || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {i18n.language === 'es' ? 'Este mes' : 'This month'}
              <span className="ml-2 text-green-600">
                {analytics?.sessionsBooked?.completionRate || 0}% {i18n.language === 'es' ? 'completadas' : 'completed'}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              {i18n.language === 'es' ? 'Tasa de Cancelación' : 'Cancellation Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.cancellationRate || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {i18n.language === 'es' ? 'Últimos 30 días' : 'Last 30 days'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              {i18n.language === 'es' ? 'Retención de Usuarios' : 'User Retention'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.retentionRate || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {i18n.language === 'es' ? 'Usuarios que repiten' : 'Returning users'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {i18n.language === 'es' ? 'Análisis Financiero' : 'Financial Analytics'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {i18n.language === 'es' ? 'Total Facturado' : 'Total Billed'}
                </span>
                <span className="font-bold text-lg">€{analytics?.revenue?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {i18n.language === 'es' ? 'Comisiones Dialoom' : 'Dialoom Commissions'}
                </span>
                <span className="font-semibold text-green-600">€{analytics?.revenue?.commissions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {i18n.language === 'es' ? 'Pagos a Hosts' : 'Host Payments'}
                </span>
                <span className="font-semibold">€{analytics?.revenue?.hostPayments || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {i18n.language === 'es' ? 'Pagos Pendientes' : 'Pending Payments'}
                </span>
                <span className="font-semibold text-orange-600">€{analytics?.revenue?.pendingPayments || 0}</span>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {i18n.language === 'es' ? 'Ticket Promedio' : 'Average Ticket'}
                </span>
                <span className="font-bold">€{analytics?.revenue?.averageTicket || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Hosts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {i18n.language === 'es' ? 'Hosts Más Solicitados' : 'Top Performing Hosts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.topHosts?.map((host: any, index: number) => (
                <div key={host.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{host.name}</p>
                      <p className="text-xs text-gray-500">{host.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{host.sessions} {i18n.language === 'es' ? 'sesiones' : 'sessions'}</p>
                    <p className="text-xs text-gray-500">€{host.revenue}</p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500 text-center py-4">
                  {i18n.language === 'es' ? 'No hay datos disponibles' : 'No data available'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {i18n.language === 'es' ? 'Crecimiento de Usuarios' : 'User Growth'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'es' ? 'Últimos 6 meses' : 'Last 6 months'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics?.userGrowthData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#00ACC1" 
                  fill="#00ACC1" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {i18n.language === 'es' ? 'Tendencia de Ingresos' : 'Revenue Trend'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'es' ? 'Por semana' : 'Weekly'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics?.revenueTrendData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4CAF50" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {i18n.language === 'es' ? 'Sesiones por Categoría' : 'Sessions by Category'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'es' ? 'Este mes' : 'This month'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.sessionsByCategoryData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#9C27B0" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {i18n.language === 'es' ? 'Actividad Reciente' : 'Recent Activity'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'es' ? 'Últimas acciones en la plataforma' : 'Latest platform activities'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {recentActivity?.activities?.slice(0, 10).map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.type === 'registration' ? 'bg-blue-500' :
                    activity.type === 'booking' ? 'bg-green-500' :
                    activity.type === 'cancellation' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-gray-600 text-xs flex-shrink-0">{activity.timestamp}</span>
                  <span className="flex-1 text-gray-700">{activity.description}</span>
                </div>
              )) || (
                <p className="text-sm text-gray-500 text-center py-4">
                  {i18n.language === 'es' ? 'No hay actividad reciente' : 'No recent activity'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Hosts Management Component
function HostsManagement() {
  const { i18n } = useTranslation();
  const { data: hosts } = useQuery({
    queryKey: ["/api/admin/hosts"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/hosts");
      return response.json();
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {i18n.language === 'es' ? 'Gestión de Hosts' : 'Hosts Management'}
              </CardTitle>
              <CardDescription>
                {i18n.language === 'es' 
                  ? 'Administra todos los hosts de la plataforma'
                  : 'Manage all platform hosts'}
              </CardDescription>
            </div>
            <Button>
              <Users className="w-4 h-4 mr-2" />
              {i18n.language === 'es' ? 'Nuevo Host' : 'New Host'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            {i18n.language === 'es' 
              ? 'Lista de hosts y herramientas de gestión'
              : 'Host list and management tools'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced Financial Management Component
function InvoicesManagement() {
  const { i18n } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Fetch financial data
  const { data: financialData } = useQuery({
    queryKey: ["/api/admin/financial", selectedPeriod],
    queryFn: async () => {
      const response = await apiRequest(`/api/admin/financial?period=${selectedPeriod}`);
      return response.json();
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/admin/transactions", selectedStatus],
    queryFn: async () => {
      const response = await apiRequest(`/api/admin/transactions?status=${selectedStatus}`);
      return response.json();
    },
  });

  const { data: payouts } = useQuery({
    queryKey: ["/api/admin/payouts"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/payouts");
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              {i18n.language === 'es' ? 'Ingresos Totales' : 'Total Revenue'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              €{financialData?.totalRevenue || 0}
            </div>
            <p className="text-xs text-green-700 mt-1">
              {selectedPeriod === 'month' 
                ? (i18n.language === 'es' ? 'Este mes' : 'This month')
                : (i18n.language === 'es' ? 'Este año' : 'This year')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              {i18n.language === 'es' ? 'Comisiones Generadas' : 'Commissions Earned'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              €{financialData?.commissionsEarned || 0}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {financialData?.commissionRate || 0}% {i18n.language === 'es' ? 'promedio' : 'average'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">
              {i18n.language === 'es' ? 'Pagos Pendientes' : 'Pending Payouts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              €{financialData?.pendingPayouts || 0}
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              {financialData?.pendingCount || 0} {i18n.language === 'es' ? 'hosts' : 'hosts'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              {i18n.language === 'es' ? 'Pagos Procesados' : 'Processed Payouts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              €{financialData?.processedPayouts || 0}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              {financialData?.processedCount || 0} {i18n.language === 'es' ? 'completados' : 'completed'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{i18n.language === 'es' ? 'Transacciones' : 'Transactions'}</CardTitle>
            <div className="flex gap-2">
              <select 
                className="px-3 py-1 text-sm border rounded-md"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="month">{i18n.language === 'es' ? 'Este mes' : 'This month'}</option>
                <option value="quarter">{i18n.language === 'es' ? 'Trimestre' : 'Quarter'}</option>
                <option value="year">{i18n.language === 'es' ? 'Este año' : 'This year'}</option>
              </select>
              <select 
                className="px-3 py-1 text-sm border rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">{i18n.language === 'es' ? 'Todas' : 'All'}</option>
                <option value="completed">{i18n.language === 'es' ? 'Completadas' : 'Completed'}</option>
                <option value="pending">{i18n.language === 'es' ? 'Pendientes' : 'Pending'}</option>
                <option value="refunded">{i18n.language === 'es' ? 'Reembolsadas' : 'Refunded'}</option>
              </select>
              <Button size="sm" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                {i18n.language === 'es' ? 'Exportar' : 'Export'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Fecha' : 'Date'}</th>
                  <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Cliente' : 'Client'}</th>
                  <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Host' : 'Host'}</th>
                  <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Importe' : 'Amount'}</th>
                  <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Comisión' : 'Commission'}</th>
                  <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Estado' : 'Status'}</th>
                  <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Acciones' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.transactions?.map((tx: any) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-2 px-3">{tx.clientName}</td>
                    <td className="py-2 px-3">{tx.hostName}</td>
                    <td className="py-2 px-3 font-medium">€{tx.amount}</td>
                    <td className="py-2 px-3">€{tx.commission}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <Button size="sm" variant="ghost">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      {i18n.language === 'es' ? 'No hay transacciones' : 'No transactions'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Host Payouts Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{i18n.language === 'es' ? 'Pagos a Hosts' : 'Host Payouts'}</CardTitle>
              <CardDescription>
                {i18n.language === 'es' 
                  ? 'Gestiona los pagos pendientes a los hosts'
                  : 'Manage pending payments to hosts'}
              </CardDescription>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <DollarSign className="w-4 h-4 mr-2" />
              {i18n.language === 'es' ? 'Procesar Pagos' : 'Process Payouts'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payouts?.pendingPayouts?.map((payout: any) => (
              <div key={payout.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <div>
                    <p className="font-medium">{payout.hostName}</p>
                    <p className="text-sm text-gray-500">
                      {payout.sessionCount} {i18n.language === 'es' ? 'sesiones' : 'sessions'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">€{payout.amount}</p>
                  <p className="text-xs text-gray-500">
                    {i18n.language === 'es' ? 'Desde' : 'Since'} {new Date(payout.lastPayment).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-500 py-4">
                {i18n.language === 'es' ? 'No hay pagos pendientes' : 'No pending payouts'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sessions Management Component
function SessionsManagement() {
  const { i18n } = useTranslation();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  
  // Fetch sessions data
  const { data: sessions } = useQuery({
    queryKey: ["/api/admin/sessions", filterStatus, filterDate],
    queryFn: async () => {
      const response = await apiRequest(`/api/admin/sessions?status=${filterStatus}&date=${filterDate}`);
      return response.json();
    },
  });

  const { data: sessionStats } = useQuery({
    queryKey: ["/api/admin/session-stats"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/session-stats");
      return response.json();
    },
  });

  const handleCancelSession = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest(`/api/admin/sessions/${sessionId}/cancel`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions"] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Session Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {i18n.language === 'es' ? 'Sesiones Hoy' : 'Sessions Today'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats?.today || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {sessionStats?.todayCompleted || 0} {i18n.language === 'es' ? 'completadas' : 'completed'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {i18n.language === 'es' ? 'Esta Semana' : 'This Week'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats?.week || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {sessionStats?.weekPending || 0} {i18n.language === 'es' ? 'pendientes' : 'pending'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {i18n.language === 'es' ? 'Cancelaciones' : 'Cancellations'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats?.cancellations || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {sessionStats?.cancellationRate || 0}% {i18n.language === 'es' ? 'tasa' : 'rate'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {i18n.language === 'es' ? 'Duración Media' : 'Avg Duration'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats?.avgDuration || 0} min</div>
            <p className="text-xs text-gray-500 mt-1">
              {i18n.language === 'es' ? 'por sesión' : 'per session'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{i18n.language === 'es' ? 'Gestión de Sesiones' : 'Session Management'}</CardTitle>
              <CardDescription>
                {i18n.language === 'es' 
                  ? 'Monitorea y gestiona todas las videollamadas'
                  : 'Monitor and manage all video calls'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <FileText className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <select 
              className="px-3 py-1 text-sm border rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">{i18n.language === 'es' ? 'Todas' : 'All'}</option>
              <option value="scheduled">{i18n.language === 'es' ? 'Programadas' : 'Scheduled'}</option>
              <option value="ongoing">{i18n.language === 'es' ? 'En curso' : 'Ongoing'}</option>
              <option value="completed">{i18n.language === 'es' ? 'Completadas' : 'Completed'}</option>
              <option value="cancelled">{i18n.language === 'es' ? 'Canceladas' : 'Cancelled'}</option>
            </select>
            <select 
              className="px-3 py-1 text-sm border rounded-md"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="today">{i18n.language === 'es' ? 'Hoy' : 'Today'}</option>
              <option value="week">{i18n.language === 'es' ? 'Esta semana' : 'This week'}</option>
              <option value="month">{i18n.language === 'es' ? 'Este mes' : 'This month'}</option>
              <option value="all">{i18n.language === 'es' ? 'Todo' : 'All time'}</option>
            </select>
            <Button size="sm" variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {i18n.language === 'es' ? 'Más filtros' : 'More filters'}
            </Button>
          </div>

          {/* Sessions List View */}
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Fecha/Hora' : 'Date/Time'}</th>
                    <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Cliente' : 'Client'}</th>
                    <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Host' : 'Host'}</th>
                    <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Duración' : 'Duration'}</th>
                    <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Precio' : 'Price'}</th>
                    <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Estado' : 'Status'}</th>
                    <th className="text-left py-2 px-3">{i18n.language === 'es' ? 'Acciones' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions?.sessions?.map((session: any) => (
                    <tr key={session.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div>
                          <p className="font-medium">{new Date(session.scheduledAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{new Date(session.scheduledAt).toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="py-2 px-3">{session.clientName}</td>
                      <td className="py-2 px-3">{session.hostName}</td>
                      <td className="py-2 px-3">{session.duration} min</td>
                      <td className="py-2 px-3 font-medium">€{session.price}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          session.status === 'completed' ? 'bg-green-100 text-green-800' :
                          session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          session.status === 'ongoing' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          {session.status === 'scheduled' && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleCancelSession.mutate(session.id)}
                            >
                              <AlertCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Video className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-gray-500">
                        {i18n.language === 'es' ? 'No hay sesiones' : 'No sessions'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Calendar View Placeholder */}
          {viewMode === 'calendar' && (
            <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {i18n.language === 'es' 
                    ? 'Vista de calendario en desarrollo'
                    : 'Calendar view coming soon'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Host Load Management */}
      <Card>
        <CardHeader>
          <CardTitle>{i18n.language === 'es' ? 'Carga de Hosts' : 'Host Workload'}</CardTitle>
          <CardDescription>
            {i18n.language === 'es' 
              ? 'Monitorea la distribución de sesiones entre hosts'
              : 'Monitor session distribution among hosts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessionStats?.hostWorkload?.map((host: any) => (
              <div key={host.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {host.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{host.name}</p>
                    <p className="text-xs text-gray-500">
                      {host.sessionsToday} {i18n.language === 'es' ? 'sesiones hoy' : 'sessions today'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        host.utilization > 80 ? 'bg-red-500' :
                        host.utilization > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${host.utilization}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{host.utilization}%</span>
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-500 py-4">
                {i18n.language === 'es' ? 'No hay datos de carga' : 'No workload data'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Settings Component
function AdminSettings() {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  
  // State for all settings
  const [commission, setCommission] = useState(10);
  const [screenSharingFee, setScreenSharingFee] = useState(10);
  const [translationFee, setTranslationFee] = useState(25);
  const [recordingFee, setRecordingFee] = useState(10);
  const [transcriptionFee, setTranscriptionFee] = useState(5);
  const [vatRate, setVatRate] = useState(21);
  
  // Load configuration from database
  const { data: configs, isLoading } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/config");
      return response.json();
    },
  });

  // Load verification settings
  const { data: verificationSettings, isLoading: settingsLoading } = useQuery<{
    showVerified: boolean;
    showRecommended: boolean;
  }>({
    queryKey: ["/api/admin/verification-settings"],
  });

  // Update state when configs load
  useEffect(() => {
    if (configs && Array.isArray(configs)) {
      configs.forEach((config: any) => {
        const value = typeof config.value === 'string' ? parseFloat(config.value) : config.value;
        switch (config.key) {
          case 'commission_rate':
            // Convert from decimal to percentage (0.21 -> 21)
            setCommission(value * 100);
            break;
          case 'screen_sharing_price':
            setScreenSharingFee(value);
            break;
          case 'translation_price':
            setTranslationFee(value);
            break;
          case 'recording_price':
            setRecordingFee(value);
            break;
          case 'transcription_price':
            setTranscriptionFee(value);
            break;
          case 'vat_rate':
            // Convert from decimal to percentage (0.21 -> 21)
            setVatRate(value * 100);
            break;
        }
      });
    }
  }, [configs]);

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async () => {
      const configData = {
        commission: commission / 100, // Convert percentage to decimal
        vatRate: vatRate / 100, // Convert percentage to decimal
        screenSharePrice: screenSharingFee,
        translationPrice: translationFee,
        recordingPrice: recordingFee,
        transcriptionPrice: transcriptionFee,
      };

      // Use PUT endpoint for multiple configs
      await apiRequest("/api/admin/config", { 
        method: "PUT", 
        body: configData 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({
        title: i18n.language === 'es' ? "Configuración guardada" : "Settings saved",
        description: i18n.language === 'es' 
          ? "Los cambios se han aplicado correctamente"
          : "Changes have been applied successfully",
      });
    },
    onError: () => {
      toast({
        title: i18n.language === 'es' ? "Error" : "Error",
        description: i18n.language === 'es' 
          ? "No se pudieron guardar los cambios"
          : "Could not save changes",
        variant: "destructive",
      });
    },
  });

  // Update verification settings mutation
  const updateVerificationMutation = useMutation({
    mutationFn: async (settings: { showVerified?: boolean; showRecommended?: boolean }) => {
      const response = await apiRequest('/api/admin/verification-settings', {
        method: "PUT",
        body: settings
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification-settings"] });
      toast({
        title: i18n.language === 'es' ? "Configuración de badges actualizada" : "Badge settings updated",
        description: i18n.language === 'es' 
          ? "Los ajustes de verificación se han guardado correctamente"
          : "Verification settings have been saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: i18n.language === 'es' ? "Error" : "Error",
        description: error?.message || (i18n.language === 'es' ? "No se pudo actualizar la configuración de badges" : "Could not update badge settings"),
        variant: "destructive",
      });
    },
  });

  const handleVerificationChange = (setting: 'showVerified' | 'showRecommended', value: boolean) => {
    updateVerificationMutation.mutate({ [setting]: value });
  };

  return (
    <div className="space-y-4">
      {/* Badge Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {i18n.language === 'es' ? 'Control de Badges' : 'Badge Control'}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'es' 
              ? 'Controla la visibilidad global de los badges de verificación y recomendación'
              : 'Control global visibility of verification and recommendation badges'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(188,100%,38%)] mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {i18n.language === 'es' ? 'Badge de Verificado' : 'Verified Badge'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {i18n.language === 'es' 
                        ? 'Mostrar el badge de verificado en la exploración de hosts'
                        : 'Show verified badge in host exploration'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={verificationSettings?.showVerified || false}
                      onChange={(e) => handleVerificationChange('showVerified', e.target.checked)}
                      disabled={updateVerificationMutation.isPending}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {i18n.language === 'es' ? 'Badge de Recomendado' : 'Recommended Badge'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {i18n.language === 'es' 
                        ? 'Mostrar el badge de recomendado en la exploración de hosts'
                        : 'Show recommended badge in host exploration'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={verificationSettings?.showRecommended || false}
                      onChange={(e) => handleVerificationChange('showRecommended', e.target.checked)}
                      disabled={updateVerificationMutation.isPending}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {i18n.language === 'es' ? 'Configuración Global' : 'Global Settings'}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'es' 
              ? 'Configura comisiones y tarifas adicionales'
              : 'Configure commissions and additional fees'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                {i18n.language === 'es' ? 'Comisión Global (%)' : 'Global Commission (%)'}
              </label>
              <input 
                type="number" 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {i18n.language === 'es' ? 'IVA (%)' : 'VAT (%)'}
              </label>
              <input 
                type="number" 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">
              {i18n.language === 'es' ? 'Tarifas de Servicios Adicionales (€)' : 'Additional Service Fees (€)'}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>{i18n.language === 'es' ? 'Compartir Pantalla' : 'Screen Sharing'}</span>
                <input 
                  type="number" 
                  className="w-24 rounded border px-2 py-1" 
                  value={screenSharingFee}
                  onChange={(e) => setScreenSharingFee(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="flex justify-between items-center">
                <span>{i18n.language === 'es' ? 'Traducción' : 'Translation'}</span>
                <input 
                  type="number" 
                  className="w-24 rounded border px-2 py-1" 
                  value={translationFee}
                  onChange={(e) => setTranslationFee(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="flex justify-between items-center">
                <span>{i18n.language === 'es' ? 'Grabación' : 'Recording'}</span>
                <input 
                  type="number" 
                  className="w-24 rounded border px-2 py-1" 
                  value={recordingFee}
                  onChange={(e) => setRecordingFee(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="flex justify-between items-center">
                <span>{i18n.language === 'es' ? 'Transcripción' : 'Transcription'}</span>
                <input 
                  type="number" 
                  className="w-24 rounded border px-2 py-1" 
                  value={transcriptionFee}
                  onChange={(e) => setTranscriptionFee(Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            onClick={() => saveConfigMutation.mutate()}
            disabled={saveConfigMutation.isPending || isLoading}
          >
            {saveConfigMutation.isPending
              ? (i18n.language === 'es' ? 'Guardando...' : 'Saving...')
              : (i18n.language === 'es' ? 'Guardar Configuración' : 'Save Settings')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}



// News Management Component
function NewsManagement() {
  return <AdminNewsManagement />;
}

// Theme Editor Component
function ThemeEditor() {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Default theme colors
  const defaultColors = {
    primary: '#008B9A',
    secondary: '#00B8CC',
    accent: '#B8DCE1'
  };
  
  const defaultLogo = '/uploads/images/dialoomblue.png';
  
  const [primaryColor, setPrimaryColor] = useState(defaultColors.primary);
  const [secondaryColor, setSecondaryColor] = useState(defaultColors.secondary);
  const [accentColor, setAccentColor] = useState(defaultColors.accent);
  const [logoUrl, setLogoUrl] = useState(defaultLogo);
  const [previewLogoUrl, setPreviewLogoUrl] = useState('');
  
  // Load theme configuration from database
  const { data: themeConfig, isLoading } = useQuery({
    queryKey: ["/api/admin/config/theme"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/config");
      const configs = await response.json();
      const theme = configs.find((c: any) => c.key === 'theme_colors');
      const logo = configs.find((c: any) => c.key === 'theme_logo');
      
      if (theme) {
        const colors = JSON.parse(theme.value);
        setPrimaryColor(colors.primary || defaultColors.primary);
        setSecondaryColor(colors.secondary || defaultColors.secondary);
        setAccentColor(colors.accent || defaultColors.accent);
        
        // Apply the loaded colors to CSS immediately
        applyColorsToCSS({
          primary: colors.primary || defaultColors.primary,
          secondary: colors.secondary || defaultColors.secondary,
          accent: colors.accent || defaultColors.accent,
        });
      }
      
      if (logo) {
        const logoPath = JSON.parse(logo.value).url;
        setLogoUrl(logoPath || defaultLogo);
      }
      
      return { theme, logo };
    },
  });

  // Apply colors to CSS variables
  const applyColorsToCSS = (colors: { primary: string; secondary: string; accent: string }) => {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS variables
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    root.style.setProperty('--primary', hexToHsl(colors.primary));
    root.style.setProperty('--primary-foreground', '0 0% 100%');
    root.style.setProperty('--secondary', hexToHsl(colors.secondary));
    root.style.setProperty('--secondary-foreground', '0 0% 100%');
    root.style.setProperty('--accent', hexToHsl(colors.accent));
    root.style.setProperty('--accent-foreground', '0 0% 9%');
  };

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      
      const response = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to upload logo");
      const data = await response.json();
      return data.logoUrl;
    },
    onSuccess: (newLogoUrl) => {
      setPreviewLogoUrl(newLogoUrl);
    },
    onError: () => {
      toast({
        title: i18n.language === 'es' ? "Error" : "Error",
        description: i18n.language === 'es' 
          ? "Error al cargar el logo"
          : "Failed to upload logo",
        variant: "destructive",
      });
    },
  });

  // Save theme configuration mutation
  const saveThemeMutation = useMutation({
    mutationFn: async () => {
      // Save theme colors
      const themeData = {
        key: 'theme_colors',
        value: JSON.stringify({
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor,
        }),
        description: 'Application theme colors',
      };
      
      await apiRequest("/api/admin/config", { method: "POST", body: themeData });
      
      // Save logo if changed
      if (previewLogoUrl) {
        const logoData = {
          key: 'theme_logo',
          value: JSON.stringify({
            url: previewLogoUrl,
          }),
          description: 'Application logo',
        };
        
        await apiRequest("/api/admin/config", { method: "POST", body: logoData });
        setLogoUrl(previewLogoUrl);
        setPreviewLogoUrl('');
      }
      
      // Apply the colors immediately
      applyColorsToCSS({
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({
        title: i18n.language === 'es' ? "Tema actualizado" : "Theme updated",
        description: i18n.language === 'es' 
          ? "Los colores del tema se han guardado correctamente. Recarga la página para ver todos los cambios."
          : "Theme colors have been saved successfully. Reload the page to see all changes.",
      });
    },
    onError: () => {
      toast({
        title: i18n.language === 'es' ? "Error" : "Error",
        description: i18n.language === 'es' 
          ? "No se pudieron guardar los cambios"
          : "Could not save changes",
        variant: "destructive",
      });
    },
  });

  // Reset to default colors
  const resetToDefaults = () => {
    setPrimaryColor(defaultColors.primary);
    setSecondaryColor(defaultColors.secondary);
    setAccentColor(defaultColors.accent);
    setLogoUrl(defaultLogo);
    setPreviewLogoUrl('');
    applyColorsToCSS(defaultColors);
    toast({
      title: i18n.language === 'es' ? "Tema restaurado" : "Theme reset",
      description: i18n.language === 'es' 
        ? "Se han restaurado los colores y logo por defecto"
        : "Default colors and logo have been restored",
    });
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {i18n.language === 'es' ? 'Editor de Tema' : 'Theme Editor'}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'es' 
              ? 'Personaliza los colores y apariencia de la aplicación'
              : 'Customize app colors and appearance'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Section */}
          <div>
            <label className="text-sm font-medium">
              {i18n.language === 'es' ? 'Logo / Icono' : 'Logo / Icon'}
            </label>
            <div className="flex items-center gap-4 mt-2">
              <div className="relative">
                <img 
                  src={previewLogoUrl || logoUrl}
                  alt="Current logo" 
                  className="h-16 w-auto object-contain bg-gray-100 rounded p-2"
                  style={{ maxWidth: '150px' }}
                />
                {previewLogoUrl && (
                  <span className="absolute -top-2 -right-2 text-xs bg-yellow-500 text-white px-1 rounded">
                    {i18n.language === 'es' ? 'Nuevo' : 'New'}
                  </span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadLogoMutation.mutate(file);
                    }
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    asChild
                    disabled={uploadLogoMutation.isPending}
                  >
                    <span>
                      {uploadLogoMutation.isPending
                        ? (i18n.language === 'es' ? 'Cargando...' : 'Uploading...')
                        : (i18n.language === 'es' ? 'Cambiar Logo' : 'Change Logo')}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {i18n.language === 'es' 
                ? 'Recomendado: PNG transparente, altura mínima 100px'
                : 'Recommended: Transparent PNG, minimum height 100px'}
            </p>
          </div>

          <div className="border-t pt-4" />
          
          <div>
            <label className="text-sm font-medium">
              {i18n.language === 'es' ? 'Color Primario' : 'Primary Color'}
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="color" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-20"
              />
              <span className="text-sm text-gray-500">{primaryColor}</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              {i18n.language === 'es' ? 'Color Secundario' : 'Secondary Color'}
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="color" 
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-10 w-20"
              />
              <span className="text-sm text-gray-500">{secondaryColor}</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              {i18n.language === 'es' ? 'Color de Acento' : 'Accent Color'}
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="color" 
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-20"
              />
              <span className="text-sm text-gray-500">{accentColor}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={() => saveThemeMutation.mutate()}
              disabled={saveThemeMutation.isPending}
            >
              {saveThemeMutation.isPending 
                ? (i18n.language === 'es' ? 'Guardando...' : 'Saving...')
                : (i18n.language === 'es' ? 'Aplicar Cambios' : 'Apply Changes')}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetToDefaults}
              disabled={saveThemeMutation.isPending}
            >
              {i18n.language === 'es' ? 'Resetear' : 'Reset'}
            </Button>
          </div>
          
          {/* Live Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-3">
              {i18n.language === 'es' ? 'Vista Previa' : 'Preview'}
            </h4>
            <div className="flex gap-2">
              <div 
                className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                {i18n.language === 'es' ? 'PRIM' : 'PRIM'}
              </div>
              <div 
                className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: secondaryColor }}
              >
                {i18n.language === 'es' ? 'SEC' : 'SEC'}
              </div>
              <div 
                className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center text-gray-800 text-xs font-medium"
                style={{ backgroundColor: accentColor }}
              >
                {i18n.language === 'es' ? 'ACE' : 'ACC'}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 text-center">
            {i18n.language === 'es' 
              ? 'Los cambios se aplicarán inmediatamente al guardar'
              : 'Changes will be applied immediately when saved'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
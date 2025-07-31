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
  UserCheck,
  Newspaper,
  Activity,
  Video,
  Clock,
  TrendingUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AdminUserManagement } from "@/components/admin-user-management";

export default function AdminDashboard() {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { adminUser, isLoading } = useAdminAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !adminUser) {
      setLocation("/admin-login");
    }
  }, [isLoading, adminUser, setLocation]);

  // Fetch admin statistics - must be called before conditional returns
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/stats", { method: "GET" });
      return response.json();
    },
    enabled: !!adminUser, // Only fetch when adminUser exists
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(244,91%,68%)]"></div>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

        {/* Main Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-7 w-full">
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
            <TabsTrigger value="approvals">
              <UserCheck className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                {i18n.language === 'es' ? 'Aprobar' : 'Approve'}
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
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <AdminOverview />
          </TabsContent>

          {/* Hosts Management Tab */}
          <TabsContent value="hosts" className="space-y-4">
            <AdminUserManagement />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <InvoicesManagement />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <AdminSettings />
          </TabsContent>

          {/* Host Approvals Tab */}
          <TabsContent value="approvals" className="space-y-4">
            <HostApprovals />
          </TabsContent>

          {/* News Management Tab */}
          <TabsContent value="news" className="space-y-4">
            <NewsManagement />
          </TabsContent>

          {/* Theme Editor Tab */}
          <TabsContent value="theme" className="space-y-4">
            <ThemeEditor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Admin Overview Component
function AdminOverview() {
  const { i18n } = useTranslation();
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {i18n.language === 'es' ? 'Resumen de Actividad' : 'Activity Summary'}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'es' 
              ? 'Métricas clave de los últimos 30 días'
              : 'Key metrics from the last 30 days'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span>Tasa de Conversión</span>
              </div>
              <span className="font-semibold">24.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>Crecimiento de Usuarios</span>
              </div>
              <span className="font-semibold">+18%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-500" />
                <span>Videollamadas Completadas</span>
              </div>
              <span className="font-semibold">89%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hosts Management Component
function HostsManagement() {
  const { i18n } = useTranslation();
  const { data: hosts } = useQuery({
    queryKey: ["/api/admin/hosts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/hosts");
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

// Invoices Management Component
function InvoicesManagement() {
  const { i18n } = useTranslation();
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {i18n.language === 'es' ? 'Gestión de Facturas' : 'Invoice Management'}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'es' 
              ? 'Visualiza y gestiona todas las facturas'
              : 'View and manage all invoices'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            {i18n.language === 'es' 
              ? 'Sistema de facturas y reportes financieros'
              : 'Invoice system and financial reports'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Settings Component
function AdminSettings() {
  const { i18n } = useTranslation();
  const { data: config } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/config");
      return response.json();
    },
  });

  return (
    <div className="space-y-4">
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
          <div>
            <label className="text-sm font-medium">
              {i18n.language === 'es' ? 'Comisión Global (%)' : 'Global Commission (%)'}
            </label>
            <input 
              type="number" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              defaultValue={config?.commission || 10}
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">
              {i18n.language === 'es' ? 'Tarifas de Servicios Adicionales' : 'Additional Service Fees'}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Screen Sharing</span>
                <input type="number" className="w-20 rounded border px-2" defaultValue={10} />
              </div>
              <div className="flex justify-between items-center">
                <span>Translation</span>
                <input type="number" className="w-20 rounded border px-2" defaultValue={25} />
              </div>
              <div className="flex justify-between items-center">
                <span>Recording</span>
                <input type="number" className="w-20 rounded border px-2" defaultValue={10} />
              </div>
              <div className="flex justify-between items-center">
                <span>Transcription</span>
                <input type="number" className="w-20 rounded border px-2" defaultValue={5} />
              </div>
            </div>
          </div>
          <Button className="w-full">
            {i18n.language === 'es' ? 'Guardar Configuración' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Host Approvals Component
function HostApprovals() {
  const { i18n } = useTranslation();
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {i18n.language === 'es' ? 'Aprobación de Hosts' : 'Host Approvals'}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'es' 
              ? 'Revisa y aprueba nuevos hosts'
              : 'Review and approve new hosts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            {i18n.language === 'es' 
              ? 'Sistema de verificación y aprobación de hosts'
              : 'Host verification and approval system'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// News Management Component
function NewsManagement() {
  const { i18n } = useTranslation();
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {i18n.language === 'es' ? 'Gestor de Noticias' : 'News Manager'}
              </CardTitle>
              <CardDescription>
                {i18n.language === 'es' 
                  ? 'Crea y gestiona noticias y elementos destacados'
                  : 'Create and manage news and highlights'}
              </CardDescription>
            </div>
            <Button>
              <Newspaper className="w-4 h-4 mr-2" />
              {i18n.language === 'es' ? 'Nueva Noticia' : 'New Article'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            {i18n.language === 'es' 
              ? 'Sistema de publicación de contenido'
              : 'Content publishing system'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Theme Editor Component
function ThemeEditor() {
  const { i18n } = useTranslation();
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  const [accentColor, setAccentColor] = useState('#10B981');
  
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
          
          <Button className="w-full">
            {i18n.language === 'es' ? 'Aplicar Cambios' : 'Apply Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
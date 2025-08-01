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
  Mail
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AdminUserManagement } from "@/components/admin-user-management";
import { AdminEmailManagement } from "@/components/admin-email-management";
import AdminNewsManagement from "@/components/admin-news-management";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { adminUser, isLoading } = useAdminAuth();
  const [, setLocation] = useLocation();

  // Fetch admin statistics - must be called before conditional returns
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/stats", {});
      return response.json();
    },
    enabled: !!adminUser && !isLoading, // Only fetch when adminUser exists
  });

  useEffect(() => {
    if (!isLoading && !adminUser) {
      setLocation("/admin-login");
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
      const response = await apiRequest("GET", "/api/admin/hosts", {});
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
      const response = await apiRequest("GET", "/api/admin/config", {});
      return response.json();
    },
  });

  // Update state when configs load
  useEffect(() => {
    if (configs && Array.isArray(configs)) {
      configs.forEach((config: any) => {
        const value = typeof config.value === 'string' ? parseFloat(config.value) : config.value;
        switch (config.key) {
          case 'commission_rate':
            setCommission(value);
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
            setVatRate(value);
            break;
        }
      });
    }
  }, [configs]);

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async () => {
      const configs = [
        { key: 'commission_rate', value: commission.toString(), description: 'Platform commission percentage' },
        { key: 'vat_rate', value: vatRate.toString(), description: 'VAT rate percentage' },
        { key: 'screen_sharing_price', value: screenSharingFee.toString(), description: 'Screen sharing service fee in EUR' },
        { key: 'translation_price', value: translationFee.toString(), description: 'Translation service fee in EUR' },
        { key: 'recording_price', value: recordingFee.toString(), description: 'Recording service fee in EUR' },
        { key: 'transcription_price', value: transcriptionFee.toString(), description: 'Transcription service fee in EUR' },
      ];

      // Save each config item
      for (const config of configs) {
        await apiRequest("POST", "/api/admin/config", config);
      }
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
  
  const [primaryColor, setPrimaryColor] = useState(defaultColors.primary);
  const [secondaryColor, setSecondaryColor] = useState(defaultColors.secondary);
  const [accentColor, setAccentColor] = useState(defaultColors.accent);
  
  // Load theme configuration from database
  const { data: themeConfig, isLoading } = useQuery({
    queryKey: ["/api/admin/config/theme"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/config", {});
      const configs = await response.json();
      const theme = configs.find((c: any) => c.key === 'theme_colors');
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
        
        return colors;
      }
      return null;
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

  // Save theme configuration mutation
  const saveThemeMutation = useMutation({
    mutationFn: async () => {
      const themeData = {
        key: 'theme_colors',
        value: JSON.stringify({
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor,
        }),
        description: 'Application theme colors',
      };
      
      await apiRequest("POST", "/api/admin/config", themeData);
      
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
    applyColorsToCSS(defaultColors);
    toast({
      title: i18n.language === 'es' ? "Colores restaurados" : "Colors reset",
      description: i18n.language === 'es' 
        ? "Se han restaurado los colores por defecto"
        : "Default colors have been restored",
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
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
import { AdminThemeEditor } from "@/components/admin-theme-editor";
import { AdminSettingsPanel } from "@/components/admin-settings-panel";
import AdminNewsManagement from "@/components/admin-news-management";

import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { adminUser, isLoading } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);

  // Fetch admin statistics - must be called before conditional returns
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/stats");
      return response.json();
    },
    enabled: !!adminUser && !isLoading, // Only fetch when adminUser exists
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
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
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona usuarios, sesiones y configuración del sistema
          </p>
        </div>

        {/* Main Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mb-8">
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                Resumen
              </span>
            </TabsTrigger>
            <TabsTrigger value="hosts">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Hosts</span>
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                Sesiones
              </span>
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                Facturas
              </span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                Configuración
              </span>
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                Noticias
              </span>
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Palette className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                Tema
              </span>
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                Emails
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Statistics Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Usuarios
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sesiones Activas
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeSessions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ingresos
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats?.revenue || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +19% desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Hosts Verificados
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.verifiedHosts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +201 desde el mes pasado
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sesiones por Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats?.dailySessions || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sessions" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ingresos Mensuales</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.monthlyRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hosts Tab */}
          <TabsContent value="hosts">
            <AdminUserManagement />
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Sesiones</CardTitle>
                <CardDescription>
                  Administra las sesiones de video llamadas en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Funcionalidad de gestión de sesiones en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Facturas</CardTitle>
                <CardDescription>
                  Administra las facturas y pagos de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Funcionalidad de gestión de facturas en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>
                  Configura los parámetros globales de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={() => setSettingsPanelOpen(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Abrir Panel de Configuración
                  </Button>
                  <p className="text-sm text-gray-600">
                    Gestiona badges, configuraciones globales y usuarios desde el panel de configuración.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news">
            <AdminNewsManagement />
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme">
            <AdminThemeEditor />
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails">
            <AdminEmailManagement />
          </TabsContent>
        </Tabs>

        {/* Admin Settings Panel */}
        <AdminSettingsPanel 
          open={settingsPanelOpen} 
          onOpenChange={setSettingsPanelOpen} 
        />
      </div>
    </div>
  );
}
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Settings, Users } from "lucide-react";
import { AdminSettingsPanel } from "@/components/admin-settings-panel";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(188,100%,38%)]"></div>
      </div>
    );
  }

  const [, setLocation] = useLocation();

  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-[hsl(17,12%,6%)] mb-4 flex items-center justify-center gap-3">
            <Shield className="w-10 h-10 text-[hsl(188,100%,38%)]" />
            Panel de Administración
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="animate-fade-in-up hover-lift cursor-pointer" onClick={() => setShowSettingsPanel(true)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                Configuración de Hosts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gestiona la configuración global de badges y el estado individual de hosts
              </p>
              <Button className="w-full">
                Abrir Panel de Configuración
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Panel de gestión de usuarios y hosts en desarrollo...</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Panel de estadísticas y analytics en desarrollo...</p>
            </CardContent>
          </Card>
        </div>

        <AdminSettingsPanel 
          open={showSettingsPanel}
          onOpenChange={setShowSettingsPanel}
        />
      </div>
    </div>
  );
}
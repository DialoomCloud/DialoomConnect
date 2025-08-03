import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Database, UserCheck, Play, Smartphone, Share2, TestTube } from "lucide-react";
import { Link } from "wouter";
import { useThemeConfig } from "@/hooks/useThemeConfig";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Landing() {
  const { logoUrl } = useThemeConfig();
  const { toast } = useToast();
  const [isTestLoading, setIsTestLoading] = useState(false);
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleTestBypass = async () => {
    setIsTestLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/test-bypass");
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Acceso de prueba activado",
          description: `Iniciando sesión como ${data.user.name}...`,
        });
        setTimeout(() => {
          window.location.href = "/profile";
        }, 1000);
      } else {
        throw new Error(data.message || "Error al activar bypass");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo activar el acceso de prueba",
        variant: "destructive",
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  const features = [
    {
      icon: <Database className="text-[hsl(188,100%,38%)]" />,
      title: "Base de Datos SQL Robusta",
      description: "Almacenamiento persistente y seguro de todos tus datos con tecnología NEON PostgreSQL"
    },
    {
      icon: <UserCheck className="text-[hsl(188,80%,42%)]" />,
      title: "Perfil Completo",
      description: "Gestiona tu información personal, foto de perfil, contacto y descripción profesional"
    },
    {
      icon: <Play className="text-[hsl(188,70%,45%)]" />,
      title: "Contenido Multimedia",
      description: "Integra y muestra contenido de YouTube, Instagram y TikTok en tu perfil"
    },
    {
      icon: <Shield className="text-[hsl(188,100%,38%)]" />,
      title: "Autenticación Segura",
      description: "Sistema de registro y login seguro para proteger tu información personal"
    },
    {
      icon: <Smartphone className="text-[hsl(188,80%,42%)]" />,
      title: "Diseño Responsivo",
      description: "Interfaz optimizada para todos los dispositivos, desde móviles hasta escritorio"
    },
    {
      icon: <Share2 className="text-[hsl(188,70%,45%)]" />,
      title: "Compartir Fácilmente",
      description: "Comparte tu perfil y contenido con otros usuarios de forma rápida y sencilla"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-[hsl(220,13%,90%)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src={logoUrl}
                  alt="Dialoom" 
                  className="h-8 w-auto object-contain"
                  style={{ maxWidth: '140px' }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/admin-login">
                <Button 
                  variant="ghost" 
                  className="text-gray-600 hover:text-[hsl(188,100%,38%)] font-medium"
                >
                  Admin
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleLogin}
                className="text-gray-600 hover:text-[hsl(188,100%,38%)] font-medium"
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={handleLogin}
                className="bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)]"
              >
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="dialoom-bg-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-[hsl(17,12%,6%)] mb-6">
              Crea tu perfil profesional{" "}
              <span className="text-[hsl(188,100%,38%)]">completo</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gestiona tu información personal, comparte contenido multimedia de YouTube, Instagram y TikTok. 
              Todo en una plataforma segura con base de datos SQL.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={handleLogin}
                className="bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)] px-8 py-3 text-lg font-semibold"
              >
                Comenzar Ahora
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,95%)] px-8 py-3 text-lg font-semibold"
              >
                Ver Demo
              </Button>
            </div>
            
            {/* Test bypass button - only in development */}
            {import.meta.env.DEV && (
              <div className="mt-8">
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={handleTestBypass}
                  disabled={isTestLoading}
                  className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-6 py-2 text-sm font-medium"
                >
                  {isTestLoading ? (
                    "Cargando..."
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Acceder como Usuario de Prueba
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2">Solo para desarrollo: billing@thopters.com</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[hsl(220,9%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-4">Características Principales</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dialoom ofrece todo lo que necesitas para gestionar tu perfil profesional y compartir contenido multimedia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gray-50">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(17,12%,6%)] mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

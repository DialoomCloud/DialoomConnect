import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Database, UserCheck, Play, Smartphone, Share2 } from "lucide-react";

import { Link } from "wouter";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: <Database className="text-[hsl(244,91%,68%)]" />,
      title: "Base de Datos SQL Robusta",
      description: "Almacenamiento persistente y seguro de todos tus datos con tecnología NEON PostgreSQL"
    },
    {
      icon: <UserCheck className="text-[hsl(262,51%,65%)]" />,
      title: "Perfil Completo",
      description: "Gestiona tu información personal, foto de perfil, contacto y descripción profesional"
    },
    {
      icon: <Play className="text-[hsl(159,61%,50%)]" />,
      title: "Contenido Multimedia",
      description: "Integra y muestra contenido de YouTube, Instagram y TikTok en tu perfil"
    },
    {
      icon: <Shield className="text-[hsl(244,91%,68%)]" />,
      title: "Autenticación Segura",
      description: "Sistema de registro y login seguro para proteger tu información personal"
    },
    {
      icon: <Smartphone className="text-[hsl(262,51%,65%)]" />,
      title: "Diseño Responsivo",
      description: "Interfaz optimizada para todos los dispositivos, desde móviles hasta escritorio"
    },
    {
      icon: <Share2 className="text-[hsl(159,61%,50%)]" />,
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
                  src="/uploads/images/dialoomblue.png"
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
                  className="text-gray-600 hover:text-[hsl(244,91%,68%)] font-medium"
                >
                  Admin
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleLogin}
                className="text-gray-600 hover:text-[hsl(244,91%,68%)] font-medium"
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={handleLogin}
                className="bg-[hsl(244,91%,68%)] text-white hover:bg-[hsl(244,91%,60%)]"
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
              <span className="text-[hsl(244,91%,68%)]">completo</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gestiona tu información personal, comparte contenido multimedia de YouTube, Instagram y TikTok. 
              Todo en una plataforma segura con base de datos SQL.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={handleLogin}
                className="bg-[hsl(244,91%,68%)] text-white hover:bg-[hsl(244,91%,60%)] px-8 py-3 text-lg font-semibold"
              >
                Comenzar Ahora
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-[hsl(244,91%,68%)] text-[hsl(244,91%,68%)] hover:bg-[hsl(244,91%,95%)] px-8 py-3 text-lg font-semibold"
              >
                Ver Demo
              </Button>
            </div>
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

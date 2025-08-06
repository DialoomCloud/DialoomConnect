import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { User as UserIcon, Phone, MapPin, Mail, Edit, Plus, CheckCircle, Trash2, Search, Users, Calendar, Video, Settings, Newspaper, Clock, Eye, Star } from "lucide-react";
import type { User, MediaContent, NewsArticle } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { adminUser, isLoading: adminLoading } = useAdminAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Debug authentication state
  console.log("Home: Auth state", { isAuthenticated, authLoading, adminUser, adminLoading });

  // Fetch user profile
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  // Handle user error - only show error, don't redirect
  if (userError && isUnauthorizedError(userError as Error)) {
    console.log("User not authenticated, showing limited content");
  }

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)] flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(188,100%,38%)]"></div>
          <div className="absolute inset-0 animate-glow rounded-full"></div>
        </div>
      </div>
    );
  }

  // Public home page content (shown to all users)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(220,9%,98%)] to-[hsl(220,20%,95%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-[hsl(17,12%,6%)] mb-4">
              Conecta con Expertos
            </h1>
            <h2 className="text-xl text-gray-600 mb-8">
              La plataforma que te conecta con profesionales a través de videollamadas personalizadas
            </h2>
            
            {/* Main CTA */}
            <Link href="/hosts">
              <Button className="bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)] px-8 py-3 text-lg mb-12">
                Buscar Expertos
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured Hosts Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[hsl(17,12%,6%)]">
              Expertos Destacados
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-[hsl(17,12%,6%)] mb-1">
                      Experto {i}
                    </h3>
                    <p className="text-[hsl(188,100%,38%)] font-medium text-sm mb-2">
                      Marketing Digital
                    </p>
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">5.0 (10 reseñas)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-[hsl(17,12%,6%)] mb-8">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-3">
                Busca Expertos
              </h3>
              <p className="text-gray-600 text-sm">
                Encuentra profesionales en tu área de interés
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-3">
                Reserva tu Sesión
              </h3>
              <p className="text-gray-600 text-sm">
                Elige el horario que mejor te convenga
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-3">
                Conecta y Aprende
              </h3>
              <p className="text-gray-600 text-sm">
                Disfruta de tu videollamada personalizada
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Dialoom Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-[hsl(17,12%,6%)] mb-8">
            ¿Por qué elegir Dialoom?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-2">
                Expertos Verificados
              </h3>
              <p className="text-gray-600 text-sm">
                Profesionales con experiencia comprobada
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-2">
                Horarios Flexibles
              </h3>
              <p className="text-gray-600 text-sm">
                Reserva cuando mejor te convenga
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-2">
                Tecnología Avanzada
              </h3>
              <p className="text-gray-600 text-sm">
                Videollamadas de alta calidad
              </p>
            </div>
          </div>
        </div>

        {/* Latest News Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-[hsl(17,12%,6%)] mb-8">
            Últimas Noticias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                  <h3 className="font-bold text-[hsl(17,12%,6%)] mb-2">
                    Noticia {i}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Descubre las últimas novedades y actualizaciones de nuestra plataforma
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" className="border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)]">
              Ver más noticias
            </Button>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-[hsl(17,12%,6%)] mb-8">
            Lo que dicen nuestros usuarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    "Excelente plataforma para conectar con expertos. La calidad de las sesiones es increíble."
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-[hsl(17,12%,6%)] text-sm">Usuario {i}</p>
                      <p className="text-gray-500 text-xs">Cliente verificado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="text-center bg-gradient-to-r from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            ¿Listo para empezar a explorar?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Únete a miles de usuarios que ya han encontrado su mentor ideal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/hosts">
              <Button className="bg-white text-[hsl(188,100%,38%)] hover:bg-gray-100 px-6 py-2 font-semibold">
                Buscar Expertos
              </Button>
            </Link>
            <Button 
              onClick={() => window.location.href = "/login"}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[hsl(188,100%,38%)] px-6 py-2 font-semibold"
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
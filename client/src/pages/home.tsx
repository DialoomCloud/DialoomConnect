import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { FeaturedHostsSection } from "@/components/featured-hosts-section";
import { NewsSection } from "@/components/news-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OnboardingTutorial, useOnboarding } from "@/components/onboarding-tutorial";

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
  const { showOnboarding, handleClose, handleComplete } = useOnboarding();

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
      
      {/* Onboarding Tutorial */}
      <OnboardingTutorial 
        isOpen={showOnboarding}
        onClose={handleClose}
        onComplete={handleComplete}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[hsl(17,12%,6%)] mb-4">
              Conecta con Expertos
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-600 mb-8">
              La plataforma que te conecta con profesionales a través de videollamadas personalizadas
            </h2>
            
            {/* Main CTA */}
            <Link href="/hosts">
              <Button className="bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)] px-8 py-3 text-lg mb-12 hover:shadow-lg transition-all duration-300">
                Buscar Expertos
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured Hosts Section */}
        <FeaturedHostsSection />

        {/* How it Works Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-[hsl(17,12%,6%)] mb-8">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[hsl(188,100%,85%)] transition-colors">
                <Search className="w-8 h-8 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-3">
                Busca Expertos
              </h3>
              <p className="text-gray-600 text-sm">
                Encuentra profesionales en tu área de interés utilizando nuestros filtros avanzados
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[hsl(188,100%,85%)] transition-colors">
                <Calendar className="w-8 h-8 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-3">
                Reserva tu Sesión
              </h3>
              <p className="text-gray-600 text-sm">
                Elige el horario que mejor te convenga y confirma tu cita
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[hsl(188,100%,85%)] transition-colors">
                <Video className="w-8 h-8 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-3">
                Conecta y Aprende
              </h3>
              <p className="text-gray-600 text-sm">
                Disfruta de tu videollamada personalizada con tecnología de alta calidad
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
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-2">
                Expertos Verificados
              </h3>
              <p className="text-gray-600 text-sm">
                Profesionales con experiencia comprobada y perfiles validados
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-2">
                Horarios Flexibles
              </h3>
              <p className="text-gray-600 text-sm">
                Reserva cuando mejor te convenga, 24/7 disponibilidad
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-2">
                Tecnología Avanzada
              </h3>
              <p className="text-gray-600 text-sm">
                Videollamadas de alta calidad con funciones premium
              </p>
            </div>
          </div>
        </div>

        {/* Latest News Section */}
        <NewsSection />

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
        <div className="text-center bg-gradient-to-r from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] rounded-2xl p-8 md:p-12 text-white shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Listo para empezar a explorar?
          </h2>
          <p className="text-lg md:text-xl mb-6 opacity-90 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya han encontrado su mentor ideal en Dialoom
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/hosts">
              <Button className="bg-white text-[hsl(188,100%,38%)] hover:bg-gray-100 px-8 py-3 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Buscar Expertos
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[hsl(188,100%,38%)] px-8 py-3 font-semibold text-lg transition-all duration-300"
              >
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
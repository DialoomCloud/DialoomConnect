import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Video, Clock, Star, CheckCircle, Play, Smartphone, Globe, Heart, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/language-selector";
import { NewsSection } from "@/components/news-section";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function NewLanding() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogin = async () => {
    try {
      // Clear any existing session first
      await fetch('/api/clear-session');
      // Small delay to ensure session is cleared
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 100);
    } catch (error) {
      console.log('Session clear failed, proceeding with login:', error);
      window.location.href = "/api/login";
    }
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/uploads/images/dialoomblue.png"
                  alt="Dialoom" 
                  className="h-10 sm:h-12 w-auto object-contain"
                  style={{ maxWidth: '150px' }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/hosts" className="hidden sm:block">
                <Button variant="ghost" className="text-gray-600 hover:text-primary font-medium">
                  {t('hosts.title')}
                </Button>
              </Link>
              <Link href="/how-it-works" className="hidden sm:block">
                <Button variant="ghost" className="text-gray-600 hover:text-primary font-medium">
                  {t('navigation.howItWorks', 'Cómo funciona')}
                </Button>
              </Link>
              <Button 
                onClick={handleLogin}
                className="bg-primary hover:bg-primary/90 text-white font-medium px-3 sm:px-6 py-2 text-sm sm:text-base"
              >
                <span className="whitespace-nowrap">{t('landing.hero.cta')}</span>
              </Button>
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200 absolute left-0 right-0 top-16 shadow-lg z-40">
            <div className="px-4 py-4 space-y-2">
              <Link href="/hosts" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-primary"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t('hosts.title')}
                </Button>
              </Link>
              
              <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-primary"
                >
                  {t('navigation.howItWorks', 'Cómo funciona')}
                </Button>
              </Link>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  handleLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start bg-primary hover:bg-primary/90 text-white"
              >
                {t('navigation.getStarted', 'Comenzar Ahora')}
              </Button>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('landing.hero.title')}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Button 
                size="lg"
                onClick={handleLogin}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 animate-glow hover-lift"
              >
                <Video className="mr-2 h-5 w-5 flex-shrink-0" />
                <span className="whitespace-nowrap">{t('landing.hero.cta')}</span>
              </Button>
              
              <Link href="/hosts" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold transition-all duration-200"
                >
                  <Globe className="mr-2 h-5 w-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t('landing.hero.searchExperts')}</span>
                </Button>
              </Link>
            </div>


          </div>
        </div>
      </section>

      {/* News Section */}
      <NewsSection />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('landing.features.directAccess.title')}
                </h3>
                <p className="text-gray-600">
                  {t('landing.features.directAccess.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('landing.features.personalizedExperience.title')}
                </h3>
                <p className="text-gray-600">
                  {t('landing.features.personalizedExperience.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('landing.features.securePayment.title')}
                </h3>
                <p className="text-gray-600">
                  {t('landing.features.securePayment.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            
            <blockquote className="text-2xl font-medium text-gray-900 mb-6">
              "{t('landing.testimonial.quote')}"
            </blockquote>
            
            <cite className="text-lg text-gray-600 font-medium">
              — {t('landing.testimonial.author')}
            </cite>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.finalCta.title')}
          </h2>
          
          <p className="text-xl mb-8 opacity-90">
            {t('landing.finalCta.subtitle')}
          </p>
          
          <Button 
            size="lg"
            onClick={handleLogin}
            className="bg-white text-primary hover:bg-gray-100 px-6 py-3 text-lg sm:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 max-w-full"
          >
            <span className="whitespace-nowrap">{t('landing.finalCta.button')}</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
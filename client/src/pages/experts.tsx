import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp, CheckCircle, Star, Video } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/language-selector";

export default function Experts() {
  const { t, i18n } = useTranslation();
  
  const handleLogin = () => {
    window.location.href = "/login";
  };

  const currentLang = i18n.language || 'es';

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src="/uploads/images/dialoomblue.png"
                  alt="Dialoom" 
                  className="h-12 w-auto object-contain"
                  style={{ maxWidth: '200px' }}
                />
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="text-gray-600 hover:text-primary font-medium">
                  {t('navigation.home')}
                </Button>
              </Link>
              <LanguageSelector />
              <Button 
                variant="ghost" 
                onClick={handleLogin}
                className="text-gray-600 hover:text-primary font-medium"
              >
                {currentLang === 'es' ? 'Iniciar Sesión' : currentLang === 'ca' ? 'Iniciar Sessió' : 'Login'}
              </Button>
              <Button 
                onClick={handleLogin}
                className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
              >
                {t('experts.hero.cta')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge 
              variant="secondary" 
              className="mb-4 px-4 py-2 text-sm font-medium bg-green-100 text-green-800 border-green-200"
            >
              {t('experts.hero.commission')}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('experts.hero.title')}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('experts.hero.subtitle')}
            </p>
            
            <Button 
              size="lg"
              onClick={handleLogin}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Video className="mr-2 h-5 w-5" />
              {t('experts.hero.cta')}
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('experts.benefits.title')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('experts.benefits.flexibleIncome.title')}
                </h3>
                <p className="text-gray-600">
                  {t('experts.benefits.flexibleIncome.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('experts.benefits.globalAudience.title')}
                </h3>
                <p className="text-gray-600">
                  {t('experts.benefits.globalAudience.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('experts.benefits.professionalGrowth.title')}
                </h3>
                <p className="text-gray-600">
                  {t('experts.benefits.professionalGrowth.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('experts.howItWorks.title')}
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start mb-8">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-4">
                1
              </div>
              <p className="text-lg text-gray-700">{t('experts.howItWorks.step1')}</p>
            </div>
            <div className="flex items-start mb-8">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-4">
                2
              </div>
              <p className="text-lg text-gray-700">{t('experts.howItWorks.step2')}</p>
            </div>
            <div className="flex items-start mb-8">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-4">
                3
              </div>
              <p className="text-lg text-gray-700">{t('experts.howItWorks.step3')}</p>
            </div>
            <div className="flex items-start mb-8">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-4">
                4
              </div>
              <p className="text-lg text-gray-700">{t('experts.howItWorks.step4')}</p>
            </div>
            <div className="flex items-start mb-8">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-4">
                5
              </div>
              <p className="text-lg text-gray-700">{t('experts.howItWorks.step5')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('experts.finalCta.title')}
          </h2>
          
          <p className="text-xl mb-8 opacity-90">
            {t('experts.finalCta.subtitle')}
          </p>
          
          <Button 
            size="lg"
            onClick={handleLogin}
            className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {t('experts.finalCta.button')}
          </Button>
        </div>
      </section>
    </div>
  );
}
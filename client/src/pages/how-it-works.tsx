import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Search,
  Calendar,
  Video,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  Shield
} from "lucide-react";

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Search,
      title: t('howItWorks.steps.search.title', 'Search Host'),
      description: t(
        'howItWorks.steps.search.description',
        'Use our AI to find the perfect expert for your needs'
      )
    },
    {
      icon: Calendar,
      title: t('howItWorks.steps.schedule.title', 'Schedule Session'),
      description: t(
        'howItWorks.steps.schedule.description',
        'Choose date, time and duration that fits your schedule'
      )
    },
    {
      icon: Video,
      title: t('howItWorks.steps.videocall.title', 'Videocall'),
      description: t(
        'howItWorks.steps.videocall.description',
        'Join the HD video call with advanced communication tools'
      )
    }
  ];

  const benefits = [
    {
      icon: Users,
      title: t('howItWorks.benefits.experts.title', 'Expertos Verificados'),
      description: t('howItWorks.benefits.experts.description', 'Todos nuestros expertos pasan por un proceso de verificación riguroso')
    },
    {
      icon: Clock,
      title: t('howItWorks.benefits.flexible.title', 'Horarios Flexibles'),
      description: t('howItWorks.benefits.flexible.description', 'Programa sesiones que se adapten a tu agenda, 24/7')
    },
    {
      icon: Shield,
      title: t('howItWorks.benefits.secure.title', 'Pagos Seguros'),
      description: t('howItWorks.benefits.secure.description', 'Transacciones protegidas con tecnología de cifrado avanzado')
    }
  ];

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[hsl(17,12%,6%)] mb-6">
            {t('howItWorks.title', 'Cómo Funciona Dialoom')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('howItWorks.subtitle', 'Conectamos a profesionales con expertos de forma rápida, segura y eficiente. Descubre lo fácil que es obtener la ayuda que necesitas.')}
          </p>
        </div>

        {/* Steps Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-[hsl(17,12%,6%)] mb-12">
            {t('howItWorks.stepsTitle', 'En 3 Pasos Simples')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="bg-white border-[hsl(220,13%,90%)] shadow-sm h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full border border-[hsl(188,100%,38%)] flex items-center justify-center mx-auto mb-4 text-[hsl(188,100%,38%)]">
                      <step.icon className="w-8 h-8" />
                    </div>
                    <div className="text-[hsl(188,100%,38%)] font-bold mb-3">{index + 1}</div>
                    <h3 className="font-semibold text-[hsl(17,12%,6%)] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>

                {/* Arrow connector for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-[hsl(188,100%,38%)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-[hsl(17,12%,6%)] mb-12">
            {t('howItWorks.benefitsTitle', 'Por Qué Elegir Dialoom')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-[hsl(188,100%,38%)]" />
                  </div>
                  <CardTitle className="text-xl text-[hsl(17,12%,6%)]">
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-[hsl(188,100%,38%)] to-[hsl(188,80%,42%)] text-white text-center p-12">
          <CardContent className="p-0">
            <h2 className="text-3xl font-bold mb-4">
              {t('howItWorks.cta.title', '¿Listo para Empezar?')}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t('howItWorks.cta.subtitle', 'Únete a miles de profesionales que ya confían en Dialoom')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = "/login"}
                className="bg-white text-[hsl(188,100%,38%)] hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {t('howItWorks.cta.start', 'Comenzar Ahora')}
              </Button>
              <Link href="/hosts">
                <Button 
                  size="lg"
                  className="bg-white text-[hsl(188,100%,38%)] hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {t('howItWorks.cta.explore', 'Explorar Hosts')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

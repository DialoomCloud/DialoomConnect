import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  UserPlus, 
  Search, 
  Calendar, 
  CreditCard, 
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
      icon: UserPlus,
      title: t('howItWorks.steps.register.title', 'Regístrate'),
      description: t('howItWorks.steps.register.description', 'Crea tu cuenta gratuita en Dialoom y completa tu perfil profesional'),
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Search,
      title: t('howItWorks.steps.search.title', 'Busca Expertos'),
      description: t('howItWorks.steps.search.description', 'Utiliza nuestra IA para encontrar el experto perfecto según tus necesidades'),
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Calendar,
      title: t('howItWorks.steps.schedule.title', 'Programa tu Sesión'),
      description: t('howItWorks.steps.schedule.description', 'Selecciona fecha, hora y duración que mejor se adapte a tu horario'),
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: CreditCard,
      title: t('howItWorks.steps.pay.title', 'Pago Seguro'),
      description: t('howItWorks.steps.pay.description', 'Realiza el pago de forma segura con Stripe. Solo pagas cuando la sesión se completa'),
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Video,
      title: t('howItWorks.steps.connect.title', 'Conéctate'),
      description: t('howItWorks.steps.connect.description', 'Únete a la videollamada HD con herramientas avanzadas de comunicación'),
      color: 'bg-red-100 text-red-600'
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
          <Badge className="mb-4 bg-[hsl(188,100%,95%)] text-[hsl(188,100%,38%)] border-[hsl(188,100%,85%)]">
            ✨ {t('howItWorks.badge', 'Proceso Simple')}
          </Badge>
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
            {t('howItWorks.stepsTitle', 'En 5 Pasos Simples')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${step.color}`}>
                      <step.icon className="w-8 h-8" />
                    </div>
                    <div className="bg-[hsl(188,100%,38%)] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-[hsl(17,12%,6%)] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {step.description}
                    </p>
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
                onClick={() => window.location.href = "/api/login"}
                className="bg-white text-[hsl(188,100%,38%)] hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {t('howItWorks.cta.start', 'Comenzar Ahora')}
              </Button>
              <Link href="/hosts">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[hsl(188,100%,38%)] px-8 py-3 text-lg font-semibold"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {t('howItWorks.cta.explore', 'Explorar Expertos')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}
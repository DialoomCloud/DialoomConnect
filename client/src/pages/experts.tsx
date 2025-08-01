import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp, CheckCircle, Star, Video } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function Experts() {
  const { t, i18n } = useTranslation();
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const currentLang = i18n.language || 'es';

  const content = {
    es: {
      hero: {
        title: "Conviértete en experto en Dialoom",
        subtitle: "Monetiza tu conocimiento y conecta con personas que necesitan tu experiencia",
        cta: "Comenzar como experto",
        commission: "Solo 10% de comisión"
      },
      benefits: {
        title: "Beneficios de ser experto",
        items: [
          {
            title: "Ingresos flexibles",
            description: "Establece tus propias tarifas y horarios. Gana dinero compartiendo tu expertise.",
            icon: <DollarSign className="h-6 w-6 text-green-600" />
          },
          {
            title: "Audiencia global",
            description: "Accede a usuarios de todo el mundo que buscan tu conocimiento específico.",
            icon: <Users className="h-6 w-6 text-blue-600" />
          },
          {
            title: "Crecimiento profesional",
            description: "Construye tu reputación y expande tu red profesional internacional.",
            icon: <TrendingUp className="h-6 w-6 text-purple-600" />
          }
        ]
      },
      howItWorks: {
        title: "Cómo funciona para expertos",
        steps: [
          "Crea tu perfil completo con tu experiencia",
          "Establece tus tarifas y disponibilidad",
          "Recibe solicitudes de videollamadas",
          "Conecta y comparte tu conocimiento",
          "Recibe pagos automáticamente"
        ]
      },
      requirements: {
        title: "Requisitos",
        items: [
          "Experiencia demostrable en tu área",
          "Conexión estable a internet",
          "Cámara y micrófono de calidad",
          "Disponibilidad mínima de 5 horas semanales"
        ]
      },
      commission: {
        title: "Estructura de comisión",
        description: "Mantenemos solo un 10% de comisión para mantener la plataforma. El 90% restante es tuyo.",
        features: [
          "Pagos automáticos cada semana",
          "Transferencias directas a tu cuenta",
          "Facturas automáticas generadas",
          "Panel de control de ingresos"
        ]
      }
    },
    en: {
      hero: {
        title: "Become an expert on Dialoom",
        subtitle: "Monetize your knowledge and connect with people who need your expertise",
        cta: "Start as an expert",
        commission: "Only 10% commission"
      },
      benefits: {
        title: "Benefits of being an expert",
        items: [
          {
            title: "Flexible income",
            description: "Set your own rates and schedules. Earn money sharing your expertise.",
            icon: <DollarSign className="h-6 w-6 text-green-600" />
          },
          {
            title: "Global audience",
            description: "Access users from around the world looking for your specific knowledge.",
            icon: <Users className="h-6 w-6 text-blue-600" />
          },
          {
            title: "Professional growth",
            description: "Build your reputation and expand your international professional network.",
            icon: <TrendingUp className="h-6 w-6 text-purple-600" />
          }
        ]
      },
      howItWorks: {
        title: "How it works for experts",
        steps: [
          "Create your complete profile with your experience",
          "Set your rates and availability",
          "Receive video call requests",
          "Connect and share your knowledge",
          "Receive payments automatically"
        ]
      },
      requirements: {
        title: "Requirements",
        items: [
          "Demonstrable experience in your area",
          "Stable internet connection",
          "Quality camera and microphone",
          "Minimum availability of 5 hours per week"
        ]
      },
      commission: {
        title: "Commission structure",
        description: "We keep only 10% commission to maintain the platform. The remaining 90% is yours.",
        features: [
          "Automatic payments every week",
          "Direct transfers to your account",
          "Automatically generated invoices",
          "Income control panel"
        ]
      }
    }
  };

  const text = content[currentLang as keyof typeof content] || content.es;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <img 
                  src="/uploads/images/dialoomblue.png"
                  alt="Dialoom" 
                  className="h-8 w-auto object-contain cursor-pointer"
                  style={{ maxWidth: '140px' }}
                />
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="text-gray-600 hover:text-primary font-medium">
                  {currentLang === 'es' ? 'Inicio' : 'Home'}
                </Button>
              </Link>
              <Button 
                onClick={handleLogin}
                className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
              >
                {text.hero.cta}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-green-100 text-green-800 text-sm px-4 py-2">
              {text.hero.commission}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {text.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              {text.hero.subtitle}
            </p>
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 text-lg"
            >
              {text.hero.cta}
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {text.benefits.title}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {text.benefits.items.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {text.howItWorks.title}
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {text.howItWorks.steps.map((step, index) => (
              <div key={index} className="flex items-start mb-8">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-4">
                  {index + 1}
                </div>
                <p className="text-lg text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                {text.requirements.title}
              </h2>
              <ul className="space-y-4">
                {text.requirements.items.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  {text.commission.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">{text.commission.description}</p>
                <ul className="space-y-3 text-left">
                  {text.commission.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {currentLang === 'es' 
              ? '¿Listo para comenzar?' 
              : 'Ready to get started?'
            }
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {currentLang === 'es' 
              ? 'Únete a nuestra comunidad de expertos y comienza a monetizar tu conocimiento hoy mismo'
              : 'Join our community of experts and start monetizing your knowledge today'
            }
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
          >
            {text.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
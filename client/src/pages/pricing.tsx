import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Video, Mic, FileText, MonitorSpeaker } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/language-selector";

export default function Pricing() {
  const { t, i18n } = useTranslation();
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const currentLang = i18n.language || 'es';

  const content = {
    es: {
      hero: {
        title: "Precios transparentes",
        subtitle: "Elige la duración perfecta para tu sesión con hosts"
      },
      baseSession: {
        title: "Sesiones base",
        description: "Tarifas establecidas por cada host"
      },
      addOns: {
        title: "Servicios adicionales",
        description: "Mejora tu experiencia con estos servicios opcionales",
        services: [
          {
            name: "Compartir pantalla",
            price: "10",
            description: "El host puede compartir su pantalla contigo",
            icon: <MonitorSpeaker className="h-6 w-6" />
          },
          {
            name: "Traducción en tiempo real",
            price: "25", 
            description: "Servicio de traducción automática durante la llamada",
            icon: <Mic className="h-6 w-6" />
          },
          {
            name: "Grabación de sesión",
            price: "10",
            description: "Graba tu sesión para revisarla más tarde",
            icon: <Video className="h-6 w-6" />
          },
          {
            name: "Transcripción automática",
            price: "5",
            description: "Transcripción automática de toda la conversación",
            icon: <FileText className="h-6 w-6" />
          }
        ]
      },
      features: {
        title: "Incluido en todas las sesiones",
        items: [
          "Videollamada HD de calidad",
          "Chat en tiempo real",
          "Soporte técnico 24/7",
          "Garantía de satisfacción",
          "Facturación automática",
          "Reembolso si el host no se conecta"
        ]
      },
      faq: {
        title: "Preguntas frecuentes",
        items: [
          {
            question: "¿Cuándo se cobra el pago?",
            answer: "El pago se procesa al confirmar la reserva. Si el host no se conecta, se reembolsa automáticamente."
          },
          {
            question: "¿Puedo cancelar una sesión?",
            answer: "Sí, puedes cancelar hasta 24 horas antes de la sesión para obtener un reembolso completo."
          },
          {
            question: "¿Hay tarifas adicionales?",
            answer: "No hay tarifas ocultas. Solo pagas el precio de la sesión más los servicios adicionales que elijas."
          }
        ]
      }
    },
    en: {
      hero: {
        title: "Transparent pricing",
        subtitle: "Choose the perfect duration for your host sessions"
      },
      baseSession: {
        title: "Base sessions",
        description: "Rates set by each host"
      },
      addOns: {
        title: "Additional services",
        description: "Enhance your experience with these optional services",
        services: [
          {
            name: "Screen sharing",
            price: "10",
            description: "Host can share their screen with you",
            icon: <MonitorSpeaker className="h-6 w-6" />
          },
          {
            name: "Real-time translation",
            price: "25",
            description: "Automatic translation service during the call",
            icon: <Mic className="h-6 w-6" />
          },
          {
            name: "Session recording",
            price: "10",
            description: "Record your session to review later",
            icon: <Video className="h-6 w-6" />
          },
          {
            name: "Automatic transcription",
            price: "5",
            description: "Automatic transcription of the entire conversation",
            icon: <FileText className="h-6 w-6" />
          }
        ]
      },
      features: {
        title: "Included in all sessions",
        items: [
          "HD quality video call",
          "Real-time chat",
          "24/7 technical support",
          "Satisfaction guarantee",
          "Automatic billing",
          "Refund if host doesn't connect"
        ]
      },
      faq: {
        title: "Frequently asked questions",
        items: [
          {
            question: "When is payment charged?",
            answer: "Payment is processed when confirming the booking. If the host doesn't connect, it's automatically refunded."
          },
          {
            question: "Can I cancel a session?",
            answer: "Yes, you can cancel up to 24 hours before the session for a full refund."
          },
          {
            question: "Are there additional fees?",
            answer: "There are no hidden fees. You only pay the session price plus any additional services you choose."
          }
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
              <Link href="/hosts">
                <Button variant="ghost" className="text-gray-600 hover:text-primary font-medium">
                  {currentLang === 'es' ? 'Expertos' : 'Experts'}
                </Button>
              </Link>
              <LanguageSelector />
              <Button 
                onClick={handleLogin}
                className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
              >
                {currentLang === 'es' ? 'Comenzar' : 'Get Started'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {text.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              {text.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Base Sessions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {text.baseSession.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {text.baseSession.description}
            </p>
          </div>
          
          <Card className="max-w-2xl mx-auto border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-primary">
                {currentLang === 'es' ? 'Precio por host' : 'Price per host'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-4xl font-bold text-gray-900 mb-4">
                {currentLang === 'es' ? 'Variable' : 'Variable'}
              </p>
              <p className="text-gray-600 mb-6">
                {currentLang === 'es' 
                  ? 'Cada host establece sus propias tarifas según su experiencia y especialización'
                  : 'Each host sets their own rates based on their experience and specialization'
                }
              </p>
              <Badge className="bg-primary/10 text-primary px-4 py-2">
                {currentLang === 'es' ? 'Desde €20/sesión' : 'From €20/session'}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {text.addOns.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {text.addOns.description}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {text.addOns.services.map((service, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                    <span className="text-primary">{service.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-3">€{service.price}</p>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {text.features.title}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {text.features.items.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {text.faq.title}
            </h2>
          </div>
          
          <div className="space-y-6">
            {text.faq.items.map((item, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {item.question}
                  </h3>
                  <p className="text-gray-600">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {currentLang === 'es' 
              ? '¿Listo para conectar con un host?' 
              : 'Ready to connect with a host?'
            }
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {currentLang === 'es' 
              ? 'Encuentra el host perfecto para ti y reserva tu primera sesión'
              : 'Find the perfect host for you and book your first session'
            }
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
          >
            {currentLang === 'es' ? 'Buscar hosts' : 'Find hosts'}
          </Button>
        </div>
      </section>
    </div>
  );
}
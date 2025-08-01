import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Video, Clock, Star, CheckCircle, Play, Smartphone, Globe, Heart } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function NewLanding() {
  const { t, i18n } = useTranslation();
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const currentLang = i18n.language || 'es';

  const content = {
    es: {
      hero: {
        title: "Habla cara a cara con la persona que más admiras",
        subtitle: "Videollamadas 1-a-1 con expertos, creadores e ídolos en menos de 60 segundos.",
        cta: "Reserva tu primera llamada",
        ctaSecondary: "Ver cómo funciona"
      },
      howItWorks: {
        title: "¿Cómo funciona?",
        subtitle: "Conecta con expertos en 3 simples pasos",
        steps: [
          {
            number: "1",
            title: "Encuentra",
            description: "Busca y encuentra el experto perfecto para ti",
            icon: <Users className="h-8 w-8" />
          },
          {
            number: "2", 
            title: "Reserva",
            description: "Reserva tu slot y paga de forma segura con Stripe",
            icon: <Clock className="h-8 w-8" />
          },
          {
            number: "3",
            title: "Conéctate",
            description: "Conéctate y recibe consejos en directo",
            icon: <Video className="h-8 w-8" />
          }
        ]
      },
      forWho: {
        title: "Para quién",
        subtitle: "Perfecto para diferentes necesidades",
        segments: [
          {
            title: "Fans",
            description: "Fans que sueñan con conocer a su artista favorito",
            icon: <Heart className="h-6 w-6" />
          },
          {
            title: "Profesionales", 
            description: "Profesionales que buscan mentoría especializada",
            icon: <Users className="h-6 w-6" />
          },
          {
            title: "Creadores",
            description: "Creadores que desean monetizar su expertise",
            icon: <Star className="h-6 w-6" />
          }
        ]
      },
      benefits: {
        title: "Beneficios clave",
        subtitle: "¿Por qué elegir Dialoom?",
        items: [
          {
            title: "Acceso directo y sin intermediarios",
            description: "Conecta directamente con expertos sin complicaciones",
            icon: <CheckCircle className="h-6 w-6 text-green-600" />
          },
          {
            title: "Experiencia personalizada",
            description: "Cada llamada está adaptada a tus necesidades específicas",
            icon: <CheckCircle className="h-6 w-6 text-green-600" />
          },
          {
            title: "Pago seguro y reembolso garantizado",
            description: "Tecnología Stripe con garantía de satisfacción",
            icon: <CheckCircle className="h-6 w-6 text-green-600" />
          }
        ]
      },
      testimonial: {
        quote: "Me ahorré 14 000 € gracias a los consejos del diseñador Shawn H.",
        author: "Erika P., LA"
      },
      finalCta: {
        title: "¿Listo para conectar?",
        subtitle: "Únete a miles de usuarios que ya han encontrado a su experto ideal",
        button: "Reserva tu primera llamada ya"
      }
    },
    en: {
      hero: {
        title: "Talk face-to-face with the person you admire most",
        subtitle: "1-on-1 video calls with experts, creators and idols in less than 60 seconds.",
        cta: "Book your first call",
        ctaSecondary: "See how it works"
      },
      howItWorks: {
        title: "How it works?",
        subtitle: "Connect with experts in 3 simple steps",
        steps: [
          {
            number: "1",
            title: "Find",
            description: "Search and find the perfect expert for you",
            icon: <Users className="h-8 w-8" />
          },
          {
            number: "2",
            title: "Book", 
            description: "Reserve your slot and pay securely with Stripe",
            icon: <Clock className="h-8 w-8" />
          },
          {
            number: "3",
            title: "Connect",
            description: "Connect and receive live advice",
            icon: <Video className="h-8 w-8" />
          }
        ]
      },
      forWho: {
        title: "For whom",
        subtitle: "Perfect for different needs",
        segments: [
          {
            title: "Fans",
            description: "Fans who dream of meeting their favorite artist",
            icon: <Heart className="h-6 w-6" />
          },
          {
            title: "Professionals",
            description: "Professionals seeking specialized mentorship", 
            icon: <Users className="h-6 w-6" />
          },
          {
            title: "Creators",
            description: "Creators who want to monetize their expertise",
            icon: <Star className="h-6 w-6" />
          }
        ]
      },
      benefits: {
        title: "Key benefits",
        subtitle: "Why choose Dialoom?",
        items: [
          {
            title: "Direct access without intermediaries",
            description: "Connect directly with experts without complications",
            icon: <CheckCircle className="h-6 w-6 text-green-600" />
          },
          {
            title: "Personalized experience",
            description: "Each call is tailored to your specific needs",
            icon: <CheckCircle className="h-6 w-6 text-green-600" />
          },
          {
            title: "Secure payment and guaranteed refund",
            description: "Stripe technology with satisfaction guarantee",
            icon: <CheckCircle className="h-6 w-6 text-green-600" />
          }
        ]
      },
      testimonial: {
        quote: "I saved €14,000 thanks to designer Shawn H.'s advice.",
        author: "Erika P., LA"
      },
      finalCta: {
        title: "Ready to connect?",
        subtitle: "Join thousands of users who have already found their ideal expert",
        button: "Book your first call now"
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
              <Link href="/hosts">
                <Button variant="ghost" className="text-gray-600 hover:text-primary font-medium">
                  {currentLang === 'es' ? 'Expertos' : 'Experts'}
                </Button>
              </Link>
              <Link href="/news">
                <Button variant="ghost" className="text-gray-600 hover:text-primary font-medium">
                  {currentLang === 'es' ? 'Blog' : 'Blog'}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleLogin}
                className="text-gray-600 hover:text-primary font-medium"
              >
                {currentLang === 'es' ? 'Iniciar Sesión' : 'Login'}
              </Button>
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
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {text.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              {text.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={handleLogin}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 text-lg"
              >
                {text.hero.cta}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 font-semibold px-8 py-4 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                {text.hero.ctaSecondary}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {text.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {text.howItWorks.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {text.howItWorks.steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                  <span className="text-primary font-bold text-xl">{step.number}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Who */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {text.forWho.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {text.forWho.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {text.forWho.segments.map((segment, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-6">
                    <span className="text-primary">{segment.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{segment.title}</h3>
                  <p className="text-gray-600">{segment.description}</p>
                </CardContent>
              </Card>
            ))}
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
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {text.benefits.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {text.benefits.items.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-8 italic">
            "{text.testimonial.quote}"
          </blockquote>
          <cite className="text-lg text-gray-600 font-medium">
            — {text.testimonial.author}
          </cite>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {text.finalCta.title}
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {text.finalCta.subtitle}
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
          >
            {text.finalCta.button}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/uploads/images/dialoomblue.png"
                alt="Dialoom" 
                className="h-8 w-auto object-contain mb-4 filter brightness-0 invert"
              />
              <p className="text-gray-400">
                {currentLang === 'es' 
                  ? 'Conecta con expertos y creadores de todo el mundo'
                  : 'Connect with experts and creators worldwide'
                }
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">
                {currentLang === 'es' ? 'Producto' : 'Product'}
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/hosts" className="hover:text-white transition-colors">
                  {currentLang === 'es' ? 'Buscar Expertos' : 'Find Experts'}
                </Link></li>
                <li><Link href="/news" className="hover:text-white transition-colors">
                  {currentLang === 'es' ? 'Blog' : 'Blog'}
                </Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">
                {currentLang === 'es' ? 'Legal' : 'Legal'}
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">
                  {currentLang === 'es' ? 'Privacidad' : 'Privacy'}
                </Link></li>
                <li><Link href="/legal/terms" className="hover:text-white transition-colors">
                  {currentLang === 'es' ? 'Términos' : 'Terms'}
                </Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">
                {currentLang === 'es' ? 'Contacto' : 'Contact'}
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">
                  {currentLang === 'es' ? 'Ayuda' : 'Help'}
                </Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Dialoom. {currentLang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
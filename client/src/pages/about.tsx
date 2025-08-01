import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Globe, Target } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t, i18n } = useTranslation();
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const currentLang = i18n.language || 'es';

  const content = {
    es: {
      hero: {
        title: "Sobre Dialoom",
        subtitle: "Nuestra misión es acercar a todo el mundo a quien admira"
      },
      mission: {
        title: "Nuestra misión",
        description: "Creemos que el conocimiento y la inspiración no deberían tener barreras. Dialoom conecta directamente a personas con los expertos, creadores e ídolos que más admiran, creando oportunidades únicas de aprendizaje y crecimiento personal."
      },
      values: {
        title: "Nuestros valores",
        items: [
          {
            title: "Accesibilidad",
            description: "Hacemos que la experiencia de conectar con expertos sea simple y accesible para todos",
            icon: <Users className="h-8 w-8 text-primary" />
          },
          {
            title: "Autenticidad",
            description: "Promovemos conexiones reales y auténticas entre personas apasionadas",
            icon: <Heart className="h-8 w-8 text-red-500" />
          },
          {
            title: "Globalidad",
            description: "Rompemos barreras geográficas para crear una comunidad mundial de conocimiento",
            icon: <Globe className="h-8 w-8 text-blue-500" />
          },
          {
            title: "Propósito",
            description: "Cada conexión tiene el potencial de cambiar vidas y crear impacto positivo",
            icon: <Target className="h-8 w-8 text-green-500" />
          }
        ]
      },
      story: {
        title: "Nuestra historia",
        description: "Dialoom nació de la idea simple pero poderosa de que todos merecemos acceso directo a las personas que nos inspiran. En un mundo cada vez más conectado, aún existían barreras para acceder a mentores, expertos y figuras que admiramos. Decidimos cambiar eso."
      },
      team: {
        title: "Nuestro equipo",
        description: "Somos un equipo apasionado de tecnólogos, diseñadores y visionarios comprometidos con democratizar el acceso al conocimiento y la inspiración."
      },
      impact: {
        title: "Nuestro impacto",
        stats: [
          { number: "10K+", label: "Usuarios activos" },
          { number: "500+", label: "Expertos verificados" },
          { number: "25K+", label: "Sesiones completadas" },
          { number: "50+", label: "Países representados" }
        ]
      }
    },
    en: {
      hero: {
        title: "About Dialoom",
        subtitle: "Our mission is to bring everyone closer to who they admire"
      },
      mission: {
        title: "Our mission",
        description: "We believe that knowledge and inspiration shouldn't have barriers. Dialoom directly connects people with the experts, creators and idols they admire most, creating unique opportunities for learning and personal growth."
      },
      values: {
        title: "Our values",
        items: [
          {
            title: "Accessibility",
            description: "We make the experience of connecting with experts simple and accessible for everyone",
            icon: <Users className="h-8 w-8 text-primary" />
          },
          {
            title: "Authenticity",
            description: "We promote real and authentic connections between passionate people",
            icon: <Heart className="h-8 w-8 text-red-500" />
          },
          {
            title: "Globality",
            description: "We break geographical barriers to create a worldwide knowledge community",
            icon: <Globe className="h-8 w-8 text-blue-500" />
          },
          {
            title: "Purpose",
            description: "Every connection has the potential to change lives and create positive impact",
            icon: <Target className="h-8 w-8 text-green-500" />
          }
        ]
      },
      story: {
        title: "Our story",
        description: "Dialoom was born from the simple but powerful idea that we all deserve direct access to the people who inspire us. In an increasingly connected world, there were still barriers to accessing mentors, experts and figures we admire. We decided to change that."
      },
      team: {
        title: "Our team",
        description: "We are a passionate team of technologists, designers and visionaries committed to democratizing access to knowledge and inspiration."
      },
      impact: {
        title: "Our impact",
        stats: [
          { number: "10K+", label: "Active users" },
          { number: "500+", label: "Verified experts" },
          { number: "25K+", label: "Completed sessions" },
          { number: "50+", label: "Countries represented" }
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

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {text.mission.title}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {text.mission.description}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {text.values.title}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {text.values.items.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 shadow-md">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {text.story.title}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {text.story.description}
          </p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {text.impact.title}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {text.impact.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-lg text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {text.team.title}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {text.team.description}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {currentLang === 'es' 
              ? '¿Listo para ser parte de nuestra misión?' 
              : 'Ready to be part of our mission?'
            }
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {currentLang === 'es' 
              ? 'Únete a miles de personas que ya están conectando con sus expertos ideales'
              : 'Join thousands of people who are already connecting with their ideal experts'
            }
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
          >
            {currentLang === 'es' ? 'Comenzar ahora' : 'Start now'}
          </Button>
        </div>
      </section>
    </div>
  );
}
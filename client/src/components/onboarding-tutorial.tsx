import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, Search, Users, Calendar, Video, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  action?: string;
  icon: React.ReactNode;
  position: 'center' | 'bottom' | 'top' | 'left' | 'right';
}

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingTutorial({ isOpen, onClose, onComplete }: OnboardingTutorialProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isOpen);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bienvenido a Dialoom',
      description: 'Te guiaremos paso a paso para que descubras todas las funcionalidades de nuestra plataforma.',
      icon: <CheckCircle className="w-8 h-8 text-[hsl(188,100%,38%)]" />,
      position: 'center'
    },
    {
      id: 'search',
      title: 'Busca Expertos',
      description: 'Utiliza nuestros filtros avanzados para encontrar el profesional perfecto para tus necesidades.',
      target: '[href="/hosts"]',
      action: 'Buscar ahora',
      icon: <Search className="w-8 h-8 text-[hsl(188,100%,38%)]" />,
      position: 'bottom'
    },
    {
      id: 'filters',
      title: 'Filtros Inteligentes',
      description: 'Filtra por categoría, habilidades, idioma, precio y propósito para encontrar exactamente lo que buscas.',
      icon: <Users className="w-8 h-8 text-[hsl(188,100%,38%)]" />,
      position: 'center'
    },
    {
      id: 'booking',
      title: 'Reserva Sesiones',
      description: 'Una vez que encuentres tu experto, puedes reservar sesiones de video directamente desde su perfil.',
      icon: <Calendar className="w-8 h-8 text-[hsl(188,100%,38%)]" />,
      position: 'center'
    },
    {
      id: 'video',
      title: 'Videollamadas de Calidad',
      description: 'Conecta con expertos a través de videollamadas HD con opciones adicionales como grabación y traducción.',
      icon: <Video className="w-8 h-8 text-[hsl(188,100%,38%)]" />,
      position: 'center'
    }
  ];

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const currentStepData = steps[currentStep];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('dialoom_onboarding_completed', 'true');
    setIsVisible(false);
    onComplete();
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSkip = () => {
    localStorage.setItem('dialoom_onboarding_completed', 'true');
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="bg-white shadow-2xl border-0 animate-fade-in-up">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-gray-100"
              onClick={handleSkip}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <div className="flex justify-center mb-4">
              {currentStepData.icon}
            </div>
            
            <CardTitle className="text-xl font-bold text-[hsl(17,12%,6%)]">
              {currentStepData.title}
            </CardTitle>
            
            <div className="flex justify-center gap-2 mt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-[hsl(188,100%,38%)]' 
                      : index < currentStep 
                        ? 'bg-[hsl(188,100%,60%)]' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-gray-600 text-center leading-relaxed">
              {currentStepData.description}
            </p>

            {currentStepData.action && (
              <div className="flex justify-center">
                <Link href="/hosts">
                  <Button 
                    className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] text-white"
                    onClick={handleNext}
                  >
                    {currentStepData.action}
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <Badge variant="secondary" className="px-3 py-1">
                {currentStep + 1} de {steps.length}
              </Badge>

              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleComplete}
                  className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] text-white flex items-center gap-2"
                >
                  Completar
                  <CheckCircle className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] text-white flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={handleSkip}
                className="text-gray-500 text-sm"
              >
                Saltar tutorial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('dialoom_onboarding_completed');
    if (!hasCompletedOnboarding) {
      // Show onboarding after a brief delay
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowOnboarding(false);
  };

  const handleComplete = () => {
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    handleClose,
    handleComplete
  };
}
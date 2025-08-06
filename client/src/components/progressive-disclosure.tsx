import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Lightbulb, X } from "lucide-react";

interface DisclosureStep {
  id: string;
  trigger: string; // CSS selector or event
  title: string;
  description: string;
  action?: string;
  delay?: number;
}

interface ProgressiveDisclosureProps {
  steps: DisclosureStep[];
  onComplete?: () => void;
}

export function ProgressiveDisclosure({ steps, onComplete }: ProgressiveDisclosureProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    // Load completed steps from localStorage
    const completed = JSON.parse(localStorage.getItem('dialoom_progressive_steps') || '[]');
    setCompletedSteps(completed);
  }, []);

  useEffect(() => {
    if (currentStep >= steps.length) {
      onComplete?.();
      return;
    }

    const step = steps[currentStep];
    
    // Skip if already completed
    if (completedSteps.includes(step.id)) {
      setCurrentStep(currentStep + 1);
      return;
    }

    const checkTrigger = () => {
      if (step.trigger.startsWith('selector:')) {
        const selector = step.trigger.replace('selector:', '');
        const element = document.querySelector(selector);
        if (element) {
          showStep();
        }
      } else if (step.trigger.startsWith('event:')) {
        // Handle custom events
        const eventName = step.trigger.replace('event:', '');
        const handleEvent = () => showStep();
        document.addEventListener(eventName, handleEvent);
        return () => document.removeEventListener(eventName, handleEvent);
      } else if (step.trigger === 'immediate') {
        showStep();
      }
    };

    const showStep = () => {
      setTimeout(() => {
        setIsVisible(true);
      }, step.delay || 0);
    };

    return checkTrigger();
  }, [currentStep, steps, completedSteps]);

  const handleStepComplete = () => {
    const step = steps[currentStep];
    const updated = [...completedSteps, step.id];
    setCompletedSteps(updated);
    localStorage.setItem('dialoom_progressive_steps', JSON.stringify(updated));
    
    setIsVisible(false);
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
    }, 300);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setCurrentStep(currentStep + 1);
  };

  if (!isVisible || currentStep >= steps.length) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-in-right">
      <Card className="bg-white shadow-xl border border-[hsl(188,100%,38%)] overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              Consejo {currentStep + 1}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 -mt-1 -mr-1"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Lightbulb className="w-5 h-5 text-[hsl(188,100%,38%)]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[hsl(17,12%,6%)] mb-2">
                {step.title}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                {step.description}
              </p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleStepComplete}
                  className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] text-white flex items-center gap-2"
                >
                  {step.action || 'Entendido'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-gray-500"
                >
                  Omitir
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Predefined disclosure sequences for common user flows
export const ONBOARDING_SEQUENCES = {
  hostSearch: [
    {
      id: 'welcome_search',
      trigger: 'selector:[href="/hosts"]',
      title: '¡Excelente elección!',
      description: 'Aquí encontrarás a todos nuestros expertos verificados. Usa los filtros para encontrar exactamente lo que necesitas.',
      action: 'Explorar'
    },
    {
      id: 'use_filters',
      trigger: 'selector:.filter-container',
      title: 'Filtros Inteligentes',
      description: 'Ajusta el precio, selecciona categorías y propósitos para encontrar el experto perfecto para ti.',
      delay: 2000
    },
    {
      id: 'ai_search',
      trigger: 'selector:.ai-search-input',
      title: 'Búsqueda IA',
      description: 'Describe lo que necesitas en lenguaje natural y nuestro AI encontrará los mejores matches.',
      delay: 1000
    }
  ],
  
  profile: [
    {
      id: 'view_profile',
      trigger: 'event:profile_viewed',
      title: 'Perfil del Experto',
      description: 'Aquí puedes ver toda la información del experto: experiencia, reseñas y disponibilidad.',
    },
    {
      id: 'book_session',
      trigger: 'selector:.booking-button',
      title: 'Reservar Sesión',
      description: 'Haz clic aquí para reservar una videollamada con este experto.',
      delay: 3000
    }
  ]
};
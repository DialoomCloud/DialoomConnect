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

// Cooldown to avoid showing the same tip repeatedly (5 minutes)
const STEP_COOLDOWN_MS = 5 * 60 * 1000;

export function ProgressiveDisclosure({ steps, onComplete }: ProgressiveDisclosureProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load completed steps with timestamps from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('dialoom_progressive_steps') || '{}');
      const now = Date.now();
      const valid: Record<string, number> = {};
      Object.entries(stored).forEach(([id, ts]) => {
        if (typeof ts === 'number' && now - ts < STEP_COOLDOWN_MS) {
          valid[id] = ts;
        }
      });
      setCompletedSteps(valid);
      localStorage.setItem('dialoom_progressive_steps', JSON.stringify(valid));
      console.log('Progressive Disclosure: Loaded completed steps:', valid);
    } catch (error) {
      console.warn('Progressive Disclosure: Error loading completed steps:', error);
      setCompletedSteps({});
    }
  }, []);

  useEffect(() => {
    if (currentStep >= steps.length) {
      onComplete?.();
      return;
    }

    const step = steps[currentStep];
    
    // Skip if already shown recently
    const lastShown = completedSteps[step.id];
    if (lastShown && Date.now() - lastShown < STEP_COOLDOWN_MS) {
      console.log('Progressive Disclosure: Skipping recently shown step:', step.id);
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
        const now = Date.now();
        const updated = { ...completedSteps, [step.id]: now };
        setCompletedSteps(updated);
        try {
          localStorage.setItem('dialoom_progressive_steps', JSON.stringify(updated));
        } catch (error) {
          console.warn('Progressive Disclosure: Error saving step timestamp:', error);
        }
        setIsVisible(true);
      }, step.delay || 0);
    };

    return checkTrigger();
  }, [currentStep, steps, completedSteps]);

  const handleStepComplete = () => {
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
      trigger: 'immediate',
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

// Utility function to reset all completed steps (useful for development/testing)
export const resetProgressiveDisclosure = () => {
  try {
    localStorage.removeItem('dialoom_progressive_steps');
    console.log('Progressive Disclosure: All completed steps reset');
    return true;
  } catch (error) {
    console.warn('Progressive Disclosure: Error resetting steps:', error);
    return false;
  }
};

// Utility function to get all completed steps
export const getCompletedSteps = () => {
  try {
    return JSON.parse(localStorage.getItem('dialoom_progressive_steps') || '{}');
  } catch (error) {
    console.warn('Progressive Disclosure: Error getting completed steps:', error);
    return {};
  }
};
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Lightbulb } from "lucide-react";

interface FeatureHighlightProps {
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  isVisible: boolean;
  onClose: () => void;
}

export function FeatureHighlight({ 
  targetSelector, 
  title, 
  description, 
  position = 'bottom',
  isVisible,
  onClose 
}: FeatureHighlightProps) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    const findTarget = () => {
      const element = document.querySelector(targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);
        updateHighlightPosition(element);
      }
    };

    const updateHighlightPosition = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      setHighlightStyle({
        position: 'absolute',
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height,
        pointerEvents: 'none',
        zIndex: 9999
      });
    };

    // Find target initially
    findTarget();

    // Set up observer for dynamic content
    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });

    // Update position on scroll/resize
    const handleResize = () => {
      if (targetElement) {
        updateHighlightPosition(targetElement);
      }
    };

    window.addEventListener('scroll', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [targetSelector, isVisible, targetElement]);

  if (!isVisible || !targetElement) return null;

  const getTooltipPosition = () => {
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    switch (position) {
      case 'top':
        return {
          top: rect.top + scrollTop - 10,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: rect.bottom + scrollTop + 10,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: rect.top + scrollTop + rect.height / 2,
          left: rect.left + scrollLeft - 10,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: rect.top + scrollTop + rect.height / 2,
          left: rect.right + scrollLeft + 10,
          transform: 'translate(0, -50%)'
        };
      default:
        return {
          top: rect.bottom + scrollTop + 10,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
    }
  };

  return (
    <>
      {/* Dark overlay */}
      <div 
        className="fixed inset-0 bg-black/30 z-[9998]"
        onClick={onClose}
      />
      
      {/* Highlight border */}
      <div
        style={{
          ...highlightStyle,
          border: '2px solid hsl(188, 100%, 38%)',
          borderRadius: '8px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
        }}
      />
      
      {/* Tooltip */}
      <Card
        ref={tooltipRef}
        className="fixed z-[9999] bg-white shadow-xl border-0 max-w-xs animate-fade-in-up"
        style={getTooltipPosition()}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-[hsl(188,100%,38%)]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[hsl(17,12%,6%)] mb-1">
                {title}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {description}
              </p>
              <Button
                size="sm"
                onClick={onClose}
                className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] text-white w-full"
              >
                Entendido
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 -mt-1 -mr-1"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
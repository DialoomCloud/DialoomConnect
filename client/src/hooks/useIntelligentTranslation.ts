import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface UseIntelligentTranslationProps {
  description?: string;
  hostId?: string;
  enabled?: boolean;
}

interface TranslationResponse {
  translatedDescription: string;
  wasTranslated: boolean;
}

export function useIntelligentTranslation({
  description,
  hostId,
  enabled = true
}: UseIntelligentTranslationProps) {
  const [translatedDescription, setTranslatedDescription] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [wasTranslated, setWasTranslated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateDescription = useCallback(async () => {
    if (!description || !hostId || !enabled || description.trim().length < 5) {
      setTranslatedDescription(description || '');
      setWasTranslated(false);
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/translate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          hostId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TranslationResponse = await response.json();
      setTranslatedDescription(data.translatedDescription || description);
      setWasTranslated(data.wasTranslated || false);
    } catch (err) {
      console.error('Error translating description:', err);
      setError(err instanceof Error ? err.message : 'Translation error');
      // Fallback to original description on error
      setTranslatedDescription(description);
      setWasTranslated(false);
    } finally {
      setIsTranslating(false);
    }
  }, [description, hostId, enabled]);

  useEffect(() => {
    if (description && hostId && enabled && description.trim().length >= 5) {
      // Add a small delay to prevent rapid successive calls
      const timer = setTimeout(() => {
        translateDescription();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setTranslatedDescription(description || '');
      setWasTranslated(false);
    }
  }, [description, hostId, enabled]);

  return {
    translatedDescription: translatedDescription || description || '',
    isTranslating,
    wasTranslated,
    error,
    retryTranslation: translateDescription
  };
}
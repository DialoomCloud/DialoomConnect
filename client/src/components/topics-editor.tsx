import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TopicsEditorProps {
  topics: string[];
  onTopicsChange: (topics: string[]) => void;
  disabled?: boolean;
}

export function TopicsEditor({ topics, onTopicsChange, disabled = false }: TopicsEditorProps) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<Record<number, string>>({});

  const validateTopic = (topic: string, index: number) => {
    const newErrors = { ...errors };
    
    if (topic.length > 80) {
      newErrors[index] = t('profile.topicTooLong', 'El tema no puede superar los 80 caracteres');
    } else if (topic.includes('<') || topic.includes('>') || topic.includes('&')) {
      newErrors[index] = t('profile.topicInvalidChars', 'El tema contiene caracteres no válidos');
    } else if (topic.match(/[\u1F600-\u1F64F]|[\u1F300-\u1F5FF]|[\u1F680-\u1F6FF]|[\u1F1E0-\u1F1FF]/)) {
      newErrors[index] = t('profile.topicNoEmojis', 'El tema no puede contener emojis');
    } else {
      delete newErrors[index];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTopic = () => {
    if (topics.length < 10) {
      onTopicsChange([...topics, '']);
    }
  };

  const removeTopic = (index: number) => {
    const newTopics = topics.filter((_, i) => i !== index);
    onTopicsChange(newTopics);
    
    // Clean up errors for removed topic
    const newErrors = { ...errors };
    delete newErrors[index];
    
    // Shift error indices down
    const shiftedErrors: Record<number, string> = {};
    Object.keys(newErrors).forEach((key) => {
      const idx = parseInt(key);
      if (idx > index) {
        shiftedErrors[idx - 1] = newErrors[idx];
      } else if (idx < index) {
        shiftedErrors[idx] = newErrors[idx];
      }
    });
    
    setErrors(shiftedErrors);
  };

  const updateTopic = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    onTopicsChange(newTopics);
    validateTopic(value, index);
  };

  const hasErrors = Object.keys(errors).length > 0;
  const canAddMore = topics.length < 10;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[hsl(17,12%,6%)]">
          {t('profile.videoCallTopics', 'Temas de Videollamada')}
        </CardTitle>
        <p className="text-sm text-[hsl(220,13%,40%)]">
          {t('profile.topicsDescription', 'Añade hasta 10 temas sobre los que te gustaría hablar durante las videollamadas')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Topics List */}
        <div className="space-y-3">
          {topics.map((topic, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <Label htmlFor={`topic-${index}`} className="sr-only">
                  {t('profile.topic', 'Tema')} {index + 1}
                </Label>
                <Input
                  id={`topic-${index}`}
                  value={topic}
                  onChange={(e) => updateTopic(index, e.target.value)}
                  placeholder={t('profile.topicPlaceholder', 'Escribe un tema (p. ej. Marketing digital)')}
                  disabled={disabled}
                  className={`${errors[index] ? 'border-red-500 focus:border-red-500' : ''}`}
                  maxLength={80}
                  aria-describedby={errors[index] ? `topic-error-${index}` : undefined}
                />
                {errors[index] && (
                  <p id={`topic-error-${index}`} className="text-sm text-red-600 mt-1" role="alert">
                    {errors[index]}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeTopic(index)}
                disabled={disabled}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                aria-label={t('profile.removeTopic', 'Eliminar tema')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add Topic Button */}
        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            onClick={addTopic}
            disabled={disabled}
            className="w-full border-dashed border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,96%)] hover:border-solid"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('profile.addTopic', 'Añadir tema')}
          </Button>
        )}

        {/* Counter */}
        <div className="flex justify-between items-center text-sm">
          <span 
            className={`${hasErrors ? 'text-red-600' : 'text-[hsl(220,13%,40%)]'}`}
            aria-live="polite"
            role="status"
          >
            {topics.length} / 10 {t('profile.topics', 'temas')}
          </span>
          {!canAddMore && (
            <span className="text-[hsl(220,13%,40%)]">
              {t('profile.maxTopicsReached', 'Máximo de temas alcanzado')}
            </span>
          )}
        </div>

        {hasErrors && (
          <div className="text-sm text-red-600" role="alert">
            {t('profile.topicValidationError', 'Por favor, corrige los errores antes de guardar')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Palette, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThemeColor {
  key: string;
  label: string;
  value: string;
  category: 'primary' | 'text' | 'state' | 'background';
}

const DEFAULT_THEME_COLORS: ThemeColor[] = [
  // Primary Colors
  { key: 'primary', label: 'Color Primario', value: '194 100% 28%', category: 'primary' },
  { key: 'secondary', label: 'Color Secundario', value: '194 30% 92%', category: 'primary' },
  { key: 'accent', label: 'Color de Acento', value: '194 50% 85%', category: 'primary' },
  
  // Text Colors
  { key: 'foreground', label: 'Texto Principal', value: '194 100% 15%', category: 'text' },
  { key: 'muted-foreground', label: 'Texto Secundario', value: '194 25% 45%', category: 'text' },
  { key: 'card-foreground', label: 'Texto en Tarjetas', value: '194 100% 15%', category: 'text' },
  
  // State Colors
  { key: 'destructive', label: 'Eliminar/Papelera (Rojo)', value: '0 84% 60%', category: 'state' },
  { key: 'success', label: 'Publicado/Éxito (Verde)', value: '158 64% 52%', category: 'state' },
  { key: 'warning', label: 'Advertencia (Amarillo)', value: '43 96% 56%', category: 'state' },
  { key: 'info', label: 'Información (Azul)', value: '210 100% 65%', category: 'state' },
  
  // Background Colors
  { key: 'background', label: 'Fondo Principal', value: '0 0% 100%', category: 'background' },
  { key: 'card', label: 'Fondo de Tarjetas', value: '0 0% 100%', category: 'background' },
  { key: 'muted', label: 'Fondo Suave', value: '194 15% 96%', category: 'background' },
  { key: 'popover', label: 'Fondo de Popover', value: '0 0% 100%', category: 'background' },
];

export function AdminThemeEditor() {
  const { toast } = useToast();
  const [colors, setColors] = useState<ThemeColor[]>(DEFAULT_THEME_COLORS);
  const [isDirty, setIsDirty] = useState(false);

  // Load current theme colors from CSS variables on component mount
  useEffect(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const updatedColors = colors.map(color => ({
      ...color,
      value: computedStyle.getPropertyValue(`--${color.key}`).trim() || color.value
    }));
    
    setColors(updatedColors);
  }, []);

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => prev.map(color => 
      color.key === key ? { ...color, value } : color
    ));
    setIsDirty(true);
    
    // Apply color immediately for preview
    applyColorToCSS(key, value);
  };

  const applyColorToCSS = (key: string, value: string) => {
    const root = document.documentElement;
    root.style.setProperty(`--${key}`, value);
  };

  const applyAllColors = () => {
    colors.forEach(color => {
      applyColorToCSS(color.key, color.value);
    });
  };

  const resetToDefaults = () => {
    setColors(DEFAULT_THEME_COLORS);
    DEFAULT_THEME_COLORS.forEach(color => {
      applyColorToCSS(color.key, color.value);
    });
    setIsDirty(true);
    toast({
      title: "Tema reiniciado",
      description: "Se han restaurado los colores por defecto",
    });
  };

  const saveTheme = async () => {
    try {
      // Here you would typically save to a backend/database
      // For now, we'll just apply the colors and show success
      applyAllColors();
      
      // Store in localStorage as fallback
      localStorage.setItem('dialoom-theme', JSON.stringify(colors));
      
      setIsDirty(false);
      toast({
        title: "Tema guardado",
        description: "Los cambios de color se han aplicado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el tema",
        variant: "destructive",
      });
    }
  };

  const getCategoryColors = (category: ThemeColor['category']) => {
    return colors.filter(color => color.category === category);
  };

  const getCategoryIcon = (category: ThemeColor['category']) => {
    switch (category) {
      case 'primary': return '🎨';
      case 'text': return '📝';
      case 'state': return '🚦';
      case 'background': return '🏠';
      default: return '🎨';
    }
  };

  const getCategoryTitle = (category: ThemeColor['category']) => {
    switch (category) {
      case 'primary': return 'Colores Principales';
      case 'text': return 'Colores de Texto';
      case 'state': return 'Colores de Estado';
      case 'background': return 'Colores de Fondo';
      default: return 'Otros Colores';
    }
  };

  const renderColorSection = (category: ThemeColor['category']) => {
    const categoryColors = getCategoryColors(category);
    
    return (
      <Card key={category} className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <span>{getCategoryIcon(category)}</span>
            {getCategoryTitle(category)}
            <Badge variant="outline" className="ml-auto">
              {categoryColors.length} colores
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryColors.map((color) => (
            <div key={color.key} className="flex items-center gap-3">
              <div className="flex-1">
                <Label htmlFor={color.key} className="text-sm font-medium">
                  {color.label}
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id={color.key}
                    value={color.value}
                    onChange={(e) => handleColorChange(color.key, e.target.value)}
                    className="flex-1 font-mono text-xs"
                    placeholder="HSL values (e.g., 194 100% 28%)"
                  />
                  <div 
                    className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: `hsl(${color.value})` }}
                    title={`Preview: ${color.label}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Editor de Tema Avanzado
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar por Defecto
          </Button>
          <Button
            size="sm"
            onClick={saveTheme}
            disabled={!isDirty}
            className="ml-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Tema
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Personaliza todos los aspectos visuales de la aplicación. Los cambios se previsualizan automáticamente.
        </div>
        
        <Separator />
        
        {(['primary', 'text', 'state', 'background'] as const).map(renderColorSection)}
        
        <Separator />
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">💡 Guía de Uso:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Colores HSL:</strong> Formato "hue saturation lightness" (ej: 194 100% 28%)</li>
            <li>• <strong>Estados:</strong> Rojo para eliminar, Verde para publicado, Amarillo para advertencias</li>
            <li>• <strong>Vista previa:</strong> Los cambios se aplican inmediatamente para visualización</li>
            <li>• <strong>Guardar:</strong> Presiona "Guardar Tema" para aplicar permanentemente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Wand2, Users, Globe } from "lucide-react";

export default function TestAIFeatures() {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [improvedDescription, setImprovedDescription] = useState("");
  const [suggestions, setSuggestions] = useState<{categories: string[], skills: string[]}>({
    categories: [],
    skills: []
  });

  // Query for social platforms
  const { data: socialPlatforms = [] } = useQuery({
    queryKey: ['/api/social-platforms'],
  });

  // Mutation for improving description
  const improveDescriptionMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/test/ai/improve-description", { description: text });
      return response.json();
    },
    onSuccess: (data: any) => {
      setImprovedDescription(data.improvedDescription);
      toast({
        title: "Descripción mejorada",
        description: "Loomia ha optimizado tu descripción profesional",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo mejorar la descripción",
        variant: "destructive",
      });
    },
  });

  // Mutation for getting AI suggestions
  const getAISuggestionsMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/test/ai/suggestions", { description: text });
      return response.json();
    },
    onSuccess: (data: any) => {
      setSuggestions(data);
      toast({
        title: "Sugerencias generadas",
        description: "Loomia ha analizado tu perfil y generado recomendaciones",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron generar sugerencias",
        variant: "destructive",
      });
    },
  });

  const handleImproveDescription = () => {
    if (!description.trim()) {
      toast({
        title: "Descripción requerida",
        description: "Escribe una descripción antes de mejorarla",
        variant: "destructive",
      });
      return;
    }
    improveDescriptionMutation.mutate(description);
  };

  const handleGetSuggestions = () => {
    if (!description.trim()) {
      toast({
        title: "Descripción requerida",
        description: "Escribe una descripción para obtener sugerencias",
        variant: "destructive",
      });
      return;
    }
    getAISuggestionsMutation.mutate(description);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
          Funcionalidades IA y Redes Sociales
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Prueba las nuevas funcionalidades de Loomia y la integración con redes sociales de Dialoom
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* AI Features Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Asistente IA Loomia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Descripción profesional para análisis:
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Soy un consultor de marketing digital con 10 años de experiencia ayudando a empresas a mejorar su presencia online..."
                  rows={4}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleImproveDescription}
                  disabled={improveDescriptionMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  {improveDescriptionMutation.isPending ? "Mejorando..." : "Mejorar Descripción"}
                </Button>
                <Button
                  onClick={handleGetSuggestions}
                  disabled={getAISuggestionsMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {getAISuggestionsMutation.isPending ? "Analizando..." : "Obtener Sugerencias"}
                </Button>
              </div>

              {improvedDescription && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">
                    Descripción mejorada por Loomia:
                  </label>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{improvedDescription}</p>
                  </div>
                </div>
              )}

              {(suggestions.categories.length > 0 || suggestions.skills.length > 0) && (
                <div className="space-y-4">
                  <Separator />
                  
                  {suggestions.categories.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-primary mb-2 block">
                        Categorías sugeridas:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="border-primary/50">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestions.skills.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-primary mb-2 block">
                        Habilidades sugeridas:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Social Platforms Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Plataformas Sociales Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {(socialPlatforms as any[]).map((platform: any) => (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{platform.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {platform.baseUrl}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {platform.placeholder}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <span className="text-sm font-medium">API Redes Sociales</span>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700">
                  Operacional
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <span className="text-sm font-medium">Asistente IA Loomia</span>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700">
                  Disponible
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <span className="text-sm font-medium">Plataformas Integradas</span>
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                  {(socialPlatforms as any[]).length} Disponibles
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center py-8 border-t">
        <p className="text-muted-foreground">
          Todas las funcionalidades están operativas y listas para usar en perfiles de Hosts.
        </p>
      </div>
    </div>
  );
}
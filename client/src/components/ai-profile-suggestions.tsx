import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AISuggestion {
  categories: {
    name: string;
    description: string;
    subcategories?: string[];
  }[];
  skills: {
    name: string;
    category: string;
    description: string;
  }[];
}

interface AIProfileSuggestionsProps {
  onSuggestionsApproved?: (suggestions: any) => void;
}

export function AIProfileSuggestions({ onSuggestionsApproved }: AIProfileSuggestionsProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState<AISuggestion | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const generateSuggestionsMutation = useMutation({
    mutationFn: async (desc: string) => {
      const response = await apiRequest("/api/ai/suggest-profile", {
        method: "POST",
        body: { description: desc }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions(data);
      setSelectedCategories([]);
      setSelectedSkills([]);
      toast({
        title: "Sugerencias generadas",
        description: "La IA ha analizado tu perfil y generado sugerencias relevantes.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar las sugerencias",
        variant: "destructive",
      });
    },
  });

  const approveSuggestionsMutation = useMutation({
    mutationFn: async () => {
      if (!suggestions) return;

      const categoriesToApprove = suggestions.categories.filter(cat => 
        selectedCategories.includes(cat.name)
      );
      const skillsToApprove = suggestions.skills.filter(skill => 
        selectedSkills.includes(skill.name)
      );

      const response = await apiRequest("/api/ai/approve-suggestions", {
        method: "POST",
        body: {
          categories: categoriesToApprove,
          skills: skillsToApprove
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sugerencias aplicadas",
        description: `Se agregaron ${data.addedCategories.length} categorías y ${data.addedSkills.length} skills a tu perfil.`,
      });
      
      if (onSuggestionsApproved) {
        onSuggestionsApproved(data);
      }
      
      // Reset form
      setDescription("");
      setSuggestions(null);
      setSelectedCategories([]);
      setSelectedSkills([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron aplicar las sugerencias",
        variant: "destructive",
      });
    },
  });

  const handleGenerateSuggestions = () => {
    if (description.trim().length < 10) {
      toast({
        title: "Descripción muy corta",
        description: "Por favor, proporciona una descripción de al menos 10 caracteres.",
        variant: "destructive",
      });
      return;
    }
    generateSuggestionsMutation.mutate(description);
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSkillToggle = (skillName: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillName)
        ? prev.filter(name => name !== skillName)
        : [...prev, skillName]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          Sugerencias Inteligentes de Perfil
        </CardTitle>
        <p className="text-sm text-gray-600">
          Describe tu experiencia profesional y la IA sugerirá categorías y habilidades relevantes para tu perfil.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">Describe tu experiencia profesional</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: He sido coordinador IT en educación durante 5 años, gestionando equipos técnicos y implementando soluciones educativas digitales..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            Mínimo 10 caracteres. Sé específico sobre tu rol, industria y responsabilidades.
          </p>
        </div>

        <Button
          onClick={handleGenerateSuggestions}
          disabled={generateSuggestionsMutation.isPending || description.trim().length < 10}
          className="w-full"
        >
          {generateSuggestionsMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generando sugerencias...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generar Sugerencias con IA
            </>
          )}
        </Button>

        {suggestions && (
          <div className="space-y-6 pt-4 border-t">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Categorías Profesionales Sugeridas
              </h3>
              <div className="space-y-2">
                {suggestions.categories.map((category) => (
                  <div key={category.name} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`category-${category.name}`}
                      checked={selectedCategories.includes(category.name)}
                      onCheckedChange={() => handleCategoryToggle(category.name)}
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`category-${category.name}`}
                        className="font-medium cursor-pointer"
                      >
                        {category.name}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </p>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {category.subcategories.map(subcat => (
                            <Badge key={subcat} variant="outline" className="text-xs">
                              {subcat}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Habilidades Técnicas Sugeridas
              </h3>
              <div className="space-y-2">
                {suggestions.skills.map((skill) => (
                  <div key={skill.name} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`skill-${skill.name}`}
                      checked={selectedSkills.includes(skill.name)}
                      onCheckedChange={() => handleSkillToggle(skill.name)}
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`skill-${skill.name}`}
                        className="font-medium cursor-pointer"
                      >
                        {skill.name}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {skill.description}
                      </p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {skill.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(selectedCategories.length > 0 || selectedSkills.length > 0) && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">
                    {selectedCategories.length} categorías y {selectedSkills.length} skills seleccionadas
                  </p>
                  <p className="text-sm text-blue-700">
                    Estas se agregarán a tu perfil y estarán disponibles para todos los usuarios.
                  </p>
                </div>
                <Button
                  onClick={() => approveSuggestionsMutation.mutate()}
                  disabled={approveSuggestionsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {approveSuggestionsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Aplicar Seleccionadas
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
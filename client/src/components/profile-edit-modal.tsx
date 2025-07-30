import { useState } from "react";
import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Camera, User as UserIcon } from "lucide-react";
import type { User, Country, Language, Skill, Category } from "@shared/schema";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function ProfileEditModal({ isOpen, onClose, user }: ProfileEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    title: user.title || "",
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    postalCode: user.postalCode || "",
    countryCode: user.countryCode || "",
    primaryLanguageId: user.primaryLanguageId || null,
    categoryId: user.categoryId || null,
    description: user.description || "",
  });

  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);

  // Fetch user's current languages and skills
  const { data: userLanguages = [] } = useQuery<{ languageId: number }[]>({
    queryKey: ['/api/user/languages', user.id],
    enabled: isOpen,
  });

  const { data: userSkills = [] } = useQuery<{ skillId: number }[]>({
    queryKey: ['/api/user/skills', user.id],
    enabled: isOpen,
  });

  // Initialize selections when data loads
  React.useEffect(() => {
    if (userLanguages.length > 0) {
      setSelectedLanguages(userLanguages.map(ul => ul.languageId));
    }
  }, [userLanguages]);

  React.useEffect(() => {
    if (userSkills.length > 0) {
      setSelectedSkills(userSkills.map(us => us.skillId));
    }
  }, [userSkills]);

  // Fetch reference data
  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ['/api/countries'],
  });

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ['/api/languages'],
  });

  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: ['/api/skills'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData & { skillIds: number[], languageIds: number[] }) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente.",
      });
      onClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      ...formData,
      skillIds: selectedSkills,
      languageIds: selectedLanguages,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(17,12%,6%)]">Editar Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal y profesional
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-[hsl(244,91%,95%)]">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button 
                type="button"
                className="absolute -bottom-2 -right-2 bg-[hsl(244,91%,68%)] text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-[hsl(244,91%,60%)] transition-colors"
                onClick={() => toast({ title: "Próximamente", description: "La funcionalidad de cambio de foto estará disponible pronto." })}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Haz clic en la cámara para cambiar tu foto</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                Nombre
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="mt-1"
                placeholder="Tu nombre"
              />
            </div>
            
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Apellido
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="mt-1"
                placeholder="Tu apellido"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Título profesional
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="mt-1"
                placeholder="Ej: Desarrollador Full Stack"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <Input
                value={user.email || ""}
                disabled
                className="mt-1 bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Teléfono
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="mt-1"
                placeholder="+34 612 345 678"
              />
            </div>

            {/* Address Information */}
            <div className="md:col-span-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Dirección
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="mt-1"
                placeholder="Calle y número"
              />
            </div>

            <div>
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                Ciudad
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="mt-1"
                placeholder="Tu ciudad"
              />
            </div>

            <div>
              <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                Código Postal
              </Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                className="mt-1"
                placeholder="12345"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">
                País
              </Label>
              <Select value={formData.countryCode} onValueChange={(value) => handleInputChange("countryCode", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona tu país" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Professional Information */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Categoría Profesional
              </Label>
              <Select 
                value={formData.categoryId?.toString() || ""} 
                onValueChange={(value) => handleInputChange("categoryId", value ? parseInt(value) : null)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona tu área profesional" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Idioma Principal
              </Label>
              <Select 
                value={formData.primaryLanguageId?.toString() || ""} 
                onValueChange={(value) => handleInputChange("primaryLanguageId", value ? parseInt(value) : null)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona tu idioma principal" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.id} value={language.id.toString()}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Secondary Languages */}
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Idiomas Secundarios
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {languages
                  .filter(lang => lang.id !== formData.primaryLanguageId)
                  .map((language) => (
                  <div key={language.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${language.id}`}
                      checked={selectedLanguages.includes(language.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLanguages(prev => [...prev, language.id]);
                        } else {
                          setSelectedLanguages(prev => prev.filter(id => id !== language.id));
                        }
                      }}
                    />
                    <Label htmlFor={`lang-${language.id}`} className="text-sm">
                      {language.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Habilidades
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill.id}`}
                      checked={selectedSkills.includes(skill.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSkills(prev => [...prev, skill.id]);
                        } else {
                          setSelectedSkills(prev => prev.filter(id => id !== skill.id));
                        }
                      }}
                    />
                    <Label htmlFor={`skill-${skill.id}`} className="text-sm">
                      {skill.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descripción personal
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                className="mt-1"
                placeholder="Cuéntanos sobre ti, tu experiencia y tus intereses..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              className="bg-[hsl(244,91%,68%)] text-white hover:bg-[hsl(244,91%,60%)]"
            >
              {updateProfileMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

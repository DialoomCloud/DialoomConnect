import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Wand2,
  Sparkles,
  Plus,
  Trash2,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Github,
  Youtube,
  ExternalLink,
  Camera
} from "lucide-react";

// Schema for form validation
const profileSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  dateOfBirth: z.string().optional().transform(val => val?.trim() === '' ? undefined : val),
  nationality: z.string().optional().transform(val => val?.trim() === '' ? undefined : val),
  title: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().optional(),
  primaryLanguageId: z.coerce.number().optional(),
});

const socialProfileSchema = z.object({
  platformId: z.number(),
  username: z.string().min(1, "Usuario requerido"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type SocialProfileData = z.infer<typeof socialProfileSchema>;

interface SocialPlatform {
  id: number;
  name: string;
  baseUrl: string;
  iconClass: string;
  placeholder: string;
}

interface UserSocialProfile {
  id: string;
  platformId: number;
  username: string;
  url: string;
  platform: SocialPlatform;
}

interface Category {
  id: number;
  name: string;
}

interface AISuggestions {
  categories: string[];
  skills: string[];
}

const socialIcons: Record<string, any> = {
  'LinkedIn': Linkedin,
  'Instagram': Instagram, 
  'X (Twitter)': Twitter,
  'Facebook': Facebook,
  'GitHub': Github,
  'YouTube': Youtube,
};

interface EnhancedProfileEditProps {
  onClose?: () => void;
}

export function EnhancedProfileEdit({ onClose }: EnhancedProfileEditProps = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Type guard for user
  const typedUser = user as any;
  
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestions | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<{platformId: number, username: string}[]>([]);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [newSocialProfile, setNewSocialProfile] = useState<SocialProfileData>({
    platformId: 1, // Default to LinkedIn (assuming ID 1)
    username: ""
  });

  // Form setup
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: typedUser?.firstName || "",
      lastName: typedUser?.lastName || "",
      dateOfBirth: typedUser?.dateOfBirth || "",
      nationality: typedUser?.nationality || "",
      title: typedUser?.title || "",
      description: typedUser?.description || "",
      address: typedUser?.address || "",
      city: typedUser?.city || "",
      postalCode: typedUser?.postalCode || "",
      countryCode: typedUser?.countryCode || "",
      primaryLanguageId: typedUser?.primaryLanguageId || undefined,
    },
  });

  // Data queries
  const { data: socialPlatforms = [] } = useQuery({
    queryKey: ['/api/social-platforms']
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: countries = [] } = useQuery({
    queryKey: ['/api/countries'],
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['/api/languages'],
  });

  const { data: userCategories = [] } = useQuery({
    queryKey: ['/api/user/categories', typedUser?.id],
    enabled: !!typedUser?.id,
  });

  const { data: userSocialProfiles = [] } = useQuery({
    queryKey: ['/api/user/social-profiles', typedUser?.id],
    enabled: !!typedUser?.id,
  });

  const { data: userLanguages = [] } = useQuery({
    queryKey: ['/api/user/languages', typedUser?.id],
    enabled: !!typedUser?.id,
  });

  // Type the query data
  const typedSocialPlatforms = socialPlatforms as any[];
  const typedCategories = categories as any[];
  const typedCountries = countries as any[];
  const typedLanguages = languages as any[];
  const typedUserCategories = userCategories as any[];
  const typedUserSocialProfiles = userSocialProfiles as any[];
  const typedUserLanguages = userLanguages as any[];

  // Load initial data
  useEffect(() => {
    if (typedUserCategories.length > 0) {
      setSelectedCategories(typedUserCategories.map((uc: any) => uc.categoryId));
    }
  }, [typedUserCategories]);

  useEffect(() => {
    if (typedUserLanguages.length > 0) {
      setSelectedLanguages(typedUserLanguages.map((ul: any) => ul.languageId));
    }
  }, [typedUserLanguages]);

  useEffect(() => {
    if (typedUserSocialProfiles.length > 0) {
      setSocialProfiles(typedUserSocialProfiles.map((usp: any) => ({
        platformId: usp.platformId,
        username: usp.username
      })));
    }
  }, [typedUserSocialProfiles]);

  // AI Description improvement mutation
  const improveDescriptionMutation = useMutation({
    mutationFn: async (description: string) => {
      // Get LinkedIn URL from social profiles if available
      const linkedinProfile = socialProfiles.find(profile => {
        const platform = typedSocialPlatforms.find((p: any) => p.id === profile.platformId);
        return platform?.name?.toLowerCase() === 'linkedin';
      });
      
      const linkedinUrl = linkedinProfile ? 
        (linkedinProfile.username.startsWith('http') ? 
          linkedinProfile.username : 
          `https://linkedin.com/in/${linkedinProfile.username}`) : 
        '';
      
      console.log('Sending AI request with:', { description, linkedinUrl, linkedinProfile });
      
      const response = await apiRequest("/api/ai/enhance-description", { 
        method: "POST",
        body: {
          description,
          linkedinUrl
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue("description", data.enhancedDescription);
      toast({
        title: "¡Descripción mejorada!",
        description: "La IA ha optimizado tu descripción profesional usando tu información de LinkedIn",
      });
    },
    onError: (error: any) => {
      console.error('AI Enhancement error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo mejorar la descripción. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // AI Suggestions mutation
  const getAISuggestionsMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest("POST", "/api/ai/suggestions", { description });
      return response.json();
    },
    onSuccess: (data) => {
      setAISuggestions(data);
      setIsAIDialogOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "No se pudieron generar sugerencias",
        variant: "destructive",
      });
    },
  });

  // Profile image update mutation
  const updateProfileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Imagen actualizada",
        description: "Tu imagen de perfil ha sido actualizada exitosamente.",
      });
      setProfileImageFile(null);
      setProfileImagePreview(null);
    },
    onError: (error: any) => {
      console.error('Profile image update error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la imagen de perfil",
        variant: "destructive",
      });
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData & { languageIds: number[] }) => {
      const { languageIds, ...profileData } = data;
      const response = await apiRequest(`/api/profile`, {
        method: "PUT",
        body: { ...profileData, languageIds }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil actualizado",
        description: "Tu información personal se ha guardado correctamente",
      });
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  // Categories update mutation
  const updateCategoriesMutation = useMutation({
    mutationFn: async (categoryIds: number[]) => {
      const response = await apiRequest(`/api/users/${typedUser?.id}/categories`, { 
        method: "PUT",
        body: { categoryIds }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/categories", typedUser?.id] });
      toast({
        title: "Categorías actualizadas",
        description: "Tus categorías profesionales se han guardado",
      });
    },
  });

  // Social profiles update mutation
  const updateSocialProfilesMutation = useMutation({
    mutationFn: async (profiles: {platformId: number, username: string}[]) => {
      const response = await apiRequest(`/api/users/${typedUser?.id}/social-profiles`, { 
        method: "PUT",
        body: { profiles }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/social-profiles", typedUser?.id] });
      toast({
        title: "Redes sociales actualizadas",
        description: "Tus perfiles sociales se han guardado",
      });
    },
  });

  const handleImproveDescription = () => {
    const currentDescription = form.getValues("description");
    if (!currentDescription?.trim()) {
      toast({
        title: "Descripción requerida",
        description: "Escribe una descripción antes de mejorarla con IA",
        variant: "destructive",
      });
      return;
    }
    
    improveDescriptionMutation.mutate(currentDescription);
  };

  const handleGetAISuggestions = () => {
    const currentDescription = form.getValues("description");
    if (!currentDescription?.trim()) {
      toast({
        title: "Descripción requerida", 
        description: "Escribe una descripción para obtener sugerencias de IA",
        variant: "destructive",
      });
      return;
    }
    getAISuggestionsMutation.mutate(currentDescription);
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddSocialProfile = () => {
    if (newSocialProfile.platformId && newSocialProfile.username.trim()) {
      setSocialProfiles(prev => [...prev, newSocialProfile]);
      setNewSocialProfile({ platformId: 0, username: "" });
    }
  };

  const handleRemoveSocialProfile = (index: number) => {
    setSocialProfiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      console.log('Submitting profile data:', data);

      // Update profile image if a new one was selected
      if (profileImageFile) {
        await updateProfileImageMutation.mutateAsync(profileImageFile);
      }

      // Update profile
      await updateProfileMutation.mutateAsync({ ...data, languageIds: selectedLanguages });
      
      // Update categories
      if (selectedCategories.length > 0) {
        await updateCategoriesMutation.mutateAsync(selectedCategories);
      }
      
      // Update social profiles
      if (socialProfiles.length > 0) {
        await updateSocialProfilesMutation.mutateAsync(socialProfiles);
      }
      
      // Close dialog after successful save
      if (onClose) {
        setTimeout(() => onClose(), 1000); // Small delay to show success message
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Perfil Profesional</h1>
          <p className="text-muted-foreground">
            Personaliza tu perfil con ayuda de Loomia, nuestro asistente IA
          </p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="social">Redes Sociales</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex flex-col items-center mb-4">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Previsualización de perfil"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : typedUser?.profileImageUrl ? (
                      <img
                        src={typedUser.profileImageUrl.startsWith('http') ? typedUser.profileImageUrl : `/storage/${typedUser.profileImageUrl}`}
                        alt="Foto de perfil"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : null}
                    <Input id="profile-image-input" type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                    <Label htmlFor="profile-image-input" className="mt-2 cursor-pointer flex items-center gap-2 text-primary">
                      <Camera className="h-4 w-4" /> Cambiar foto
                    </Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Nacimiento</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nacionalidad</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tu nacionalidad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {typedCountries.map((country: any) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calle</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Postal</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País de Residencia</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tu país" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {typedCountries.map((country: any) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="primaryLanguageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma Principal</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value ? field.value.toString() : undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tu idioma principal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {typedLanguages.map((language: any) => (
                              <SelectItem key={language.id} value={language.id.toString()}>
                                {language.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Idiomas Hablados</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {typedLanguages.map((language: any) => (
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

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título Profesional</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: Consultor de Marketing Digital" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Descripción Profesional</FormLabel>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={handleImproveDescription}
                            disabled={improveDescriptionMutation.isPending}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          >
                            <Wand2 className="h-4 w-4" />
                            {improveDescriptionMutation.isPending ? "Mejorando..." : "Mejorar con IA"}
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={5}
                            placeholder="Describe tu experiencia, especialidades y cómo puedes ayudar a tus clientes..."
                          />
                        </FormControl>
                        <div className="flex items-center justify-between">
                          <FormMessage />
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            La IA mejora el texto basándose en mejores prácticas profesionales
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Social Media Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Redes Sociales</Label>
                      <span className="text-sm text-muted-foreground">Ayuda a la IA con tu información profesional</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Select 
                        value={newSocialProfile.platformId.toString()} 
                        onValueChange={(value) => 
                          setNewSocialProfile(prev => ({ ...prev, platformId: parseInt(value) }))
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Seleccionar plataforma" />
                        </SelectTrigger>
                        <SelectContent>
                          {typedSocialPlatforms.map((platform: any) => (
                            <SelectItem key={platform.id} value={platform.id.toString()}>
                              {platform.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Usuario/Handle"
                        value={newSocialProfile.username}
                        onChange={(e) => 
                          setNewSocialProfile(prev => ({ ...prev, username: e.target.value }))
                        }
                        className="flex-1"
                      />
                      <Button 
                        type="button"
                        onClick={handleAddSocialProfile}
                        disabled={!newSocialProfile.platformId || !newSocialProfile.username.trim()}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {socialProfiles.length > 0 && (
                      <div className="space-y-2">
                        <Label>Perfiles añadidos:</Label>
                        {socialProfiles.map((profile, index) => {
                          const platform = socialPlatforms.find((p: SocialPlatform) => p.id === profile.platformId);
                          const IconComponent = socialIcons[platform?.name] || ExternalLink;
                          
                          return (
                            <div key={index} className="flex items-center gap-3 p-2 border rounded-lg bg-muted/30">
                              <IconComponent className="h-4 w-4" />
                              <span className="font-medium">{platform?.name}</span>
                              <span className="text-muted-foreground">
                                {profile.username}
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveSocialProfile(index)}
                                className="ml-auto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full"
                  >
                    {updateProfileMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categorías Profesionales</CardTitle>
              <CardDescription>
                Selecciona las categorías que mejor describan tu expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {typedCategories.map((category: any) => (
                  <div
                    key={category.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCategories.includes(category.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                ))}
              </div>
              
              {selectedCategories.length > 0 && (
                <div className="mt-4">
                  <Label>Categorías seleccionadas:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCategories.map(categoryId => {
                      const category = categories.find((c: Category) => c.id === categoryId);
                      return category ? (
                        <Badge key={categoryId} variant="secondary">
                          {category.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => updateCategoriesMutation.mutate(selectedCategories)}
                disabled={updateCategoriesMutation.isPending}
                className="w-full mt-4"
              >
                {updateCategoriesMutation.isPending ? "Guardando..." : "Guardar Categorías"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>
                Añade tus perfiles profesionales en redes sociales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select 
                  value={newSocialProfile.platformId.toString()} 
                  onValueChange={(value) => 
                    setNewSocialProfile(prev => ({ ...prev, platformId: parseInt(value) }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Seleccionar plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    {typedSocialPlatforms.map((platform: any) => (
                      <SelectItem key={platform.id} value={platform.id.toString()}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Usuario/Handle"
                  value={newSocialProfile.username}
                  onChange={(e) => 
                    setNewSocialProfile(prev => ({ ...prev, username: e.target.value }))
                  }
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddSocialProfile}
                  disabled={!newSocialProfile.platformId || !newSocialProfile.username.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {socialProfiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Perfiles añadidos:</Label>
                  {socialProfiles.map((profile, index) => {
                    const platform = socialPlatforms.find((p: SocialPlatform) => p.id === profile.platformId);
                    const IconComponent = socialIcons[platform?.name] || ExternalLink;
                    
                    return (
                      <div key={index} className="flex items-center gap-3 p-2 border rounded">
                        <IconComponent className="h-4 w-4" />
                        <span className="font-medium">{platform?.name}</span>
                        <span className="text-muted-foreground">@{profile.username}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSocialProfile(index)}
                          className="ml-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <Button 
                onClick={() => updateSocialProfilesMutation.mutate(socialProfiles)}
                disabled={updateSocialProfilesMutation.isPending}
                className="w-full"
              >
                {updateSocialProfilesMutation.isPending ? "Guardando..." : "Guardar Redes Sociales"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Suggestions Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Sugerencias de Loomia
            </DialogTitle>
            <DialogDescription>
              Basándome en tu descripción, estas son mis recomendaciones profesionales
            </DialogDescription>
          </DialogHeader>
          
          {aiSuggestions && (
            <div className="space-y-4">
              {aiSuggestions.categories.length > 0 && (
                <div>
                  <Label className="text-base font-semibold">Categorías sugeridas:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {aiSuggestions.categories.map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {aiSuggestions.skills.length > 0 && (
                <div>
                  <Label className="text-base font-semibold">Habilidades sugeridas:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {aiSuggestions.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
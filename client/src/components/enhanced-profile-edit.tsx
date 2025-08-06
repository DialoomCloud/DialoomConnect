import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
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
  Globe,
  ExternalLink,
  Camera
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PURPOSES } from "@/stores/exploreFilterStore";

// Schema for form validation
const profileSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  dateOfBirth: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  countryCode: z.string().nullable().optional(),
  primaryLanguageId: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  purpose: z.array(z.string()).nullable().optional(),
  videoCallTopics: z.array(z.string()).nullable().optional(),
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
  'Web': Globe,
};

interface EnhancedProfileEditProps {
  onClose?: () => void;
}

export function EnhancedProfileEdit({ onClose }: EnhancedProfileEditProps = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // Debug logging
  console.log('[EnhancedProfileEdit] Component mounted, user:', user);
  
  // Type guard for user
  const typedUser = user as any;
  
  // Early return if no user
  if (!user) {
    console.log('[EnhancedProfileEdit] No user found');
    return (
      <div className="p-4 text-center">
        <p>Cargando datos del usuario...</p>
      </div>
    );
  }
  
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestions | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<{platformId: number, username: string}[]>([]);
  const [newSocialProfile, setNewSocialProfile] = useState<SocialProfileData>({
    platformId: 1, // Default to LinkedIn (assuming ID 1)
    username: ""
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Form setup with dynamic values that sync with user data
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      title: "",
      description: "",
      address: "",
      city: "",
      postalCode: "",
      countryCode: "",
      primaryLanguageId: undefined,
      phone: "",
      purpose: [],
      videoCallTopics: [],
    },
  });

  // Initialize purpose selection from user data
  useEffect(() => {
    if (typedUser?.purpose) {
      setSelectedPurposes(Array.isArray(typedUser.purpose) ? typedUser.purpose : []);
    }
  }, [typedUser?.purpose]);

  // Sync form with current user data only when dialog opens or user data changes
  useEffect(() => {
    if (typedUser) {
      console.log('🔄 [PROFILE SYNC] Syncing form with user data:', {
        address: typedUser.address,
        phone: typedUser.phone,
        city: typedUser.city,
        postalCode: typedUser.postalCode,
        title: typedUser.title,
        description: typedUser.description,
        nationality: typedUser.nationality,
        countryCode: typedUser.countryCode,
        primaryLanguageId: typedUser.primaryLanguageId,
        dateOfBirth: typedUser.dateOfBirth
      });
      form.reset({
        firstName: typedUser.firstName || "",
        lastName: typedUser.lastName || "",
        dateOfBirth: typedUser.dateOfBirth || "",
        nationality: typedUser.nationality || "",
        title: typedUser.title || "",
        description: typedUser.description || "",
        address: typedUser.address || "",
        city: typedUser.city || "",
        postalCode: typedUser.postalCode || "",
        countryCode: typedUser.countryCode || "",
        primaryLanguageId: typedUser.primaryLanguageId || undefined,
        phone: typedUser.phone || "",
        purpose: typedUser.purpose || [],
        videoCallTopics: typedUser.videoCallTopics || [],
      });
    }
  }, [typedUser?.id]); // Only depend on user ID to avoid infinite loops

  // Data queries with error handling
  const { data: socialPlatforms = [], error: socialPlatformsError } = useQuery({
    queryKey: ['/api/social-platforms']
  });

  const { data: categories = [], error: categoriesError } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: countries = [], error: countriesError } = useQuery({
    queryKey: ['/api/countries'],
  });

  const { data: languages = [], error: languagesError } = useQuery({
    queryKey: ['/api/languages'],
  });

  const { data: userLanguages = [] } = useQuery({
    queryKey: ['/api/user/languages', typedUser?.id],
    enabled: !!typedUser?.id,
  });

  const { data: userCategories = [] } = useQuery({
    queryKey: ['/api/user/categories', typedUser?.id],
    enabled: !!typedUser?.id,
  });

  const { data: userSocialProfiles = [] } = useQuery({
    queryKey: ['/api/user/social-profiles', typedUser?.id],
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
  
  // This effect is already handled above at line 176

  useEffect(() => {
    if (typedUserSocialProfiles.length > 0) {
      setSocialProfiles(typedUserSocialProfiles.map((usp: any) => ({
        platformId: usp.platformId,
        username: usp.username
      })));
    }
  }, [typedUserSocialProfiles]);

  useEffect(() => {
    if (typedUserLanguages.length > 0) {
      setSelectedLanguages(typedUserLanguages.map((ul: any) => ul.languageId));
    }
  }, [typedUserLanguages]);

  // AI Description improvement mutation
  const improveDescriptionMutation = useMutation({
    mutationFn: async ({ description, linkedinUrl }: { description: string; linkedinUrl?: string }) => {
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
    const response = await apiRequest("/api/ai/suggestions", {
      method: "POST",
      body: { description }
    });
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

  const updateProfileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
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
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la imagen de perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(`/api/users/${typedUser?.id}/profile`, {
        method: "PUT",
        body: data
      });
      return response.json();
    },
    onSuccess: async (updatedUser) => {
      // Update the cache directly with the fresh data from server
      queryClient.setQueryData(["/api/auth/user"], (oldData: any) => ({
        ...oldData,
        ...updatedUser
      }));
      
      // Force refetch to ensure all related queries are updated
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Don't update form values here to avoid conflicts with user input
      // The form will be re-synced when the dialog is closed and reopened
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
      // Don't show toast here, we'll show a combined one at the end
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
      // Don't show toast here, we'll show a combined one at the end
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

    const linkedinProfile = socialProfiles.find(profile => {
      const platform = typedSocialPlatforms.find((p: any) => p.id === profile.platformId);
      return platform?.name?.toLowerCase() === 'linkedin';
    });

    const linkedinUrl = linkedinProfile ?
      (linkedinProfile.username.startsWith('http') ?
        linkedinProfile.username :
        `https://linkedin.com/in/${linkedinProfile.username}`) :
      undefined;

    improveDescriptionMutation.mutate({ description: currentDescription, linkedinUrl });
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

  const handleLanguageToggle = (languageId: number) => {
    setSelectedLanguages(prev =>
      prev.includes(languageId)
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    );
  };

  const handlePurposeToggle = (purpose: string) => {
    const newPurposes = selectedPurposes.includes(purpose)
      ? selectedPurposes.filter(p => p !== purpose)
      : [...selectedPurposes, purpose];
    
    setSelectedPurposes(newPurposes);
    form.setValue('purpose', newPurposes);
  };

  const handleAddSocialProfile = () => {
    if (newSocialProfile.platformId && newSocialProfile.username.trim()) {
      setSocialProfiles(prev => [...prev, newSocialProfile]);
      setNewSocialProfile({ platformId: 1, username: "" });
    }
  };

  const handleRemoveSocialProfile = (index: number) => {
    setSocialProfiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen debe ser menor a 5MB.",
          variant: "destructive",
        });
        return;
      }
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageSubmit = () => {
    if (profileImageFile) {
      updateProfileImageMutation.mutate(profileImageFile);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      console.log('Submitting form data:', data);
      console.log('Selected languages:', selectedLanguages);
      
      // Clean data - convert empty strings to null for proper backend handling
      const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value === '' || value === null || value === undefined) {
          // Send null for empty values so backend can handle them properly
          acc[key] = null;
        } else if (key === 'primaryLanguageId' && typeof value === 'string') {
          // Convert string to number for primaryLanguageId
          acc[key] = value ? parseInt(value, 10) : null;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      const updatePromises = [] as Promise<unknown>[];

      // Update profile with selected languages
      const profileDataToSend = { ...cleanedData, languageIds: selectedLanguages };
      console.log('🚀 [PROFILE SAVE] Sending profile data to server:', {
        address: profileDataToSend.address,
        phone: profileDataToSend.phone,
        city: profileDataToSend.city,
        postalCode: profileDataToSend.postalCode,
        title: profileDataToSend.title,
        description: profileDataToSend.description,
        nationality: profileDataToSend.nationality,
        countryCode: profileDataToSend.countryCode,
        primaryLanguageId: profileDataToSend.primaryLanguageId,
        dateOfBirth: profileDataToSend.dateOfBirth,
        allData: profileDataToSend
      });
      console.log('🔍 [PROBLEMATIC FIELDS] Specific check:', {
        'nationality value': profileDataToSend.nationality,
        'nationality type': typeof profileDataToSend.nationality,
        'countryCode value': profileDataToSend.countryCode,
        'countryCode type': typeof profileDataToSend.countryCode,
        'primaryLanguageId value': profileDataToSend.primaryLanguageId,
        'primaryLanguageId type': typeof profileDataToSend.primaryLanguageId
      });
      updatePromises.push(updateProfileMutation.mutateAsync(profileDataToSend));

      // Update categories
      if (selectedCategories.length > 0) {
        console.log('Updating categories:', selectedCategories);
        updatePromises.push(updateCategoriesMutation.mutateAsync(selectedCategories));
      }

      // Update social profiles
      if (socialProfiles.length > 0) {
        console.log('Updating social profiles:', socialProfiles);
        updatePromises.push(updateSocialProfilesMutation.mutateAsync(socialProfiles));
      }

      // Wait for all updates to complete
      await Promise.all(updatePromises);
      console.log('All profile updates completed successfully');

      // Show single success message after all updates
      toast({
        title: "✓ Perfil actualizado exitosamente",
        description: "Todos tus cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error('Error during form submission:', error);
      // Show error details
      if (error instanceof Error) {
        toast({
          title: "Error al guardar",
          description: error.message || "Ocurrió un error al guardar los cambios",
          variant: "destructive",
        });
      }
    }
  };

  if (!user) return null;

  // Debug logging for rendering
  console.log('[EnhancedProfileEdit] About to render component');
  console.log('[EnhancedProfileEdit] Form state:', form.formState);
  console.log('[EnhancedProfileEdit] Selected categories:', selectedCategories);
  console.log('[EnhancedProfileEdit] Social profiles:', socialProfiles);
  
  // Wrap in try-catch for error handling
  try {
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
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-[hsl(188,100%,95%)] mx-auto">
                        {profileImagePreview ? (
                          <img src={profileImagePreview} alt="Preview" className="w-full h-full rounded-full object-cover" />
                        ) : typedUser?.profileImageUrl ? (
                          <img src={typedUser.profileImageUrl.startsWith('http') ? typedUser.profileImageUrl : `/storage/${typedUser.profileImageUrl}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="profile-image-input" />
                      <label htmlFor="profile-image-input" className="absolute -bottom-2 -right-2 bg-[hsl(188,100%,38%)] text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-[hsl(188,100%,32%)] transition-colors cursor-pointer">
                        <Camera className="w-4 h-4" />
                      </label>
                    </div>
                    {profileImageFile ? (
                      <div className="mt-3">
                        <Button type="button" onClick={handleImageSubmit} disabled={updateProfileImageMutation.isPending} className="bg-[hsl(242,54%,64%)] hover:bg-[hsl(242,54%,54%)] text-white text-sm">
                          {updateProfileImageMutation.isPending ? "Subiendo..." : "Subir Nueva Imagen"}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mt-2">Haz clic en la cámara para cambiar tu foto</p>
                    )}
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
                            <Input {...field} value={field.value || ""} type="date" />
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
                          <Select 
                            onValueChange={(value) => field.onChange(value === "none" ? null : value)} 
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tu nacionalidad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Sin especificar</SelectItem>
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título Profesional</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Ej: Consultor de Marketing Digital" />
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
                            value={field.value || ""}
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

                  {/* Video Call Topics Field - only for hosts */}
                  {typedUser?.isHost && (
                    <FormField
                      control={form.control}
                      name="videoCallTopics"
                      render={({ field }) => {
                        const topicsText = field.value ? field.value.join('\n') : '';
                        
                        return (
                          <FormItem>
                            <FormLabel>{t('userProfile.videoCallTopics')}</FormLabel>
                            <FormControl>
                              <Textarea
                                value={topicsText}
                                onChange={(e) => {
                                  const lines = e.target.value.split('\n').slice(0, 10); // Limit to 10 lines
                                  const filteredLines = lines.filter(line => line.trim().length > 0);
                                  field.onChange(filteredLines);
                                }}
                                rows={6}
                                placeholder={t('userProfile.videoCallTopicsPlaceholder') + ':&#10;• Estrategia de Marketing Digital&#10;• Análisis de Redes Sociales&#10;• Optimización SEO&#10;• Publicidad Online&#10;• Growth Hacking'}
                                className="resize-none"
                              />
                            </FormControl>
                            <div className="flex items-center justify-between">
                              <FormMessage />
                              <p className="text-sm text-muted-foreground">
                                {field.value ? field.value.length : 0}/10 {t('userProfile.videoCallTopicsCounter')}
                              </p>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="+34 612 345 678" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
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
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value === "none" ? null : value)} 
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un país" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Sin especificar</SelectItem>
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
                    <FormField
                      control={form.control}
                      name="primaryLanguageId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idioma Principal</FormLabel>
                          <Select 
                            onValueChange={(val) => field.onChange(val ? parseInt(val) : null)} 
                            value={field.value ? field.value.toString() : undefined}
                            defaultValue={field.value ? field.value.toString() : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un idioma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {typedLanguages.map((lang: any) => (
                                <SelectItem key={lang.id} value={lang.id.toString()}>
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <Label>Idiomas Hablados</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto mt-2">
                      {typedLanguages.map((language: any) => (
                        <div key={language.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lang-${language.id}`}
                            checked={selectedLanguages.includes(language.id)}
                            onCheckedChange={() => handleLanguageToggle(language.id)}
                          />
                          <Label htmlFor={`lang-${language.id}`}>{language.name}</Label>
                        </div>
                      ))}
                    </div>
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
                      const category = typedCategories.find((c: Category) => c.id === categoryId);
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

          {/* Purpose Selection Section */}
          <Card>
            <CardHeader>
              <CardTitle>Propósito de tus servicios</CardTitle>
              <CardDescription>
                Selecciona los propósitos que mejor describan el objetivo de tus servicios como host
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PURPOSES.map((purpose) => (
                  <div key={purpose} className="flex items-center space-x-3">
                    <Checkbox
                      id={purpose}
                      checked={selectedPurposes.includes(purpose)}
                      onCheckedChange={() => handlePurposeToggle(purpose)}
                    />
                    <Label htmlFor={purpose} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {purpose}
                    </Label>
                  </div>
                ))}
              </div>
              
              {selectedPurposes.length > 0 && (
                <div className="mt-4">
                  <Label>Propósitos seleccionados:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPurposes.map(purpose => (
                      <Badge key={purpose} variant="secondary">
                        {purpose}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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
                    const platform = typedSocialPlatforms.find((p: SocialPlatform) => p.id === profile.platformId);
                    const IconComponent = socialIcons[platform?.name] || ExternalLink;
                    
                    return (
                      <div key={index} className="flex items-center gap-3 p-2 border rounded">
                        <IconComponent className="h-4 w-4" />
                        <span className="font-medium">{platform?.name}</span>
                        <span className="text-muted-foreground">
                          {profile.username.startsWith("http")
                            ? profile.username
                            : `@${profile.username}`}
                        </span>
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
  } catch (error) {
    console.error('[EnhancedProfileEdit] Render error:', error);
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error al cargar el editor de perfil</p>
        <p className="text-sm text-gray-600 mt-2">Por favor, recarga la página</p>
      </div>
    );
  }
}
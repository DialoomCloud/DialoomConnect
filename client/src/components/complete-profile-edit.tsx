import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { User, Plus, Trash2, Instagram, Linkedin, Twitter, Github } from "lucide-react";
import { TopicsEditor } from "@/components/topics-editor";
import { Checkbox } from "@/components/ui/checkbox";

// Schema for basic profile
const profileSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Social media platforms
const socialPlatforms = [
  { name: 'Instagram', icon: Instagram },
  { name: 'LinkedIn', icon: Linkedin },
  { name: 'Twitter', icon: Twitter },
  { name: 'GitHub', icon: Github },
];

interface CompleteProfileEditProps {
  open?: boolean;
  onClose?: () => void;
}

export function CompleteProfileEdit({ open = false, onClose }: CompleteProfileEditProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);

  // States for different tabs
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<Array<{platform: string, username: string}>>([]);
  const [videoCallTopics, setVideoCallTopics] = useState<string[]>([]);

  // Handle modal state
  const modalOpen = open || internalOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose();
    } else {
      setInternalOpen(newOpen);
    }
  };

  // Form for basic profile
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      title: "",
      description: "",
    },
  });

  // Load form data when user changes
  useEffect(() => {
    if (user && typeof user === 'object') {
      const typedUser = user as any;
      form.reset({
        firstName: typedUser.firstName || "",
        lastName: typedUser.lastName || "",
        title: typedUser.title || "",
        description: typedUser.description || "",
      });
      
      setSelectedCategories(typedUser.categories || []);
      setSocialProfiles(typedUser.socialProfiles || []);
      setVideoCallTopics(typedUser.videoCallTopics || []);
    }
  }, [user, form]);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Basic profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          title: data.title || null,
          description: data.description || null,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Error al actualizar perfil');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      toast({
        title: "✓ Perfil actualizado",
        description: "Tu información se ha guardado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    }
  });

  // Categories update mutation
  const updateCategoriesMutation = useMutation({
    mutationFn: async (categoryIds: number[]) => {
      const response = await fetch('/api/profile/categories', {
        method: 'PUT',
        body: JSON.stringify({ categoryIds }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Error al actualizar categorías');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✓ Categorías actualizadas",
        description: "Tus categorías se han guardado correctamente",
      });
    },
  });

  // Social profiles update mutation  
  const updateSocialProfilesMutation = useMutation({
    mutationFn: async (profiles: Array<{platform: string, username: string}>) => {
      const response = await fetch('/api/profile/social-profiles', {
        method: 'PUT', 
        body: JSON.stringify({ socialProfiles: profiles }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Error al actualizar redes sociales');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✓ Redes sociales actualizadas",
        description: "Tus redes sociales se han guardado correctamente",
      });
    },
  });

  // Video call topics update mutation
  const updateTopicsMutation = useMutation({
    mutationFn: async (topics: string[]) => {
      const response = await fetch('/api/profile/video-call-topics', {
        method: 'PUT',
        body: JSON.stringify({ topics }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Error al actualizar temas');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✓ Temas actualizados",
        description: "Los temas de videollamada se han guardado correctamente",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const addSocialProfile = () => {
    setSocialProfiles(prev => [...prev, { platform: 'Instagram', username: '' }]);
  };

  const removeSocialProfile = (index: number) => {
    setSocialProfiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateSocialProfile = (index: number, field: 'platform' | 'username', value: string) => {
    setSocialProfiles(prev => prev.map((profile, i) => 
      i === index ? { ...profile, [field]: value } : profile
    ));
  };

  if (!user) return null;

  return (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
      {!open && (
        <DialogTrigger asChild>
          <Button>Editar Perfil</Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Perfil Completo
          </DialogTitle>
          <DialogDescription>
            Personaliza tu información profesional
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="social">Redes Sociales</TabsTrigger>
            <TabsTrigger value="topics">Temas</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información básica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título Profesional</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
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
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ""} 
                              rows={4}
                              placeholder="Cuéntanos sobre ti..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full"
                    >
                      {updateProfileMutation.isPending ? "Guardando..." : "Guardar Información Básica"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Categorías Profesionales</CardTitle>
                <CardDescription>
                  Selecciona las áreas en las que ofreces servicios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(categories as Array<{id: number, name: string}>).map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="text-sm">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>

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

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociales</CardTitle>
                <CardDescription>
                  Añade tus perfiles profesionales en redes sociales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialProfiles.map((profile, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <Select
                      value={profile.platform}
                      onValueChange={(value) => updateSocialProfile(index, 'platform', value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {socialPlatforms.map((platform) => (
                          <SelectItem key={platform.name} value={platform.name}>
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Usuario o URL"
                      value={profile.username}
                      onChange={(e) => updateSocialProfile(index, 'username', e.target.value)}
                      className="flex-1"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSocialProfile(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addSocialProfile}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Red Social
                </Button>

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

          {/* Video Call Topics Tab */}
          <TabsContent value="topics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Temas de Videollamada</CardTitle>
                <CardDescription>
                  Personaliza los temas que ofreces en tus videollamadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TopicsEditor
                  topics={videoCallTopics}
                  onTopicsChange={setVideoCallTopics}
                  disabled={updateTopicsMutation.isPending}
                />
                
                <Button
                  onClick={() => updateTopicsMutation.mutate(videoCallTopics)}
                  disabled={updateTopicsMutation.isPending}
                  className="w-full mt-4"
                >
                  {updateTopicsMutation.isPending ? "Guardando..." : "Guardar Temas"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
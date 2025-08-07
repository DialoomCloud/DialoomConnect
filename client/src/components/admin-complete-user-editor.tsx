import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Settings, Briefcase, Globe, MessageSquare, CreditCard, Upload, Play, Image, Youtube, Trash2, Camera, UserCircle, Plus, X } from 'lucide-react';
import { MediaEmbed } from '@/components/media-embed';
import { MediaUploadModal } from '@/components/media-upload-modal';
import { MediaEditModal } from '@/components/media-edit-modal';
import { MediaViewerModal } from '@/components/media-viewer-modal';

interface AdminCompleteUserEditorProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminCompleteUserEditor({ userId, open, onOpenChange }: AdminCompleteUserEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  
  // Media modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [viewingContent, setViewingContent] = useState<any>(null);
  
  // Profile image upload state
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch complete user profile including host configurations
  const { data: userProfile, isLoading } = useQuery<{
    user: any;
    skills: any[];
    languages: any[];
    categories: any[];
    mediaContent: any[];
    socialProfiles: any[];
    hostAvailability?: any[];
    hostPricing?: any[];
    hostCategories?: any[];
    verificationDocuments?: any[];
  }>({
    queryKey: [`/api/admin/users/${userId}/complete-profile`],
    queryFn: async () => {
      const response = await apiRequest(
        `/api/admin/users/${userId}/complete-profile`
      );
      return response.json();
    },
    enabled: open && !!userId,
  });

  // Effect to update form data when user profile data is loaded
  useEffect(() => {
    if (userProfile) {
      const user = userProfile.user || {};
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        title: user.title || '',
        description: user.description || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        countryCode: user.countryCode || '',
        role: user.role || 'registered',
        isHost: user.isHost || false,
        isAdmin: user.isAdmin || false,
        isActive: user.isActive !== false,
        isVerified: user.isVerified || false,
        isRecommended: user.isRecommended || false,
        isFeatured: user.isFeatured || false,
        primaryLanguageId: user.primaryLanguageId,
        categoryId: user.categoryId,
        skillIds: userProfile.skills?.map((s: any) => s.skillId) || [],
        languageIds: userProfile.languages?.map((l: any) => l.languageId) || [],
        categoryIds: userProfile.categories?.map((c: any) => c.categoryId) || [],
        socialProfiles:
          userProfile.socialProfiles?.map((sp: any) => ({
            platformId: sp.platformId,
            username: sp.username,
          })) || [],
        // Host-specific configurations
        hostAvailability: userProfile.hostAvailability || [],
        hostPricing: userProfile.hostPricing || [],
        videoCallTopics: user.videoCallTopics || [],
      });
      
      // Set profile image preview if user has one
      if (user.profileImageUrl) {
        setProfileImagePreview(user.profileImageUrl.startsWith('/storage/') 
          ? user.profileImageUrl 
          : `/storage/${user.profileImageUrl}`);
      }
    }
  }, [userProfile]);

  // Fetch reference data
  const { data: allSkills = [] } = useQuery<any[]>({
    queryKey: ["/api/skills"],
    enabled: open,
  });

  const { data: allCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    enabled: open,
  });

  const { data: allLanguages = [] } = useQuery<any[]>({
    queryKey: ["/api/languages"],
    enabled: open,
  });

  const { data: allCountries = [] } = useQuery<any[]>({
    queryKey: ["/api/countries"],
    enabled: open,
  });

  const { data: socialPlatforms = [] } = useQuery<any[]>({
    queryKey: ["/api/social-platforms"],
    enabled: open,
  });

  // Form state
  const [formData, setFormData] = useState<any>({
    // Basic info
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    title: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    countryCode: '',
    role: 'registered',
    isHost: false,
    isAdmin: false,
    isActive: true,
    isVerified: false,
    isRecommended: false,
    isFeatured: false,
    // Profile specific
    primaryLanguageId: null,
    categoryId: null,
    // Arrays
    skillIds: [] as number[],
    languageIds: [] as number[],
    categoryIds: [] as number[],
    socialProfiles: [] as { platformId: number; username: string }[],
    // Host-specific configurations
    hostAvailability: [] as any[],
    hostPricing: [] as any[],
    videoCallTopics: [] as string[],
  });


  // Update mutation
  const updateUserMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest(`/api/admin/users/${userId}/profile`, {
        method: "PUT",
        body: updates
      });
      return response.json();
    },
    onSuccess: async () => {
      // Invalidate queries first and wait for them to complete
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }),
        queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/complete-profile`] })
      ]);
      
      toast({
        title: "Perfil actualizado",
        description: "Todos los cambios se han guardado correctamente",
      });
      
      // Add a small delay before closing to ensure all operations complete
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedFormData = { ...formData };
    
    // Clean data before sending - convert empty strings to null for foreign key fields
    const cleanedData: any = {};
    Object.keys(updatedFormData).forEach(key => {
      const value = (updatedFormData as any)[key];
      
      // Handle foreign key fields that need null instead of empty strings
      if (key === 'countryCode' || key === 'nationality') {
        cleanedData[key] = value === '' || value === undefined ? null : value;
      } else if (key === 'primaryLanguageId' || key === 'categoryId') {
        // Ensure these are numbers or null
        cleanedData[key] = value === '' || value === undefined || value === null ? null : parseInt(value, 10);
      } else if (typeof value === 'string' && value === '') {
        // Convert other empty strings to null for database consistency
        cleanedData[key] = null;
      } else {
        cleanedData[key] = value;
      }
    });
    
    // Handle profile image upload if a new file was selected
    if (profileImageFile) {
      try {
        console.log('Uploading profile image:', {
          fileName: profileImageFile.name,
          fileSize: profileImageFile.size,
          fileType: profileImageFile.type,
          userId: userId
        });
        
        const imageFormData = new FormData();
        imageFormData.append('image', profileImageFile);
        imageFormData.append('userId', userId);
        
        // Log FormData contents
        console.log('FormData contents:');
        for (let [key, value] of imageFormData.entries()) {
          console.log(`- ${key}:`, value);
        }
        
        const uploadResponse = await apiRequest('/api/admin/upload/profile-image', {
          method: 'POST',
          body: imageFormData,
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Upload failed:', errorText);
          throw new Error(errorText);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log('Upload successful:', uploadResult);
        
        toast({
          title: "Imagen de perfil actualizada",
          description: "La imagen se ha subido correctamente",
        });
        
        // Clear the file after successful upload
        setProfileImageFile(null);
      } catch (error: any) {
        console.error('Error during image upload:', error);
        const errorMessage = error?.message || "No se pudo subir la imagen de perfil";
        
        // Try to parse JSON error if present
        try {
          const errorObj = JSON.parse(errorMessage);
          toast({
            title: "Error al subir imagen",
            description: errorObj.message || errorMessage,
            variant: "destructive",
          });
        } catch {
          toast({
            title: "Error al subir imagen",
            description: errorMessage,
            variant: "destructive",
          });
        }
        return;
      }
    }
    
    // Include host configuration data if user is a host
    if (formData.isHost) {
      cleanedData.hostAvailability = formData.hostAvailability;
      cleanedData.hostPricing = formData.hostPricing;
    }
    
    updateUserMutation.mutate(cleanedData);
  };

  // Profile image handlers
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  // Media deletion handler
  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este contenido multimedia?')) {
      return;
    }

    try {
      await apiRequest(`/api/media/${mediaId}`, {
        method: 'DELETE',
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/complete-profile`] });
      
      toast({
        title: "Media eliminada",
        description: "El contenido multimedia ha sido eliminado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo eliminar el contenido multimedia",
        variant: "destructive",
      });
    }
  };

  const toggleSkill = (skillId: number) => {
    setFormData(prev => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter(id => id !== skillId)
        : [...prev.skillIds, skillId]
    }));
  };

  const toggleLanguage = (languageId: number) => {
    setFormData(prev => ({
      ...prev,
      languageIds: prev.languageIds.includes(languageId)
        ? prev.languageIds.filter(id => id !== languageId)
        : [...prev.languageIds, languageId]
    }));
  };

  const toggleCategory = (categoryId: number) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  const updateSocialProfile = (platformId: number, username: string) => {
    setFormData(prev => ({
      ...prev,
      socialProfiles: prev.socialProfiles.some(sp => sp.platformId === platformId)
        ? prev.socialProfiles.map(sp => 
            sp.platformId === platformId ? { ...sp, username } : sp
          )
        : [...prev.socialProfiles, { platformId, username }]
    }));
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Cargando perfil completo...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editor Completo de Perfil - Admin</DialogTitle>
          <DialogDescription>
            Edita todos los aspectos del perfil del usuario: información básica, categorías, habilidades, idiomas y más.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Profesional
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Social
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Multimedia
              </TabsTrigger>
              <TabsTrigger value="host" className="flex items-center gap-2" disabled={!formData.isHost}>
                <CreditCard className="w-4 h-4" />
                Tarifas
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Config
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Profile Image Section */}
                  <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-gray-50">
                    <div className="relative">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Imagen de perfil"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                          <UserCircle className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleProfileImageClick}
                        className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Imagen de Perfil</p>
                      <p className="text-xs text-gray-500">Haz clic en el icono de cámara para cambiar</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellidos</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Usuario</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Título Profesional</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej: Desarrollador Senior, Consultor IT..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      placeholder="Descripción profesional del usuario..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="countryCode">País</Label>
                      <Select
                        value={formData.countryCode || ''}
                        onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar país" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCountries.map((country: any) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professional Tab */}
            <TabsContent value="professional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Categorías Profesionales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allCategories.map((category: any) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={formData.categoryIds.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Habilidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allSkills.map((skill: any) => (
                      <div key={skill.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill.id}`}
                          checked={formData.skillIds.includes(skill.id)}
                          onCheckedChange={() => toggleSkill(skill.id)}
                        />
                        <Label htmlFor={`skill-${skill.id}`}>{skill.name}</Label>
                        {skill.category && (
                          <Badge variant="outline" className="text-xs">
                            {skill.category}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Idiomas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allLanguages.map((language: any) => (
                      <div key={language.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`language-${language.id}`}
                          checked={formData.languageIds.includes(language.id)}
                          onCheckedChange={() => toggleLanguage(language.id)}
                        />
                        <Label htmlFor={`language-${language.id}`}>
                          {language.name} ({language.nativeName})
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Perfiles de Redes Sociales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {socialPlatforms.map((platform: any) => {
                    const existingProfile = formData.socialProfiles.find(
                      sp => sp.platformId === platform.id
                    );
                    return (
                      <div key={platform.id} className="flex items-center space-x-4">
                        <Label className="w-32">{platform.displayName}:</Label>
                        <Input
                          value={existingProfile?.username || ''}
                          onChange={(e) => updateSocialProfile(platform.id, e.target.value)}
                          placeholder={platform.placeholder}
                          className="flex-1"
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Contenido Multimedia</span>
                    <Button
                      onClick={() => setShowUploadModal(true)}
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Agregar Media
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userProfile?.mediaContent && userProfile.mediaContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userProfile.mediaContent.map((content: any) => (
                        <div key={content.id} className="relative group">
                          <MediaEmbed
                            content={content}
                            showEdit={false}
                            onView={(c) => {
                              setViewingContent(c);
                              setShowViewerModal(true);
                            }}
                          />
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingContent(content);
                                setShowEditModal(true);
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteMedia(content.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay contenido multimedia</p>
                      <p className="text-sm mt-2">Haz clic en "Agregar Media" para agregar contenido.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Host Configuration Tab */}
            <TabsContent value="host" className="space-y-4">
              {formData.isHost ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de Precios</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Free Consultation */}
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-medium mb-2">Consulta Gratuita</h4>
                        <div className="flex items-center gap-4">
                          <Label>Duración (minutos):</Label>
                          <Input
                            type="number"
                            value={formData.hostPricing?.find((p: any) => p.duration === 0)?.duration || 0}
                            disabled
                            className="w-24"
                          />
                          <span className="text-green-600 font-medium">GRATIS</span>
                        </div>
                      </div>
                      
                      {/* Paid Sessions - Show ALL pricing configurations */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Sesiones de Pago</h4>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newPricing = [...(formData.hostPricing || [])];
                              // Find a duration that doesn't exist yet
                              const existingDurations = newPricing.map(p => p.duration);
                              const commonDurations = [30, 60, 90, 120, 150, 180];
                              const nextDuration = commonDurations.find(d => !existingDurations.includes(d)) || 60;
                              
                              newPricing.push({ 
                                duration: nextDuration, 
                                price: '', 
                                currency: 'EUR',
                                isCustom: true,
                                includesScreenSharing: false,
                                includesTranslation: false,
                                includesRecording: false,
                                includesTranscription: false
                              });
                              setFormData({ ...formData, hostPricing: newPricing });
                            }}
                          >
                            Agregar Tarifa
                          </Button>
                        </div>
                        
                        {/* Show standard durations first (30, 60, 90) */}
                        {[30, 60, 90].map(duration => {
                          const pricing = formData.hostPricing?.find((p: any) => p.duration === duration);
                          return (
                            <div key={`standard-${duration}`} className="flex items-center gap-4 p-3 border rounded bg-gray-50">
                              <Label className="w-24 font-medium">{duration} min:</Label>
                              <Input
                                type="number"
                                placeholder="Precio en EUR"
                                value={pricing?.price || ''}
                                onChange={(e) => {
                                  const newPricing = formData.hostPricing || [];
                                  const index = newPricing.findIndex((p: any) => p.duration === duration);
                                  if (index >= 0) {
                                    newPricing[index] = { ...newPricing[index], price: e.target.value };
                                  } else {
                                    newPricing.push({ 
                                      duration, 
                                      price: e.target.value, 
                                      currency: 'EUR',
                                      isCustom: false,
                                      includesScreenSharing: false,
                                      includesTranslation: false,
                                      includesRecording: false,
                                      includesTranscription: false
                                    });
                                  }
                                  setFormData({ ...formData, hostPricing: newPricing });
                                }}
                                className="w-32"
                              />
                              <span>EUR</span>
                              <div className="flex items-center gap-2 ml-auto">
                                <Checkbox
                                  checked={pricing?.includesScreenSharing || false}
                                  onCheckedChange={(checked) => {
                                    const newPricing = [...(formData.hostPricing || [])];
                                    const index = newPricing.findIndex((p: any) => p.duration === duration);
                                    if (index >= 0) {
                                      newPricing[index] = { ...newPricing[index], includesScreenSharing: checked };
                                      setFormData({ ...formData, hostPricing: newPricing });
                                    }
                                  }}
                                />
                                <Label className="text-sm">Compartir pantalla</Label>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Show ALL custom pricing configurations */}
                        {formData.hostPricing?.filter((p: any) => ![0, 30, 60, 90].includes(p.duration)).map((pricing: any, index: number) => (
                          <div key={`custom-${pricing.duration}-${index}`} className="flex items-center gap-4 p-3 border rounded bg-blue-50">
                            <div className="flex items-center gap-2 w-24">
                              <Input
                                type="number"
                                value={pricing.duration}
                                onChange={(e) => {
                                  const newPricing = [...formData.hostPricing];
                                  const actualIndex = newPricing.findIndex(p => p.id === pricing.id || (p.duration === pricing.duration && p.price === pricing.price));
                                  if (actualIndex >= 0) {
                                    newPricing[actualIndex] = { ...newPricing[actualIndex], duration: parseInt(e.target.value) || 0 };
                                    setFormData({ ...formData, hostPricing: newPricing });
                                  }
                                }}
                                className="w-16 text-sm"
                                min="1"
                              />
                              <span className="text-sm font-medium">min:</span>
                            </div>
                            <Input
                              type="number"
                              placeholder="Precio en EUR"
                              value={pricing.price || ''}
                              onChange={(e) => {
                                const newPricing = [...formData.hostPricing];
                                const actualIndex = newPricing.findIndex(p => p.id === pricing.id || (p.duration === pricing.duration && p.price === pricing.price));
                                if (actualIndex >= 0) {
                                  newPricing[actualIndex] = { ...newPricing[actualIndex], price: e.target.value };
                                  setFormData({ ...formData, hostPricing: newPricing });
                                }
                              }}
                              className="w-32"
                            />
                            <span>EUR</span>
                            <Badge variant="secondary" className="text-xs">Personalizada</Badge>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={pricing?.includesScreenSharing || false}
                                onCheckedChange={(checked) => {
                                  const newPricing = [...formData.hostPricing];
                                  const actualIndex = newPricing.findIndex(p => p.id === pricing.id || (p.duration === pricing.duration && p.price === pricing.price));
                                  if (actualIndex >= 0) {
                                    newPricing[actualIndex] = { ...newPricing[actualIndex], includesScreenSharing: checked };
                                    setFormData({ ...formData, hostPricing: newPricing });
                                  }
                                }}
                              />
                              <Label className="text-sm">Pantalla</Label>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newPricing = formData.hostPricing.filter(
                                  (p: any) => !(p.id === pricing.id || (p.duration === pricing.duration && p.price === pricing.price))
                                );
                                setFormData({ ...formData, hostPricing: newPricing });
                              }}
                              className="ml-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Disponibilidad Horaria</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        Configura la disponibilidad semanal recurrente del host
                      </div>
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => {
                        const availability = formData.hostAvailability?.filter((a: any) => a.dayOfWeek === index) || [];
                        return (
                          <div key={day} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="font-medium">{day}</Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newAvailability = [...(formData.hostAvailability || [])];
                                  newAvailability.push({
                                    dayOfWeek: index,
                                    startTime: '09:00',
                                    endTime: '17:00',
                                    isActive: true
                                  });
                                  setFormData({ ...formData, hostAvailability: newAvailability });
                                }}
                              >
                                Agregar horario
                              </Button>
                            </div>
                            {availability.map((slot: any, slotIndex: number) => (
                              <div key={slotIndex} className="flex items-center gap-2 mt-2">
                                <Input
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => {
                                    const newAvailability = [...formData.hostAvailability];
                                    const actualIndex = newAvailability.findIndex(
                                      (a: any) => a.dayOfWeek === index && a.startTime === slot.startTime
                                    );
                                    if (actualIndex >= 0) {
                                      newAvailability[actualIndex] = { ...newAvailability[actualIndex], startTime: e.target.value };
                                      setFormData({ ...formData, hostAvailability: newAvailability });
                                    }
                                  }}
                                  className="w-32"
                                />
                                <span>-</span>
                                <Input
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) => {
                                    const newAvailability = [...formData.hostAvailability];
                                    const actualIndex = newAvailability.findIndex(
                                      (a: any) => a.dayOfWeek === index && a.startTime === slot.startTime
                                    );
                                    if (actualIndex >= 0) {
                                      newAvailability[actualIndex] = { ...newAvailability[actualIndex], endTime: e.target.value };
                                      setFormData({ ...formData, hostAvailability: newAvailability });
                                    }
                                  }}
                                  className="w-32"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newAvailability = formData.hostAvailability.filter(
                                      (a: any) => !(a.dayOfWeek === index && a.startTime === slot.startTime)
                                    );
                                    setFormData({ ...formData, hostAvailability: newAvailability });
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-gray-500">
                      <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Este usuario no es un host</p>
                      <p className="text-sm mt-2">Activa el rol de Host en la pestaña de Configuración para habilitar estas opciones.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Roles y Permisos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="role">Rol Principal</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registered">Registrado</SelectItem>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Roles Adicionales</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isHost"
                        checked={formData.isHost}
                        onCheckedChange={(checked) => setFormData({ ...formData, isHost: Boolean(checked) })}
                      />
                      <Label htmlFor="isHost">Es Host</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAdmin"
                        checked={formData.isAdmin}
                        onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: Boolean(checked) })}
                      />
                      <Label htmlFor="isAdmin">Es Admin</Label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Estado de la Cuenta</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: Boolean(checked) })}
                      />
                      <Label htmlFor="isActive">Cuenta Activa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isVerified"
                        checked={formData.isVerified}
                        onCheckedChange={(checked) => setFormData({ ...formData, isVerified: Boolean(checked) })}
                      />
                      <Label htmlFor="isVerified">Usuario Verificado</Label>
                    </div>
                    {formData.isHost && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isRecommended"
                          checked={formData.isRecommended}
                          onCheckedChange={(checked) => setFormData({ ...formData, isRecommended: Boolean(checked) })}
                        />
                        <Label htmlFor="isRecommended">Host Recomendado</Label>
                      </div>
                    )}
                    {formData.isHost && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isFeatured"
                          checked={formData.isFeatured}
                          onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: Boolean(checked) })}
                        />
                        <Label htmlFor="isFeatured">Host Destacado</Label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Todos los Cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    
    {/* Media Modals */}
    <MediaUploadModal
      isOpen={showUploadModal}
      onClose={() => {
        setShowUploadModal(false);
        queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/complete-profile`] });
      }}
    />
    
    <MediaEditModal
      isOpen={showEditModal}
      onClose={() => {
        setShowEditModal(false);
        setEditingContent(null);
        queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/complete-profile`] });
      }}
      content={editingContent}
    />
    
    <MediaViewerModal
      isOpen={showViewerModal}
      onClose={() => {
        setShowViewerModal(false);
        setViewingContent(null);
      }}
      content={viewingContent}
      onEdit={(c) => {
        setEditingContent(c);
        setShowEditModal(true);
        setShowViewerModal(false);
      }}
      onDelete={handleDeleteMedia}
    />
    </>
  );
}
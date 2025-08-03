import { useState, useEffect } from 'react';
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
import { Loader2, User, Settings, Briefcase, Globe, MessageSquare, CreditCard, Upload, Play, Image, Youtube, Trash2 } from 'lucide-react';
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

  // Fetch complete user profile
  const { data: userProfile, isLoading } = useQuery<{
    user: any;
    skills: any[];
    languages: any[];
    categories: any[];
    mediaContent: any[];
    socialProfiles: any[];
  }>({
    queryKey: [`/api/admin/users/${userId}/complete-profile`],
    enabled: open && !!userId,
  });

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
  const [formData, setFormData] = useState({
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
    role: 'guest',
    isHost: false,
    isAdmin: false,
    isActive: true,
    isVerified: false,
    // Profile specific
    primaryLanguageId: null,
    categoryId: null,
    // Arrays
    skillIds: [] as number[],
    languageIds: [] as number[],
    categoryIds: [] as number[],
    socialProfiles: [] as { platformId: number; username: string }[],
  });

  // Initialize form data when user profile is loaded
  useEffect(() => {
    if (userProfile?.user) {
      const user = userProfile.user;
      
      // Debug categories
      console.log('User categories:', userProfile.categories);
      
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
        role: user.role || 'guest',
        isHost: user.isHost || false,
        isAdmin: user.isAdmin || false,
        isActive: user.isActive !== false,
        isVerified: user.isVerified || false,
        primaryLanguageId: user.primaryLanguageId,
        categoryId: user.categoryId,
        skillIds: userProfile.skills?.map((s: any) => s.skillId) || [],
        languageIds: userProfile.languages?.map((l: any) => l.languageId) || [],
        categoryIds: userProfile.categories?.map((c: any) => c.categoryId) || [],
        socialProfiles: userProfile.socialProfiles?.map((sp: any) => ({
          platformId: sp.platformId,
          username: sp.username
        })) || [],
      });
    }
  }, [userProfile]);

  // Update mutation
  const updateUserMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest(`/api/admin/users/${userId}/profile`, {
        method: "PUT",
        body: updates
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/complete-profile`] });
      toast({
        title: "Perfil actualizado",
        description: "Todos los cambios se han guardado correctamente",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate(formData);
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
            <TabsList className="grid w-full grid-cols-5">
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
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuración
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <SelectItem value="guest">Guest</SelectItem>
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
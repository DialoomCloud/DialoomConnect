import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Globe,
  FileText,
  Image,
  Video,
  Link,
  Save,
  X,
  Loader2,
  Upload,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
} from "lucide-react";
import type { NewsArticle } from "@shared/schema";

export default function AdminNewsManagement() {
  const { toast } = useToast();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch all articles
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['/api/admin/news/articles', filterStatus],
    queryFn: async () => {
      const url = filterStatus === 'all' 
        ? '/api/admin/news/articles' 
        : `/api/admin/news/articles?status=${filterStatus}`;
      const response = await apiRequest('GET', url);
      return response.json();
    },
  });

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/admin/news/articles/${id}`, { method: 'DELETE' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news/articles'] });
      toast({
        title: "Artículo eliminado",
        description: "El artículo ha sido eliminado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el artículo",
        variant: "destructive",
      });
    },
  });

  // Publish article mutation
  const publishArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/admin/news/articles/${id}/publish`, { method: 'PUT' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news/articles'] });
      toast({
        title: "Artículo publicado",
        description: "El artículo ha sido publicado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al publicar el artículo",
        variant: "destructive",
      });
    },
  });

  const handleCreateArticle = () => {
    setSelectedArticle(null);
    setEditorMode('create');
    setShowEditor(true);
  };

  const handleEditArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setEditorMode('edit');
    setShowEditor(true);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      deleteArticleMutation.mutate(id);
    }
  };

  const handlePublishArticle = (id: string) => {
    publishArticleMutation.mutate(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Borrador</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Noticias</h2>
          <p className="text-gray-600">Crea, edita y publica artículos para la página principal</p>
        </div>
        <Button onClick={handleCreateArticle}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Artículo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Label htmlFor="status-filter">Filtrar por estado:</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="archived">Archivados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: NewsArticle) => (
          <Card key={article.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg line-clamp-2">{article.title || ''}</CardTitle>
                {getStatusBadge(article.status || 'draft')}
              </div>
              {article.excerpt && (
                <p className="text-sm text-gray-600 line-clamp-3">{article.excerpt}</p>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                {article.featuredImage && (
                  <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={article.featuredImage} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {article.viewCount || 0}
                  </div>
                  {article.isFeatured && (
                    <Badge variant="outline" className="text-xs">
                      Destacado
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {article.publishedAt 
                    ? `Publicado: ${new Date(article.publishedAt).toLocaleDateString()}`
                    : article.createdAt 
                    ? `Creado: ${new Date(article.createdAt).toLocaleDateString()}`
                    : 'Fecha no disponible'
                  }
                </p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditArticle(article)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {article.status === 'draft' && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handlePublishArticle(article.id)}
                    disabled={publishArticleMutation.isPending}
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteArticle(article.id)}
                  disabled={deleteArticleMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay artículos</h3>
          <p className="text-gray-500 mb-4">
            {filterStatus === 'all' 
              ? 'No tienes ningún artículo creado aún.'
              : `No tienes artículos con estado "${filterStatus}".`
            }
          </p>
          <Button onClick={handleCreateArticle}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primer artículo
          </Button>
        </div>
      )}

      {/* Article Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editorMode === 'create' ? 'Crear Nuevo Artículo' : 'Editar Artículo'}
            </DialogTitle>
          </DialogHeader>
          
          <ArticleEditor
            article={selectedArticle}
            mode={editorMode}
            onClose={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Rich Article Editor Component
function ArticleEditor({ 
  article, 
  mode, 
  onClose 
}: { 
  article: NewsArticle | null; 
  mode: 'create' | 'edit'; 
  onClose: () => void;
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    featuredImage: article?.featuredImage || '',
    status: article?.status || 'draft',
    isFeatured: article?.isFeatured || false,
    tags: article?.tags?.join(', ') || '',
    metaTitle: article?.metaTitle || '',
    metaDescription: article?.metaDescription || '',
  });

  // Save article mutation
  const saveArticleMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = mode === 'create' 
        ? '/api/admin/news/articles'
        : `/api/admin/news/articles/${article?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
      };
      const response = await apiRequest(url, { method, body: payload });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news/articles'] });
      toast({
        title: mode === 'create' ? "Artículo creado" : "Artículo actualizado",
        description: "Los cambios se han guardado exitosamente",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el artículo",
        variant: "destructive",
      });
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/admin/news/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to upload image');
      return response.json();
    },
    onSuccess: (data) => {
      setFormData(prev => ({ ...prev, featuredImage: data.imageUrl }));
      toast({
        title: "Imagen subida",
        description: "La imagen se subió exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Error al subir la imagen",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImageMutation.mutate(file);
    }
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "El título y el contenido son obligatorios",
        variant: "destructive",
      });
      return;
    }
    
    saveArticleMutation.mutate(formData);
  };

  const insertAtCursor = (tag: string, closingTag?: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let insertion = closingTag 
      ? `${tag}${selectedText}${closingTag}`
      : `${tag}${selectedText}`;
    
    const newContent = 
      textarea.value.substring(0, start) + 
      insertion + 
      textarea.value.substring(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + tag.length, 
        start + tag.length + selectedText.length
      );
    }, 0);
  };

  const insertYouTubeEmbed = () => {
    const url = prompt('Ingresa la URL del video de YouTube:');
    if (!url) return;
    
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      toast({
        title: "Error",
        description: "URL de YouTube no válida",
        variant: "destructive",
      });
      return;
    }
    
    const embedCode = `
<div class="youtube-embed" style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; margin: 20px 0;">
  <iframe 
    src="https://www.youtube.com/embed/${videoId}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0" 
    allowfullscreen>
  </iframe>
</div>
`;
    
    insertAtCursor(embedCode);
  };

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const insertLink = () => {
    const url = prompt('Ingresa la URL:');
    if (!url) return;
    
    const text = prompt('Texto del enlace:', url);
    if (!text) return;
    
    insertAtCursor(`<a href="${url}" target="_blank">${text}</a>`);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título del artículo"
              className="mt-1"
            />
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Resumen</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Breve descripción del artículo"
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Featured Image */}
          <div>
            <Label>Imagen destacada</Label>
            <div className="mt-2 flex gap-4 items-start">
              <div className="flex-1">
                <Input
                  value={formData.featuredImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                  placeholder="URL de la imagen"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadImageMutation.isPending}
                >
                  {uploadImageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Subir imagen
                </Button>
              </div>
              {formData.featuredImage && (
                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                  <img 
                    src={formData.featuredImage} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <Label htmlFor="content-editor">Contenido *</Label>
            
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-t-md bg-gray-50">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertAtCursor('<strong>', '</strong>')}
                title="Negrita"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertAtCursor('<em>', '</em>')}
                title="Cursiva"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertAtCursor('<u>', '</u>')}
                title="Subrayado"
              >
                <Underline className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertAtCursor('<h2>', '</h2>')}
                title="Título H2"
              >
                H2
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertAtCursor('<h3>', '</h3>')}
                title="Título H3"
              >
                H3
              </Button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertAtCursor('<ul><li>', '</li></ul>')}
                title="Lista"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertAtCursor('<ol><li>', '</li></ol>')}
                title="Lista numerada"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={insertLink}
                title="Insertar enlace"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={insertYouTubeEmbed}
                title="Insertar video de YouTube"
              >
                <Video className="h-4 w-4" />
              </Button>
            </div>
            
            <Textarea
              id="content-editor"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Escribe el contenido del artículo aquí. Puedes usar HTML para formato avanzado."
              rows={15}
              className="mt-0 rounded-t-none"
            />
            
            <div className="mt-2 text-sm text-gray-500">
              Puedes usar HTML básico para formatear el contenido. Usa la barra de herramientas para insertar elementos comunes.
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          {/* Status */}
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value: "draft" | "published" | "archived") => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured */}
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
            />
            <Label htmlFor="featured">Marcar como destacado</Label>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Etiquetas</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="etiqueta1, etiqueta2, etiqueta3"
              className="mt-1"
            />
            <div className="mt-1 text-sm text-gray-500">
              Separa las etiquetas con comas
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="seo" className="space-y-4">
          {/* Meta Title */}
          <div>
            <Label htmlFor="meta-title">Título SEO</Label>
            <Input
              id="meta-title"
              value={formData.metaTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
              placeholder="Título para motores de búsqueda"
              className="mt-1"
            />
          </div>

          {/* Meta Description */}
          <div>
            <Label htmlFor="meta-description">Descripción SEO</Label>
            <Textarea
              id="meta-description"
              value={formData.metaDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
              placeholder="Descripción para motores de búsqueda"
              rows={3}
              className="mt-1"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saveArticleMutation.isPending}>
          {saveArticleMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Crear Artículo' : 'Guardar Cambios'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
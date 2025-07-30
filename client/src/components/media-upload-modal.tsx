import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Youtube, Video, Image, Upload, X } from "lucide-react";

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MediaUploadModal({ isOpen, onClose }: MediaUploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // YouTube form state
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [youtubeDescription, setYoutubeDescription] = useState("");
  
  // File upload states
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  
  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // YouTube video mutation
  const youtubeVideoMutation = useMutation({
    mutationFn: async (data: { url: string; title: string; description: string; embedId: string }) => {
      return await apiRequest('/api/media', {
        method: 'POST',
        body: JSON.stringify({
          type: 'youtube',
          url: data.url,
          title: data.title,
          description: data.description,
          embedId: data.embedId,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({ title: "Video de YouTube agregado exitosamente" });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Error al agregar video de YouTube",
        variant: "destructive",
      });
    },
  });

  // Video upload mutation
  const videoUploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir video');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({ title: "Video subido exitosamente" });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Error al subir video",
        variant: "destructive",
      });
    },
  });

  // Image upload mutation
  const imageUploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir imagen');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({ title: "Imagen subida exitosamente" });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Error al subir imagen",
        variant: "destructive",
      });
    },
  });

  const handleYouTubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL de YouTube",
        variant: "destructive",
      });
      return;
    }

    const embedId = extractYouTubeId(youtubeUrl);
    if (!embedId) {
      toast({
        title: "Error",
        description: "URL de YouTube no válida",
        variant: "destructive",
      });
      return;
    }

    youtubeVideoMutation.mutate({
      url: youtubeUrl,
      title: youtubeTitle || "Video de YouTube",
      description: youtubeDescription,
      embedId,
    });
  };

  const handleVideoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVideoFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de video",
        variant: "destructive",
      });
      return;
    }

    if (selectedVideoFile.size > 50 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo excede el límite de 50MB",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedVideoFile);
    formData.append('title', videoTitle || selectedVideoFile.name);
    formData.append('description', videoDescription);

    videoUploadMutation.mutate(formData);
  };

  const handleImageUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImageFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen",
        variant: "destructive",
      });
      return;
    }

    if (selectedImageFile.size > 3 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo excede el límite de 3MB",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImageFile);
    formData.append('title', imageTitle || selectedImageFile.name);
    formData.append('description', imageDescription);

    imageUploadMutation.mutate(formData);
  };

  const handleClose = () => {
    // Reset all form states
    setYoutubeUrl("");
    setYoutubeTitle("");
    setYoutubeDescription("");
    setSelectedVideoFile(null);
    setSelectedImageFile(null);
    setVideoTitle("");
    setVideoDescription("");
    setImageTitle("");
    setImageDescription("");
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Agregar Contenido Multimedia</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="youtube" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="youtube" className="flex items-center space-x-2">
              <Youtube className="w-4 h-4" />
              <span>YouTube</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center space-x-2">
              <Video className="w-4 h-4" />
              <span>Video MP4</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Imagen</span>
            </TabsTrigger>
          </TabsList>

          {/* YouTube Tab */}
          <TabsContent value="youtube" className="space-y-4">
            <form onSubmit={handleYouTubeSubmit} className="space-y-4">
              <div>
                <Label htmlFor="youtube-url">URL de YouTube *</Label>
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="youtube-title">Título</Label>
                <Input
                  id="youtube-title"
                  placeholder="Título del video (opcional)"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="youtube-description">Descripción</Label>
                <Textarea
                  id="youtube-description"
                  placeholder="Descripción del video (opcional)"
                  value={youtubeDescription}
                  onChange={(e) => setYoutubeDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={youtubeVideoMutation.isPending}
                  className="bg-[hsl(244,91%,68%)] hover:bg-[hsl(244,91%,58%)]"
                >
                  {youtubeVideoMutation.isPending ? "Agregando..." : "Agregar Video"}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Video Upload Tab */}
          <TabsContent value="video" className="space-y-4">
            <form onSubmit={handleVideoUpload} className="space-y-4">
              <div>
                <Label htmlFor="video-file">Archivo de Video (MP4, máx. 50MB) *</Label>
                <Input
                  id="video-file"
                  type="file"
                  accept="video/mp4"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedVideoFile(file);
                    if (file) setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
                  }}
                  required
                />
                {selectedVideoFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Archivo seleccionado: {selectedVideoFile.name} ({formatFileSize(selectedVideoFile.size)})
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="video-title">Título</Label>
                <Input
                  id="video-title"
                  placeholder="Título del video"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="video-description">Descripción</Label>
                <Textarea
                  id="video-description"
                  placeholder="Descripción del video (opcional)"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={videoUploadMutation.isPending}
                  className="bg-[hsl(244,91%,68%)] hover:bg-[hsl(244,91%,58%)]"
                >
                  {videoUploadMutation.isPending ? "Subiendo..." : "Subir Video"}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Image Upload Tab */}
          <TabsContent value="image" className="space-y-4">
            <form onSubmit={handleImageUpload} className="space-y-4">
              <div>
                <Label htmlFor="image-file">Archivo de Imagen (JPG, PNG, WebP, máx. 3MB) *</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedImageFile(file);
                    if (file) setImageTitle(file.name.replace(/\.[^/.]+$/, ""));
                  }}
                  required
                />
                {selectedImageFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Archivo seleccionado: {selectedImageFile.name} ({formatFileSize(selectedImageFile.size)})
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="image-title">Título</Label>
                <Input
                  id="image-title"
                  placeholder="Título de la imagen"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="image-description">Descripción</Label>
                <Textarea
                  id="image-description"
                  placeholder="Descripción de la imagen (opcional)"
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={imageUploadMutation.isPending}
                  className="bg-[hsl(244,91%,68%)] hover:bg-[hsl(244,91%,58%)]"
                >
                  {imageUploadMutation.isPending ? "Subiendo..." : "Subir Imagen"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
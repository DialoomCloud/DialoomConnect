import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Youtube, Play, Image } from "lucide-react";

interface MediaContent {
  id: string;
  type: "youtube" | "video" | "image";
  url: string;
  title?: string;
  description?: string;
  embedId?: string;
  fileName?: string;
  fileSize?: number;
}

interface MediaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: MediaContent | null;
}

export function MediaEditModal({ isOpen, onClose, content }: MediaEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // Update form data when content changes
  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || "",
        description: content.description || "",
      });
    }
  }, [content]);

  const updateMediaMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      if (!content) return;
      const response = await apiRequest(`/api/media/${content.id}`, { 
        method: "PUT", 
        body: data 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Contenido actualizado",
        description: "Los cambios han sido guardados exitosamente.",
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
        description: "No se pudo actualizar el contenido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMediaMutation.mutate(formData);
  };

  const getTypeIcon = () => {
    if (!content) return null;
    switch (content.type) {
      case "youtube":
        return <Youtube className="text-red-600 text-xl" />;
      case "video":
        return <Play className="text-blue-600 text-xl" />;
      case "image":
        return <Image className="text-green-600 text-xl" />;
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    if (!content) return "";
    switch (content.type) {
      case "youtube":
        return "YouTube";
      case "video":
        return "Video Local";
      case "image":
        return "Imagen";
      default:
        return "";
    }
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(17,12%,6%)]">
            Editar Contenido
          </DialogTitle>
          <DialogDescription>
            Modifica el título y descripción de tu contenido multimedia
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg mb-4">
          {getTypeIcon()}
          <div>
            <span className="font-medium text-[hsl(17,12%,6%)]">
              {getTypeLabel()}
            </span>
            <p className="text-sm text-gray-600 truncate">
              {content.url}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Título
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1"
              placeholder="Título del contenido"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1"
              placeholder="Describe tu contenido..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={updateMediaMutation.isPending}
              className="bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)]"
            >
              {updateMediaMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
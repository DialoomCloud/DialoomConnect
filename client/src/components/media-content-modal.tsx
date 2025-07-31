import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Youtube, Instagram, Facebook, ArrowLeft } from "lucide-react";

interface MediaContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MediaType = "youtube" | "instagram" | "tiktok";

export function MediaContentModal({ isOpen, onClose }: MediaContentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<"select" | "form">("select");
  const [selectedType, setSelectedType] = useState<MediaType | null>(null);
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    description: "",
  });

  const extractEmbedId = (url: string, type: MediaType): string => {
    switch (type) {
      case "youtube":
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return youtubeMatch ? youtubeMatch[1] : "";
      case "instagram":
        const instagramMatch = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
        return instagramMatch ? instagramMatch[1] : "";
      case "tiktok":
        const tiktokMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
        return tiktokMatch ? tiktokMatch[1] : "";
      default:
        return "";
    }
  };

  const createMediaMutation = useMutation({
    mutationFn: async (data: { type: MediaType; url: string; title: string; description: string; embedId: string }) => {
      const response = await apiRequest("POST", "/api/media", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Contenido agregado",
        description: "Tu contenido multimedia ha sido agregado exitosamente.",
      });
      handleClose();
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
        description: "No se pudo agregar el contenido. Verifica la URL e inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleTypeSelect = (type: MediaType) => {
    setSelectedType(type);
    setStep("form");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    const embedId = extractEmbedId(formData.url, selectedType);
    if (!embedId) {
      toast({
        title: "URL inválida",
        description: "Por favor ingresa una URL válida para el tipo de contenido seleccionado.",
        variant: "destructive",
      });
      return;
    }

    createMediaMutation.mutate({
      type: selectedType,
      url: formData.url,
      title: formData.title,
      description: formData.description,
      embedId,
    });
  };

  const handleClose = () => {
    setStep("select");
    setSelectedType(null);
    setFormData({ url: "", title: "", description: "" });
    onClose();
  };

  const getPlaceholderUrl = (type: MediaType): string => {
    switch (type) {
      case "youtube":
        return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      case "instagram":
        return "https://www.instagram.com/p/ABC123def456/";
      case "tiktok":
        return "https://www.tiktok.com/@usuario/video/1234567890123456789";
      default:
        return "";
    }
  };

  const getTypeLabel = (type: MediaType): string => {
    switch (type) {
      case "youtube":
        return "YouTube";
      case "instagram":
        return "Instagram";
      case "tiktok":
        return "TikTok";
      default:
        return "";
    }
  };

  const getTypeIcon = (type: MediaType) => {
    switch (type) {
      case "youtube":
        return <Youtube className="text-red-600" />;
      case "instagram":
        return <Instagram className="text-pink-600" />;
      case "tiktok":
        return <Facebook className="text-black" />; // Using Facebook icon as placeholder for TikTok
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {step === "form" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("select")}
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <DialogTitle className="text-2xl font-bold text-[hsl(17,12%,6%)]">
              {step === "select" ? "Agregar Contenido" : `Agregar ${selectedType ? getTypeLabel(selectedType) : ""}`}
            </DialogTitle>
          </div>
        </DialogHeader>

        {step === "select" ? (
          <div className="space-y-4">
            <p className="text-gray-600">Elige el tipo de contenido que quieres agregar:</p>
            
            <Button
              variant="outline"
              className="w-full p-4 h-auto border-2 hover:border-red-500 hover:bg-red-50 transition-all flex items-center justify-start"
              onClick={() => handleTypeSelect("youtube")}
            >
              <Youtube className="text-red-600 text-2xl mr-4" />
              <div className="text-left">
                <h3 className="font-semibold text-[hsl(17,12%,6%)]">YouTube</h3>
                <p className="text-sm text-gray-600">Agrega videos de YouTube</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full p-4 h-auto border-2 hover:border-pink-500 hover:bg-pink-50 transition-all flex items-center justify-start"
              onClick={() => handleTypeSelect("instagram")}
            >
              <Instagram className="text-pink-600 text-2xl mr-4" />
              <div className="text-left">
                <h3 className="font-semibold text-[hsl(17,12%,6%)]">Instagram</h3>
                <p className="text-sm text-gray-600">Agrega posts de Instagram</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full p-4 h-auto border-2 hover:border-gray-800 hover:bg-gray-50 transition-all flex items-center justify-start"
              onClick={() => handleTypeSelect("tiktok")}
            >
              <Facebook className="text-black text-2xl mr-4" />
              <div className="text-left">
                <h3 className="font-semibold text-[hsl(17,12%,6%)]">TikTok</h3>
                <p className="text-sm text-gray-600">Agrega videos de TikTok</p>
              </div>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              {selectedType && getTypeIcon(selectedType)}
              <span className="font-medium text-[hsl(17,12%,6%)]">
                {selectedType && getTypeLabel(selectedType)}
              </span>
            </div>

            <div>
              <Label htmlFor="url" className="text-sm font-medium text-gray-700">
                URL del contenido *
              </Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="mt-1"
                placeholder={selectedType ? getPlaceholderUrl(selectedType) : ""}
                required
              />
            </div>

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
              <Button type="button" variant="outline" onClick={() => setStep("select")}>
                Atrás
              </Button>
              <Button 
                type="submit" 
                disabled={createMediaMutation.isPending}
                className="bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)]"
              >
                {createMediaMutation.isPending ? "Agregando..." : "Agregar Contenido"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

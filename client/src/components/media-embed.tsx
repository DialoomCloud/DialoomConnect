import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, Instagram, Facebook, ExternalLink, Edit2 } from "lucide-react";

interface MediaContent {
  id: string;
  type: "youtube" | "instagram" | "tiktok";
  url: string;
  title?: string;
  description?: string;
  embedId?: string;
}

interface MediaEmbedProps {
  content: MediaContent;
  onEdit?: (content: MediaContent) => void;
  showEdit?: boolean;
}

export function MediaEmbed({ content, onEdit, showEdit = false }: MediaEmbedProps) {
  const getTypeIcon = () => {
    switch (content.type) {
      case "youtube":
        return <Youtube className="text-red-600 text-xl" />;
      case "instagram":
        return <Instagram className="text-pink-600 text-xl" />;
      case "tiktok":
        return <Facebook className="text-black text-xl" />; // Using Facebook as placeholder for TikTok
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (content.type) {
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

  const getEmbedContent = () => {
    if (!content.embedId) {
      return (
        <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
          <div className="text-center">
            <ExternalLink className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Contenido no disponible</p>
          </div>
        </div>
      );
    }

    switch (content.type) {
      case "youtube":
        return (
          <iframe
            src={`https://www.youtube.com/embed/${content.embedId}`}
            title={content.title || "YouTube video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video rounded-lg"
          />
        );
      
      case "instagram":
        // Instagram improved visual representation
        if (content.embedId) {
          return (
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg aspect-square flex items-center justify-center p-4">
              <div className="text-center text-white">
                <Instagram className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm font-medium mb-2">Instagram Post</p>
                <p className="text-xs text-purple-100 mb-3">ID: {content.embedId}</p>
                <a 
                  href={content.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-purple-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                  Ver en Instagram
                </a>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg aspect-square flex items-center justify-center">
            <div className="text-center text-white">
              <Instagram className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm font-medium">Instagram Post</p>
              <a 
                href={content.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs underline hover:no-underline"
              >
                Ver en Instagram
              </a>
            </div>
          </div>
        );
      
      case "tiktok":
        // TikTok embed using oEmbed API - for now using iframe with proper aspect ratio
        if (content.embedId) {
          return (
            <div className="bg-black rounded-lg flex items-center justify-center" style={{ aspectRatio: "9/16", maxHeight: "400px" }}>
              <div className="text-center text-white p-4">
                <Facebook className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm font-medium mb-2">TikTok Video</p>
                <p className="text-xs text-gray-300 mb-3">ID: {content.embedId}</p>
                <a 
                  href={content.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-black px-3 py-1 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  Ver en TikTok
                </a>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-black rounded-lg aspect-[9/16] max-h-80 flex items-center justify-center">
            <div className="text-center text-white">
              <Facebook className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm font-medium">TikTok Video</p>
              <a 
                href={content.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs underline hover:no-underline"
              >
                Ver en TikTok
              </a>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
            <div className="text-center">
              <ExternalLink className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Tipo de contenido no soportado</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="bg-gray-50 border-[hsl(220,13%,90%)]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getTypeIcon()}
            <span className="font-medium text-gray-700">{getTypeLabel()}</span>
          </div>
          <div className="flex items-center space-x-2">
            {showEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(content)}
                className="text-gray-400 hover:text-[hsl(244,91%,68%)] p-1 h-auto"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            <a 
              href={content.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[hsl(244,91%,68%)] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {getEmbedContent()}

        {content.title && (
          <h4 className="font-medium text-[hsl(17,12%,6%)] mt-3 mb-1">{content.title}</h4>
        )}
        {content.description && (
          <p className="text-sm text-gray-600">{content.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

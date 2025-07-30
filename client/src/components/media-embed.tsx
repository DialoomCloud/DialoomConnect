import { Card, CardContent } from "@/components/ui/card";
import { Youtube, Instagram, Facebook, ExternalLink } from "lucide-react";

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
}

export function MediaEmbed({ content }: MediaEmbedProps) {
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
        // For Instagram, we'll show a placeholder since embedding requires special handling
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
        // For TikTok, we'll show a placeholder since embedding requires special handling
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
          <a 
            href={content.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[hsl(244,91%,68%)] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
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

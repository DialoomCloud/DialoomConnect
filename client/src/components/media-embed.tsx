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
        return (
          <div 
            className="relative group cursor-pointer"
            onClick={() => window.open(content.url, '_blank')}
          >
            {/* Instagram thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg overflow-hidden relative transform transition-transform group-hover:scale-[1.02]">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/40"></div>
              
              {/* Instagram icon as main visual element */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-4 shadow-lg transform transition-transform group-hover:scale-110">
                  <Instagram className="w-12 h-12 text-pink-600" />
                </div>
              </div>
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/70 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z"/>
                  </svg>
                </div>
              </div>
              
              {/* Bottom overlay with title */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white font-medium text-sm truncate">
                  {content.title || "Publicación de Instagram"}
                </p>
              </div>
              
              {/* Instagram branding badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                  <span className="text-white text-xs font-medium">Instagram</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "tiktok":
        return (
          <div 
            className="relative group cursor-pointer"
            onClick={() => window.open(content.url, '_blank')}
          >
            {/* TikTok thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-black via-gray-900 to-pink-900 rounded-lg overflow-hidden relative transform transition-transform group-hover:scale-[1.02]">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-pink-500/10 to-red-500/20"></div>
              
              {/* TikTok icon as main visual element */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full p-4 shadow-lg transform transition-transform group-hover:scale-110">
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 01-2.31-2.84A2.89 2.89 0 017.75 11.9a3.01 3.01 0 01.69.08V8.54a6.33 6.33 0 00-.69-.05A6.33 6.33 0 001.42 14.82 6.33 6.33 0 007.75 21.1 6.33 6.33 0 0014.08 14.82V9.54a8.16 8.16 0 004.77 1.52v-3.44a4.85 4.85 0 01-.84-.07z"/>
                  </svg>
                </div>
              </div>
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/70 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z"/>
                  </svg>
                </div>
              </div>
              
              {/* Bottom overlay with title */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white font-medium text-sm truncate">
                  {content.title || "Video de TikTok"}
                </p>
              </div>
              
              {/* TikTok branding badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                  <span className="text-white text-xs font-medium">TikTok</span>
                </div>
              </div>
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
    <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Media Content */}
        <div className="relative">
          {getEmbedContent()}
          
          {/* Action buttons overlay */}
          <div className="absolute top-3 right-3 flex items-center space-x-2">
            {showEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(content);
                }}
                className="bg-black/60 hover:bg-black/80 text-white p-2 h-auto backdrop-blur-sm rounded-full"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            <a 
              href={content.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-black/60 hover:bg-black/80 text-white p-2 h-auto backdrop-blur-sm rounded-full transition-colors inline-flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        
        {/* Content info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getTypeIcon()}
              <span className="font-medium text-gray-700 text-sm">{getTypeLabel()}</span>
            </div>
          </div>
          
          {(content.title || content.description) && (
            <div className="space-y-1">
              {content.title && (
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                  {content.title}
                </h3>
              )}
              {content.description && (
                <p className="text-gray-600 text-xs line-clamp-2">
                  {content.description}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

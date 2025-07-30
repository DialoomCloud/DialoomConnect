import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, Video, Image, ExternalLink, Edit2 } from "lucide-react";
import type { MediaContent } from "@shared/schema";

interface MediaEmbedProps {
  content: MediaContent;
  onEdit?: (content: MediaContent) => void;
  onView?: (content: MediaContent) => void;
  showEdit?: boolean;
}

export function MediaEmbed({ content, onEdit, onView, showEdit = false }: MediaEmbedProps) {
  console.log('MediaEmbed - content:', content.id, 'showEdit:', showEdit);
  const getTypeIcon = () => {
    switch (content.type) {
      case "youtube":
        return <Youtube className="text-red-600 text-xl" />;
      case "video":
        return <Video className="text-blue-600 text-xl" />;
      case "image":
        return <Image className="text-green-600 text-xl" />;
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (content.type) {
      case "youtube":
        return "YouTube";
      case "video":
        return "Video";
      case "image":
        return "Imagen";
      default:
        return "";
    }
  };

  const getEmbedContent = () => {
    if (!content.url) {
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
        if (!content.embedId) {
          return (
            <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <Youtube className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Video de YouTube no disponible</p>
              </div>
            </div>
          );
        }
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
      
      case "video":
        return (
          <div className="relative group">
            <video
              src={`/storage/${content.url}`}
              controls
              className="w-full aspect-video rounded-lg bg-black"
              poster=""
            >
              Su navegador no soporta el elemento video.
            </video>
          </div>
        );
      
      case "image":
        return (
          <div className="relative group">
            <img
              src={`/storage/${content.url}`}
              alt={content.title || "Imagen"}
              className="w-full aspect-video object-cover rounded-lg"
              loading="lazy"
              onError={(e) => {
                console.error('Image failed to load:', content.url);
                e.currentTarget.style.display = 'none';
              }}
            />
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
    <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer group">
      <CardContent className="p-0">
        {/* Media Content */}
        <div className="relative">
          {getEmbedContent()}
          
          {/* Overlay for click indication */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
            <div className="bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-all duration-200">
              <ExternalLink className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          
          {/* Action buttons overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
            {showEdit && onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(content);
                }}
                className="bg-white/90 hover:bg-white text-gray-700 p-2 h-auto shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {content.type === "youtube" && (
              <a 
                href={content.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-white/90 hover:bg-white text-gray-700 p-2 h-auto shadow-sm rounded-sm transition-colors inline-flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Youtube, Video, Image, ExternalLink, X, Edit, Trash2, Upload, Sparkles } from "lucide-react";
import type { MediaContent } from "@shared/schema";

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: MediaContent | null;
  onEdit?: (content: MediaContent) => void;
  onDelete?: (id: string) => void;
  onReplace?: (content: MediaContent) => void;
}

export function MediaViewerModal({ isOpen, onClose, content, onEdit, onDelete, onReplace }: MediaViewerModalProps) {
  if (!content) return null;

  const getTypeIcon = () => {
    switch (content.type) {
      case "youtube":
        return <Youtube className="text-red-600 w-5 h-5" />;
      case "video":
        return <Video className="text-blue-600 w-5 h-5" />;
      case "image":
        return <Image className="text-green-600 w-5 h-5" />;
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

  const renderMediaContent = () => {
    if (!content.url) {
      return (
        <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
          <div className="text-center">
            <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Contenido no disponible</p>
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
                <Youtube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Video de YouTube no disponible</p>
              </div>
            </div>
          );
        }
        return (
          <div className="relative w-full">
            <iframe
              src={`https://www.youtube.com/embed/${content.embedId}?autoplay=1`}
              title={content.title || "YouTube video"}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full aspect-video rounded-lg"
            />
          </div>
        );
      
      case "video":
        return (
          <div className="relative w-full">
            <video
              src={`/storage/${content.url}`}
              controls
              autoPlay
              className="w-full max-h-[70vh] rounded-lg bg-black"
              poster=""
            >
              Su navegador no soporta el elemento video.
            </video>
          </div>
        );
      
      case "image":
        return (
          <div className="relative w-full flex justify-center">
            <img
              src={`/storage/${content.url}`}
              alt={content.title || "Imagen"}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
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
              <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tipo de contenido no soportado</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-gray-200 dark:border-gray-800">
        <div className="relative animate-fade-in-up">
          {/* Header with title and close button */}
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTypeIcon()}
                <DialogTitle className="text-lg font-semibold">
                  {content.title || `${getTypeLabel()} sin título`}
                </DialogTitle>
              </div>
              
              <div className="flex items-center space-x-2">
                {content.type === "youtube" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a 
                      href={content.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ver en YouTube</span>
                    </a>
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <DialogDescription className="sr-only">
              Visualización ampliada del contenido multimedia
            </DialogDescription>
          </DialogHeader>

          {/* Media content */}
          <div className="px-6">
            {renderMediaContent()}
          </div>

          {/* Content details */}
          {content.description && (
            <div className="p-6 pt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {content.description}
                </p>
              </div>
            </div>
          )}

          {/* File info for local content */}
          {(content.type === "video" || content.type === "image") && content.fileName && (
            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Información del archivo</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nombre original:</span>
                    <p className="text-gray-900 font-medium">{content.fileName}</p>
                  </div>
                  {content.fileSize && (
                    <div>
                      <span className="text-gray-500">Tamaño:</span>
                      <p className="text-gray-900 font-medium">
                        {formatFileSize(parseInt(content.fileSize))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons with modern design */}
          <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onEdit(content);
                      onClose();
                    }}
                    className="group relative overflow-hidden rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-300 glow-button"
                  >
                    <Edit className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    <span className="relative text-gray-700 dark:text-gray-300">Editar</span>
                  </Button>
                )}
                
                {onReplace && content.type !== "youtube" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onReplace(content);
                      onClose();
                    }}
                    className="group relative overflow-hidden rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-300 glow-button"
                  >
                    <Upload className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                    <span className="relative text-gray-700 dark:text-gray-300">Cambiar</span>
                  </Button>
                )}
              </div>
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('¿Estás seguro de que quieres eliminar este contenido?')) {
                      onDelete(content.id);
                      onClose();
                    }
                  }}
                  className="group relative overflow-hidden rounded-full bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                  <span className="relative text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">Eliminar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
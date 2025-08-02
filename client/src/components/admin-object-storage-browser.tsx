import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Folder, File, Upload, Download, Trash2, Eye, Search, RefreshCw, Image, Video, FileText, ChevronRight, Home } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface StorageFile {
  name: string;
  size: number;
  updated: string;
  type: 'file' | 'folder';
  contentType?: string;
  url?: string;
}

interface StorageResponse {
  files: StorageFile[];
  currentPath: string;
  breadcrumbs: string[];
}

export function AdminObjectStorageBrowser() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPath, setCurrentPath] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);

  // Fetch users for the dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Fetch storage contents
  const { data: storageData, isLoading, refetch } = useQuery<StorageResponse>({
    queryKey: [`/api/admin/object-storage?path=${currentPath}&userId=${selectedUser}`],
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, path }: { file: File; path: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);
      
      const response = await fetch("/api/admin/object-storage/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido exitosamente.",
      });
      setShowUploadDialog(false);
      setUploadFile(null);
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo subir el archivo.",
        variant: "destructive",
      });
    },
  });

  // Delete file mutation
  const deleteMutation = useMutation({
    mutationFn: async (filePath: string) => {
      return apiRequest("DELETE", `/api/admin/object-storage`, { path: filePath });
    },
    onSuccess: () => {
      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado exitosamente.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo.",
        variant: "destructive",
      });
    },
  });

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
  };

  const handleFileClick = (file: StorageFile) => {
    if (file.type === 'folder') {
      navigateToPath(currentPath ? `${currentPath}/${file.name}` : file.name);
    } else {
      setPreviewFile(file);
    }
  };

  const handleUpload = () => {
    if (uploadFile) {
      uploadMutation.mutate({ file: uploadFile, path: currentPath });
    }
  };

  const getFileIcon = (file: StorageFile) => {
    if (file.type === 'folder') return <Folder className="w-5 h-5 text-blue-500" />;
    
    const contentType = file.contentType || '';
    if (contentType.startsWith('image/')) return <Image className="w-5 h-5 text-green-500" />;
    if (contentType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = storageData?.files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Seleccionar usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los usuarios</SelectItem>
            {users.map((user: any) => (
              <SelectItem key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar archivos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowUploadDialog(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Subir
          </Button>
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Breadcrumbs */}
      {storageData && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => navigateToPath("")}
            className="hover:text-blue-600 flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            Root
          </button>
          {storageData.breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => navigateToPath(storageData.breadcrumbs.slice(0, index + 1).join('/'))}
                className="hover:text-blue-600"
              >
                {crumb}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Files Grid */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron archivos
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.name}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="flex items-start justify-between mb-2">
                    {getFileIcon(file)}
                    {file.type === 'file' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(file.url, '_blank');
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('¿Estás seguro de eliminar este archivo?')) {
                              deleteMutation.mutate(`${currentPath}/${file.name}`);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium text-sm truncate mb-1">{file.name}</h4>
                  {file.type === 'file' && (
                    <>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(file.updated), "d MMM yyyy", { locale: es })}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir archivo</DialogTitle>
            <DialogDescription>
              Sube un archivo a la carpeta actual: {currentPath || 'Root'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            {uploadFile && (
              <div className="text-sm text-gray-600">
                Archivo seleccionado: {uploadFile.name}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!uploadFile || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Subiendo..." : "Subir"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewFile.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {previewFile.contentType?.startsWith('image/') && (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full h-auto" />
              )}
              {previewFile.contentType?.startsWith('video/') && (
                <video src={previewFile.url} controls className="max-w-full h-auto" />
              )}
              {!previewFile.contentType?.startsWith('image/') && !previewFile.contentType?.startsWith('video/') && (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Vista previa no disponible</p>
                  <Button className="mt-4" onClick={() => window.open(previewFile.url, '_blank')}>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar archivo
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
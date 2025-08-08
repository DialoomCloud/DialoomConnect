import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileCheck, X, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface VerificationDocument {
  id: string;
  documentType: string;
  documentTypeLabel?: string;
  originalFileName: string;
  fileSize: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Pasaporte' },
  { value: 'national_id', label: 'DNI / Cédula Nacional' },
  { value: 'drivers_license', label: 'Licencia de Conducir' },
  { value: 'academic_title', label: 'Título Académico' },
  { value: 'professional_certificate', label: 'Certificado Profesional' },
  { value: 'business_card', label: 'Tarjeta de Presentación' },
  { value: 'work_certificate', label: 'Certificado Laboral' },
  { value: 'other', label: 'Otro (especificar)' }
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function HostVerificationForm({ userId, userStatus }: { userId: string; userStatus?: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [customDocumentType, setCustomDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Request host verification
  const requestVerification = useMutation({
    mutationFn: () => apiRequest('/api/host/request-verification', {
      method: 'POST'
    }),
    onSuccess: () => {
      toast({
        title: "Verificación iniciada",
        description: "Revisa tu correo para activar tu cuenta de host"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo iniciar la verificación",
        variant: "destructive"
      });
    }
  });

  // Get verification documents
  const { data: documents = [], isLoading } = useQuery<VerificationDocument[]>({
    queryKey: ['/api/host/verification-documents'],
    enabled: !!userId && userStatus !== 'none'
  });

  // Upload document
  const uploadDocument = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      try {
        const response = await fetch('/api/host/upload-document', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Error al subir documento');
        }
        
        return response.json();
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Documento subido",
        description: "El documento se ha subido exitosamente"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/host/verification-documents'] });
      setSelectedFile(null);
      setDocumentType('');
      setCustomDocumentType('');
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete document
  const deleteDocument = useMutation({
    mutationFn: (documentId: string) => 
      apiRequest(`/api/host/verification-documents/${documentId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      toast({
        title: "Documento eliminado",
        description: "El documento se ha eliminado exitosamente"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/host/verification-documents'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo debe ser menor a 5MB",
        variant: "destructive"
      });
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no permitido",
        description: "Solo se permiten archivos PDF, JPG o PNG",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile || !documentType) return;

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', documentType);
    if (documentType === 'other' && customDocumentType) {
      formData.append('documentTypeLabel', customDocumentType);
    }

    uploadDocument.mutate(formData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  };

  if (!userStatus || userStatus === 'none') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verificación de Host</CardTitle>
          <CardDescription>
            Conviértete en un host verificado para ofrecer tus servicios profesionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Para comenzar a ofrecer tus servicios como host profesional, necesitas verificar tu identidad.
              Este proceso garantiza la seguridad y confianza en nuestra plataforma.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => requestVerification.mutate()}
            disabled={requestVerification.isPending}
          >
            {requestVerification.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              "Iniciar Verificación"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (userStatus === 'registered') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activación Pendiente</CardTitle>
          <CardDescription>
            Tu solicitud de host ha sido registrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Hemos enviado un correo de activación a tu dirección de email.
              Por favor, revisa tu correo y haz clic en el enlace de activación para continuar.
              Si no lo encuentras, revisa tu carpeta de spam.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (userStatus === 'verified') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>¡Verificación Completada!</CardTitle>
          <CardDescription>
            Ya eres un host verificado en Dialoom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Tu cuenta de host ha sido verificada exitosamente. 
              Ahora puedes ofrecer tus servicios profesionales en la plataforma.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (userStatus === 'rejected') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verificación Rechazada</CardTitle>
          <CardDescription>
            Tu solicitud de verificación no fue aprobada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tu solicitud de verificación fue rechazada. 
              Si crees que esto es un error, por favor contacta con soporte.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Active status - can upload documents
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verificación de Documentos</CardTitle>
          <CardDescription>
            Sube los documentos necesarios para verificar tu identidad como host profesional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Tipo de Documento</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Selecciona el tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {documentType === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom-type">Especifica el tipo de documento</Label>
              <Input
                id="custom-type"
                value={customDocumentType}
                onChange={(e) => setCustomDocumentType(e.target.value)}
                placeholder="Ej: Certificado de especialización"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="file-upload">Archivo (PDF, JPG, PNG o WEBP - máx 15MB)</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
            />
          </div>

          {selectedFile && (
            <Alert>
              <FileCheck className="h-4 w-4" />
              <AlertDescription>
                Archivo seleccionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !documentType || isUploading || (documentType === 'other' && !customDocumentType)}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir Documento
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Documents list */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos Subidos</CardTitle>
            <CardDescription>
              Estos son los documentos que has subido para tu verificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start space-x-4">
                    {getStatusIcon(doc.verificationStatus)}
                    <div>
                      <p className="font-medium">
                        {DOCUMENT_TYPES.find(t => t.value === doc.documentType)?.label || doc.documentTypeLabel || doc.documentType}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doc.originalFileName} • {formatFileSize(doc.fileSize)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Subido {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true, locale: es })}
                      </p>
                      {doc.verifiedAt && (
                        <p className="text-sm font-medium mt-1">
                          {getStatusText(doc.verificationStatus)} {formatDistanceToNow(new Date(doc.verifiedAt), { addSuffix: true, locale: es })}
                        </p>
                      )}
                      {doc.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          Razón: {doc.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  {doc.verificationStatus === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDocument.mutate(doc.id)}
                      disabled={deleteDocument.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Upload, FileCheck, Loader2 } from "lucide-react";

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Pasaporte' },
  { value: 'national_id', label: 'DNI / Cédula Nacional' },
  { value: 'drivers_license', label: 'Licencia de Conducir' },
  { value: 'academic_title', label: 'Título Académico' },
  { value: 'professional_certificate', label: 'Certificado Profesional' },
  { value: 'business_card', label: 'Tarjeta de Presentación' },
  { value: 'work_certificate', label: 'Certificado Laboral' },
  { value: 'other', label: 'Otro (especificar)' },
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

interface Step2DocumentProps {
  onNext: () => void;
}

export function Step2Document({ onNext }: Step2DocumentProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [customDocumentType, setCustomDocumentType] = useState('');

  const uploadDocument = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !documentType) return;
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentType', documentType);
      if (documentType === 'other' && customDocumentType) {
        formData.append('documentTypeLabel', customDocumentType);
      }

      const response = await fetch('/api/host/upload-document', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir documento');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Documento subido', description: 'El documento se ha subido exitosamente' });
      onNext();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Archivo muy grande',
        description: 'El archivo debe ser menor a 15MB',
        variant: 'destructive',
      });
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de archivo no permitido',
        description: 'Solo se permiten archivos PDF, JPG, PNG o WEBP',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificación de Documentos</CardTitle>
        <CardDescription>Sube un documento para verificar tu identidad</CardDescription>
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
            <Input id="custom-type" value={customDocumentType} onChange={e => setCustomDocumentType(e.target.value)} />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="file-upload">Archivo (PDF, JPG, PNG o WEBP - máx 15MB)</Label>
          <Input id="file-upload" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileSelect} />
        </div>

        {selectedFile && (
          <Alert>
            <FileCheck className="h-4 w-4" />
            <AlertDescription>Archivo seleccionado: {selectedFile.name}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => uploadDocument.mutate()}
          disabled={!selectedFile || !documentType || (documentType === 'other' && !customDocumentType) || uploadDocument.isPending}
        >
          {uploadDocument.isPending ? (
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
  );
}


import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { Settings, Euro, Percent, HeadphonesIcon, Video, Share, FileText, Shield, CheckCircle, XCircle, Eye, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

const configKeys = [
  {
    key: 'commission_rate',
    label: 'Comisión de Dialoom (%)',
    description: 'Porcentaje de comisión que cobra Dialoom por cada transacción',
    icon: Percent,
    type: 'percentage',
    defaultValue: '0.10'
  },
  {
    key: 'vat_rate', 
    label: 'IVA (%)',
    description: 'Porcentaje de IVA aplicado sobre la comisión',
    icon: Euro,
    type: 'percentage',
    defaultValue: '0.21'
  },
  {
    key: 'screen_sharing_price',
    label: 'Precio Compartir Pantalla (€)',
    description: 'Precio adicional por servicio de compartir pantalla',
    icon: Share,
    type: 'price',
    defaultValue: '5.00'
  },
  {
    key: 'translation_price',
    label: 'Precio Traducción Simultánea (€)',
    description: 'Precio adicional por servicio de traducción',
    icon: HeadphonesIcon,
    type: 'price',
    defaultValue: '10.00'
  },
  {
    key: 'recording_price',
    label: 'Precio Grabación (€)',
    description: 'Precio adicional por grabación de videollamada',
    icon: Video,
    type: 'price',
    defaultValue: '8.00'
  },
  {
    key: 'transcription_price',
    label: 'Precio Transcripción (€)',
    description: 'Precio adicional por transcripción automática',
    icon: FileText,
    type: 'price',
    defaultValue: '12.00'
  }
];

interface HostVerificationRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  hostVerificationStatus: string;
  documents: {
    id: string;
    documentType: string;
    documentTypeLabel?: string;
    originalFileName: string;
    fileSize: number;
    verificationStatus: string;
    uploadedAt: string;
    objectPath: string;
  }[];
}

export default function AdminPanel() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingConfig, setEditingConfig] = useState<{ [key: string]: string }>({});
  const [selectedVerification, setSelectedVerification] = useState<HostVerificationRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              No tienes permisos para acceder al panel de administración.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: adminConfig, isLoading } = useQuery({
    queryKey: ['/api/admin/config'],
    retry: false,
  });

  const { data: pendingVerifications = [], isLoading: verificationsLoading } = useQuery<HostVerificationRequest[]>({
    queryKey: ['/api/admin/host-verifications/pending'],
    retry: false,
    select: (data: any[]) => {
      return data.map(user => ({
        id: user.id,
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        hostVerificationStatus: user.hostVerificationStatus,
        documents: user.verificationDocuments || []
      }));
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description: string }) => {
      return apiRequest('PUT', `/api/admin/config/${key}`, { value, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
      toast({
        title: "Configuración actualizada",
        description: "Los cambios se han guardado correctamente.",
      });
      setEditingConfig({});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive",
      });
    },
  });

  const getConfigValue = (key: string): string => {
    const config = adminConfig?.find((c: AdminConfig) => c.key === key);
    return config?.value || configKeys.find(k => k.key === key)?.defaultValue || '';
  };

  const handleSave = (key: string) => {
    const value = editingConfig[key];
    const configDef = configKeys.find(k => k.key === key);
    
    if (!value || !configDef) return;

    // Validate value
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      toast({
        title: "Error de validación",
        description: "El valor debe ser un número válido mayor o igual a 0.",
        variant: "destructive",
      });
      return;
    }

    // For percentages, check they're between 0 and 1
    if (configDef.type === 'percentage' && (numValue > 1 || numValue < 0)) {
      toast({
        title: "Error de validación", 
        description: "Los porcentajes deben estar entre 0 y 1 (ej: 0.10 para 10%).",
        variant: "destructive",
      });
      return;
    }

    updateConfigMutation.mutate({
      key,
      value,
      description: configDef.description,
    });
  };

  const handleEdit = (key: string) => {
    setEditingConfig({
      ...editingConfig,
      [key]: getConfigValue(key),
    });
  };

  const handleCancel = (key: string) => {
    const newEditing = { ...editingConfig };
    delete newEditing[key];
    setEditingConfig(newEditing);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
        </div>
        <p className="text-muted-foreground">
          Gestiona las comisiones y precios de los servicios adicionales de Dialoom
        </p>
      </div>

      <div className="grid gap-6">
        {/* Commission Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Configuración de Comisiones
            </CardTitle>
            <CardDescription>
              Define los porcentajes de comisión e IVA que aplica Dialoom
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {configKeys.filter(k => k.type === 'percentage').map((configDef) => {
              const isEditing = editingConfig.hasOwnProperty(configDef.key);
              const currentValue = getConfigValue(configDef.key);
              const Icon = configDef.icon;

              return (
                <div key={configDef.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">{configDef.label}</Label>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(configDef.key)}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {configDef.description}
                  </p>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={editingConfig[configDef.key]}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          [configDef.key]: e.target.value
                        })}
                        placeholder="0.10"
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">
                        ({(parseFloat(editingConfig[configDef.key]) * 100 || 0).toFixed(1)}%)
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleSave(configDef.key)}
                        disabled={updateConfigMutation.isPending}
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(configDef.key)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-primary">
                      {(parseFloat(currentValue) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Separator />

        {/* Service Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Precios de Servicios Adicionales
            </CardTitle>
            <CardDescription>
              Configura los precios de los servicios adicionales para videollamadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {configKeys.filter(k => k.type === 'price').map((configDef) => {
              const isEditing = editingConfig.hasOwnProperty(configDef.key);
              const currentValue = getConfigValue(configDef.key);
              const Icon = configDef.icon;

              return (
                <div key={configDef.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">{configDef.label}</Label>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(configDef.key)}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {configDef.description}
                  </p>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingConfig[configDef.key]}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          [configDef.key]: e.target.value
                        })}
                        placeholder="5.00"
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">EUR</span>
                      <Button
                        size="sm"
                        onClick={() => handleSave(configDef.key)}
                        disabled={updateConfigMutation.isPending}
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(configDef.key)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-primary">
                      €{parseFloat(currentValue).toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Separator />

        {/* Host Verification Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verificación de Hosts
            </CardTitle>
            <CardDescription>
              Revisa y aprueba las solicitudes de verificación de hosts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : pendingVerifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay solicitudes de verificación pendientes
              </p>
            ) : (
              <div className="space-y-4">
                {pendingVerifications.map((verification) => (
                  <div key={verification.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{verification.userName}</h4>
                        <p className="text-sm text-muted-foreground">{verification.userEmail}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedVerification(verification);
                            setReviewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Revisar
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {verification.documents.length} documento(s) subido(s)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisar Verificación de Host</DialogTitle>
            <DialogDescription>
              Revisa los documentos y decide si aprobar o rechazar la verificación
            </DialogDescription>
          </DialogHeader>
          
          {selectedVerification && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Información del Usuario</h4>
                <p className="text-sm">Nombre: {selectedVerification.userName}</p>
                <p className="text-sm">Email: {selectedVerification.userEmail}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Documentos Subidos</h4>
                <div className="space-y-3">
                  {selectedVerification.documents.map((doc) => (
                    <div key={doc.id} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{doc.documentTypeLabel || doc.documentType}</p>
                          <p className="text-sm text-muted-foreground">{doc.originalFileName}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.objectPath, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Decisión</Label>
                <Select
                  value={approvalStatus}
                  onValueChange={(value: 'approved' | 'rejected') => setApprovalStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Aprobar
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Rechazar
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {approvalStatus === 'rejected' && (
                  <div className="space-y-2">
                    <Label>Razón del Rechazo (obligatorio)</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explica por qué se rechaza la verificación..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!selectedVerification) return;
                
                if (approvalStatus === 'rejected' && !rejectionReason.trim()) {
                  toast({
                    title: "Error",
                    description: "Debes proporcionar una razón para el rechazo",
                    variant: "destructive"
                  });
                  return;
                }

                try {
                  if (approvalStatus === 'approved') {
                    await apiRequest('POST', '/api/admin/host-verifications/approve', {
                      userId: selectedVerification.userId
                    });
                  } else {
                    await apiRequest('POST', '/api/admin/host-verifications/reject', {
                      userId: selectedVerification.userId,
                      reason: rejectionReason
                    });
                  }

                  toast({
                    title: "Verificación procesada",
                    description: `La verificación ha sido ${approvalStatus === 'approved' ? 'aprobada' : 'rechazada'} correctamente`
                  });

                  queryClient.invalidateQueries({ queryKey: ['/api/admin/host-verifications/pending'] });
                  setReviewDialogOpen(false);
                  setSelectedVerification(null);
                  setRejectionReason('');
                  setApprovalStatus('approved');
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "No se pudo procesar la verificación",
                    variant: "destructive"
                  });
                }
              }}
              disabled={approvalStatus === 'rejected' && !rejectionReason.trim()}
            >
              {approvalStatus === 'approved' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aprobar
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-1" />
                  Rechazar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
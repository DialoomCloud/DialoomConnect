import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Plus, Edit, Trash2, Send, Eye, Clock, Settings } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EmailTemplate {
  id: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailNotification {
  id: string;
  templateId: string;
  recipientEmail: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt?: string;
  errorMessage?: string;
  metadata?: any;
}

const EMAIL_TYPES = [
  { value: 'registration', label: 'Registro de Usuario' },
  { value: 'password_change', label: 'Cambio de Contraseña' },
  { value: 'account_deactivation', label: 'Desactivación de Cuenta' },
  { value: 'account_deletion', label: 'Eliminación de Cuenta' },
  { value: 'booking_confirmation', label: 'Confirmación de Reserva (Host)' },
  { value: 'booking_notification', label: 'Notificación de Reserva (Cliente)' },
  { value: 'booking_confirmed', label: 'Reserva Confirmada' },
  { value: 'booking_cancellation', label: 'Cancelación de Reserva' },
  { value: 'payment_confirmation', label: 'Confirmación de Pago' },
  { value: 'video_call_reminder', label: 'Recordatorio de Videollamada' },
  { value: 'user_message', label: 'Mensaje de Usuario' },
];

export function AdminEmailManagement() {
  const { toast } = useToast();
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    type: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    isActive: true,
  });

  // Fetch email templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/admin/email-templates'],
  });

  // Fetch email notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery<EmailNotification[]>({
    queryKey: ['/api/admin/email-notifications'],
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const response = await apiRequest('POST', '/api/admin/email-templates', {
        body: template
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      setIsTemplateDialogOpen(false);
      setNewTemplate({ type: '', subject: '', htmlContent: '', textContent: '', isActive: true });
      toast({
        title: "Plantilla creada",
        description: "La plantilla de email ha sido creada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear la plantilla",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...template }: any) => {
      const response = await apiRequest('PUT', `/api/admin/email-templates/${id}`, {
        body: template
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      setEditingTemplate(null);
      toast({
        title: "Plantilla actualizada",
        description: "La plantilla de email ha sido actualizada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la plantilla",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/email-templates/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla de email ha sido eliminada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la plantilla",
        variant: "destructive",
      });
    },
  });

  // Initialize templates mutation
  const initializeTemplatesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/initialize-email-templates', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({
        title: "Plantillas inicializadas",
        description: "Las plantillas por defecto han sido creadas exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al inicializar las plantillas",
        variant: "destructive",
      });
    },
  });

  const handleCreateTemplate = () => {
    createTemplateMutation.mutate(newTemplate);
  };

  const handleUpdateTemplate = () => {
    if (editingTemplate) {
      updateTemplateMutation.mutate(editingTemplate);
    }
  };

  const getTypeLabel = (type: string) => {
    return EMAIL_TYPES.find(t => t.value === type)?.label || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-500">Enviado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Emails</h2>
          <p className="text-muted-foreground">
            Administra las plantillas de email y revisa las notificaciones enviadas
          </p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Plantillas de Email</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones Enviadas</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Plantillas de Email</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => initializeTemplatesMutation.mutate()}
                disabled={initializeTemplatesMutation.isPending}
              >
                {initializeTemplatesMutation.isPending ? (
                  <>Inicializando...</>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Inicializar Plantillas
                  </>
                )}
              </Button>
              <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Plantilla
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Plantilla de Email</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Email</Label>
                    <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de email" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMAIL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                      placeholder="Asunto del email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="htmlContent">Contenido HTML</Label>
                    <Textarea
                      id="htmlContent"
                      value={newTemplate.htmlContent}
                      onChange={(e) => setNewTemplate({ ...newTemplate, htmlContent: e.target.value })}
                      placeholder="Contenido HTML del email"
                      rows={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textContent">Contenido de Texto</Label>
                    <Textarea
                      id="textContent"
                      value={newTemplate.textContent}
                      onChange={(e) => setNewTemplate({ ...newTemplate, textContent: e.target.value })}
                      placeholder="Versión en texto plano del email"
                      rows={6}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newTemplate.isActive}
                      onChange={(e) => setNewTemplate({ ...newTemplate, isActive: e.target.checked })}
                    />
                    <Label htmlFor="isActive">Plantilla activa</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTemplate} disabled={createTemplateMutation.isPending}>
                      {createTemplateMutation.isPending ? "Creando..." : "Crear Plantilla"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última actualización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templatesLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Cargando plantillas...
                      </TableCell>
                    </TableRow>
                  ) : templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No hay plantillas configuradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates.map((template: EmailTemplate) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(template.type)}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                        <TableCell>
                          <Badge variant={template.isActive ? "default" : "secondary"}>
                            {template.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(template.updatedAt), "d MMM yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTemplate(template)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <p>Esta acción no se puede deshacer. ¿Estás seguro?</p>
                                <div className="flex justify-end space-x-2">
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <h3 className="text-lg font-semibold">Historial de Notificaciones</h3>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de envío</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Cargando notificaciones...
                      </TableCell>
                    </TableRow>
                  ) : notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No hay notificaciones enviadas
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((notification: EmailNotification) => (
                      <TableRow key={notification.id}>
                        <TableCell>{notification.recipientEmail}</TableCell>
                        <TableCell className="max-w-xs truncate">{notification.subject}</TableCell>
                        <TableCell>{getStatusBadge(notification.status)}</TableCell>
                        <TableCell>
                          {notification.sentAt 
                            ? format(new Date(notification.sentAt), "d MMM yyyy HH:mm", { locale: es })
                            : "-"
                          }
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {notification.errorMessage || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Template Dialog */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Plantilla de Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Email</Label>
                <div className="p-2 bg-muted rounded">
                  {getTypeLabel(editingTemplate.type)}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Asunto</Label>
                <Input
                  id="edit-subject"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-htmlContent">Contenido HTML</Label>
                <Textarea
                  id="edit-htmlContent"
                  value={editingTemplate.htmlContent}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, htmlContent: e.target.value })}
                  rows={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-textContent">Contenido de Texto</Label>
                <Textarea
                  id="edit-textContent"
                  value={editingTemplate.textContent}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, textContent: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={editingTemplate.isActive}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                />
                <Label htmlFor="edit-isActive">Plantilla activa</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateTemplate} disabled={updateTemplateMutation.isPending}>
                  {updateTemplateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
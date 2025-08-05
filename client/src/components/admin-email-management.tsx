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
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Eye, 
  Clock, 
  Settings, 
  FileText, 
  Type, 
  Code, 
  Info, 
  X, 
  Save, 
  Loader2 
} from "lucide-react";
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
  const [selectedHostForTest, setSelectedHostForTest] = useState<string>('');
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

  // Fetch all users for test email selector (will filter hosts on client side)
  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
  });

  // Filter hosts from all users
  const hosts = allUsers.filter((user: any) => user.isHost || user.role === 'host');

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const response = await apiRequest('/api/admin/email-templates', {
        method: 'POST',
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
      const response = await apiRequest(`/api/admin/email-templates/${id}`, {
        method: 'PUT',
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
      const response = await apiRequest(`/api/admin/email-templates/${id}`, {
        method: 'DELETE'
      });
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
      const response = await apiRequest('/api/admin/initialize-email-templates', {
        method: 'POST'
      });
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

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ templateId, recipientId }: { templateId: string; recipientId: string }) => {
      const response = await apiRequest('/api/admin/send-test-email', {
        method: 'POST',
        body: {
          templateId,
          recipientId,
        }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email de prueba enviado",
        description: "El email de prueba ha sido enviado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar email",
        description: error.message || "No se pudo enviar el email de prueba",
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

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setSelectedHostForTest(''); // Reset host selection when switching templates
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
                              onClick={() => handleEditTemplate(template)}
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
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Editar Plantilla de Email
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6 h-[75vh]">
              {/* Editor Panel */}
              <div className="space-y-4 overflow-y-auto pr-2">
                <div className="space-y-2">
                  <Label>Tipo de Email</Label>
                  <div className="p-3 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-teal-600" />
                      <span className="font-medium text-teal-800">
                        {getTypeLabel(editingTemplate.type)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-subject" className="flex items-center gap-2">
                    <span>Asunto del Email</span>
                    <span className="text-xs text-muted-foreground">(Se mostrará en la bandeja de entrada)</span>
                  </Label>
                  <Input
                    id="edit-subject"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    className="font-medium"
                    placeholder="Escribe el asunto del email..."
                  />
                </div>

                <Tabs defaultValue="html" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="html" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Contenido HTML
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Texto Plano
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="html" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-htmlContent">Contenido HTML Visual</Label>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const template = editingTemplate.htmlContent;
                            const formatted = template
                              .replace(/></g, '>\n<')
                              .replace(/^\s+|\s+$/gm, '')
                              .split('\n')
                              .map(line => line.trim() ? '  '.repeat((line.match(/^<[^/]/g) || []).length) + line : line)
                              .join('\n');
                            setEditingTemplate({ ...editingTemplate, htmlContent: formatted });
                          }}
                        >
                          <Code className="h-3 w-3 mr-1" />
                          Formatear
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const variables = [
                              '{{user_name}}', '{{platform_name}}', '{{login_url}}', 
                              '{{host_name}}', '{{guest_name}}', '{{call_date}}', 
                              '{{call_time}}', '{{call_duration}}', '{{total_price}}',
                              '{{message_content}}', '{{sender_name}}'
                            ];
                            setEditingTemplate({ 
                              ...editingTemplate, 
                              htmlContent: editingTemplate.htmlContent + '\n\n<!-- Variables disponibles:\n' + variables.join(', ') + '\n-->'
                            });
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Variables
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      id="edit-htmlContent"
                      value={editingTemplate.htmlContent}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, htmlContent: e.target.value })}
                      rows={12}
                      className="font-mono text-sm"
                      placeholder="<html>&#10;<head>&#10;  <title>{{subject}}</title>&#10;</head>&#10;<body>&#10;  <h1>¡Hola {{user_name}}!</h1>&#10;  <p>Tu contenido aquí...</p>&#10;</body>&#10;</html>"
                    />
                  </TabsContent>

                  <TabsContent value="text" className="space-y-2">
                    <Label htmlFor="edit-textContent">Versión de Texto Plano (fallback)</Label>
                    <Textarea
                      id="edit-textContent"
                      value={editingTemplate.textContent}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, textContent: e.target.value })}
                      rows={10}
                      placeholder="Versión en texto plano del email para clientes que no soportan HTML..."
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      checked={editingTemplate.isActive}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="edit-isActive" className="font-medium">
                      Plantilla activa
                    </Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {editingTemplate.isActive ? "✅ Visible para usuarios" : "⚠️ Oculta"}
                  </span>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="border-l border-gray-200 pl-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">Vista Previa del Email</h3>
                  </div>

                  {/* Email Header Preview */}
                  <div className="bg-white border rounded-lg shadow-sm">
                    <div className="border-b bg-gray-50 px-4 py-3 rounded-t-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span className="font-medium">De:</span>
                        <span>api@dialoom.com (Dialoom)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span className="font-medium">Para:</span>
                        <span>usuario@ejemplo.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">Asunto:</span>
                        <span className="text-gray-900">
                          {editingTemplate.subject || "Sin asunto"}
                        </span>
                      </div>
                    </div>

                    {/* Email Content Preview */}
                    <div className="p-4">
                      <Tabs defaultValue="html-preview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="html-preview">Vista HTML</TabsTrigger>
                          <TabsTrigger value="text-preview">Vista Texto</TabsTrigger>
                        </TabsList>

                        <TabsContent value="html-preview">
                          <div className="border rounded-lg p-4 bg-white min-h-[300px]">
                            {editingTemplate.htmlContent ? (
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: editingTemplate.htmlContent
                                    .replace(/\{\{user_name\}\}/g, 'Juan Pérez')
                                    .replace(/\{\{platform_name\}\}/g, 'Dialoom')
                                    .replace(/\{\{login_url\}\}/g, 'https://dialoom.com/login')
                                    .replace(/\{\{host_name\}\}/g, 'Ana García')
                                    .replace(/\{\{guest_name\}\}/g, 'Carlos López')
                                    .replace(/\{\{call_date\}\}/g, '15 de Agosto, 2025')
                                    .replace(/\{\{call_time\}\}/g, '10:00 AM')
                                    .replace(/\{\{call_duration\}\}/g, '60 minutos')
                                    .replace(/\{\{total_price\}\}/g, '€50.00')
                                    .replace(/\{\{message_content\}\}/g, 'Hola, me interesa tu perfil...')
                                    .replace(/\{\{sender_name\}\}/g, 'María Rodríguez')
                                }} 
                                className="prose prose-sm max-w-none"
                              />
                            ) : (
                              <div className="text-center text-gray-400 py-8">
                                <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Escribe contenido HTML para ver la vista previa</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="text-preview">
                          <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px] font-mono text-sm whitespace-pre-wrap">
                            {editingTemplate.textContent ? (
                              editingTemplate.textContent
                                .replace(/\{\{user_name\}\}/g, 'Juan Pérez')
                                .replace(/\{\{platform_name\}\}/g, 'Dialoom')
                                .replace(/\{\{login_url\}\}/g, 'https://dialoom.com/login')
                                .replace(/\{\{host_name\}\}/g, 'Ana García')
                                .replace(/\{\{guest_name\}\}/g, 'Carlos López')
                                .replace(/\{\{call_date\}\}/g, '15 de Agosto, 2025')
                                .replace(/\{\{call_time\}\}/g, '10:00 AM')
                                .replace(/\{\{call_duration\}\}/g, '60 minutos')
                                .replace(/\{\{total_price\}\}/g, '€50.00')
                                .replace(/\{\{message_content\}\}/g, 'Hola, me interesa tu perfil...')
                                .replace(/\{\{sender_name\}\}/g, 'María Rodríguez')
                            ) : (
                              <div className="text-center text-gray-400 py-8">
                                <Type className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Escribe contenido de texto para ver la vista previa</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>

                  {/* Variables Help */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Variables Disponibles
                    </h4>
                    <div className="grid grid-cols-1 gap-1 text-xs text-blue-800">
                      <div><code>{`{{user_name}}`}</code> - Nombre del usuario</div>
                      <div><code>{`{{platform_name}}`}</code> - Nombre de la plataforma</div>
                      <div><code>{`{{login_url}}`}</code> - URL de inicio de sesión</div>
                      <div><code>{`{{host_name}}`}</code> - Nombre del host</div>
                      <div><code>{`{{guest_name}}`}</code> - Nombre del invitado</div>
                      <div><code>{`{{call_date}}`}</code> - Fecha de la llamada</div>
                      <div><code>{`{{call_time}}`}</code> - Hora de la llamada</div>
                      <div><code>{`{{total_price}}`}</code> - Precio total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <div className="flex gap-2">
                <div className="flex gap-2 items-center">
                  <Select value={selectedHostForTest} onValueChange={setSelectedHostForTest}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Seleccionar host..." />
                    </SelectTrigger>
                    <SelectContent>
                      {hosts.length > 0 ? (
                        hosts.map((host: any) => (
                          <SelectItem key={host.id} value={host.id}>
                            {host.firstName} {host.lastName} ({host.email})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-muted-foreground">
                          No hay hosts disponibles. Los usuarios deben tener el flag "isHost" activado.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    disabled={!selectedHostForTest || sendTestEmailMutation.isPending}
                    onClick={() => {
                      if (editingTemplate && selectedHostForTest) {
                        sendTestEmailMutation.mutate({
                          templateId: editingTemplate.id,
                          recipientId: selectedHostForTest,
                        });
                      }
                    }}
                  >
                    {sendTestEmailMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Prueba
                      </>
                    )}
                  </Button>
                </div>
                <Button onClick={handleUpdateTemplate} disabled={updateTemplateMutation.isPending}>
                  {updateTemplateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
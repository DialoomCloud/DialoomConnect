import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, UserCheck, UserX, Shield, Users, User as UserIcon, Edit, Settings } from "lucide-react";
import type { User } from "@shared/schema";
import { AdminCompleteUserEditor } from "./admin-complete-user-editor";

export function AdminUserManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [completeEditorOpen, setCompleteEditorOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string, updates: any }) => {
      const response = await apiRequest(`/api/admin/users/${userId}`, {
        method: "PUT",
        body: updates
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuario actualizado",
        description: "Los cambios se han guardado correctamente",
      });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadges = (user: User) => {
    const badges = [];
    
    // Multiple role support
    if (user.isAdmin || user.role === 'admin') {
      badges.push(<Badge key="admin" variant="destructive" className="mr-1">Admin</Badge>);
    }
    if (user.role === 'host' || user.isHost) {
      badges.push(<Badge key="host" variant="default" className="mr-1">Host</Badge>);
    }
    if (user.role === 'registered' || (!user.role && user.email)) {
      badges.push(<Badge key="registered" variant="outline" className="mr-1">Registrado</Badge>);
    }
    if (!badges.length || user.role === 'guest') {
      badges.push(<Badge key="guest" variant="secondary" className="mr-1">Guest</Badge>);
    }
    
    return <div className="flex flex-wrap">{badges}</div>;
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="outline" className="text-red-600">Inactivo</Badge>;
    } else if (user.isVerified) {
      return <Badge variant="outline" className="text-green-600">Verificado</Badge>;
    } else {
      return <Badge variant="outline">No verificado</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gestión de Usuarios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, email o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Comisión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div 
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors"
                        onClick={() => {
                          setSelectedUser(user);
                          setEditDialogOpen(true);
                        }}
                      >
                        <div className="relative">
                          {user.profileImageUrl ? (
                            <>
                              <img 
                                src={user.profileImageUrl.startsWith('/storage/') 
                                  ? user.profileImageUrl 
                                  : `/storage/${user.profileImageUrl}`
                                } 
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.style.display = 'none';
                                  const fallback = img.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                                <UserIcon className="w-4 h-4 text-gray-500" />
                              </div>
                            </>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.username && (
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>{getRoleBadges(user)}</TableCell>
                    <TableCell>
                      {user.isHost ? (
                        <span className={user.commissionRate ? 'font-medium' : 'text-gray-500'}>
                          {user.commissionRate 
                            ? `${(parseFloat(user.commissionRate) * 100).toFixed(2)}%`
                            : 'Global'
                          }
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.isActive !== false}
                        onCheckedChange={(checked) => {
                          updateUserMutation.mutate({
                            userId: user.id,
                            updates: { isActive: checked }
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setCompleteEditorOpen(true);
                          }}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Completo
                        </Button>
                        <Button
                          size="sm"
                          variant={user.isVerified ? "outline" : "default"}
                          onClick={() => {
                            updateUserMutation.mutate({
                              userId: user.id,
                              updates: { isVerified: !user.isVerified }
                            });
                          }}
                        >
                          {user.isVerified ? (
                            <>
                              <UserX className="w-4 h-4 mr-1" />
                              Desverificar
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Verificar
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* User Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserEditForm 
              user={selectedUser} 
              onSave={(updates) => {
                updateUserMutation.mutate({
                  userId: selectedUser.id,
                  updates
                });
              }}
              isLoading={updateUserMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Complete User Editor */}
      {selectedUserId && (
        <AdminCompleteUserEditor
          userId={selectedUserId}
          open={completeEditorOpen}
          onOpenChange={(open) => {
            setCompleteEditorOpen(open);
            if (!open) {
              setSelectedUserId(null);
            }
          }}
        />
      )}
    </Card>
  );
}

// User Edit Form Component
function UserEditForm({ user, onSave, isLoading }: {
  user: User;
  onSave: (updates: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    username: user.username || '',
    role: user.role || 'guest',
    isHost: user.isHost || false,
    isAdmin: user.isAdmin || false,
    isActive: user.isActive !== false,
    isVerified: user.isVerified || false,
    commissionRate: user.commissionRate ? parseFloat(user.commissionRate) * 100 : null, // Convert to percentage
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      // Convert commission rate from percentage to decimal for database
      commissionRate: formData.commissionRate !== null ? formData.commissionRate / 100 : null
    };
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="role">Rol Principal</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="guest">Guest</SelectItem>
            <SelectItem value="registered">Registrado</SelectItem>
            <SelectItem value="host">Host</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Roles Adicionales</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isHost"
            checked={formData.isHost}
            onCheckedChange={(checked) => setFormData({ ...formData, isHost: Boolean(checked) })}
          />
          <Label htmlFor="isHost">Es Host</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isAdmin"
            checked={formData.isAdmin}
            onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: Boolean(checked) })}
          />
          <Label htmlFor="isAdmin">Es Admin</Label>
        </div>
      </div>

      {/* Commission Rate Field - Only for Hosts */}
      {formData.isHost && (
        <div>
          <Label htmlFor="commissionRate">
            Comisión Individual (%) - Dejar vacío para usar la comisión global
          </Label>
          <Input
            id="commissionRate"
            type="number"
            placeholder="Ej: 21 para 21%"
            value={formData.commissionRate || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              commissionRate: e.target.value ? parseFloat(e.target.value) : null 
            })}
            min="0"
            max="100"
            step="0.01"
          />
          <p className="text-sm text-gray-500 mt-1">
            Si se deja vacío, se aplicará la comisión global configurada
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Label>Estado</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: Boolean(checked) })}
          />
          <Label htmlFor="isActive">Usuario Activo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isVerified"
            checked={formData.isVerified}
            onCheckedChange={(checked) => setFormData({ ...formData, isVerified: Boolean(checked) })}
          />
          <Label htmlFor="isVerified">Usuario Verificado</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}
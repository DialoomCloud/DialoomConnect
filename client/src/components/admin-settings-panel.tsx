import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Settings, Users, Star, Award } from 'lucide-react';

interface AdminSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminSettingsPanel({ open, onOpenChange }: AdminSettingsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("settings");

  // Fetch global verification settings
  const { data: verificationSettings, isLoading: settingsLoading } = useQuery<{
    showVerified: boolean;
    showRecommended: boolean;
  }>({
    queryKey: ["/api/admin/verification-settings"],
    enabled: open,
  });

  // Fetch all users for the hosts tab
  const { data: allUsers = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: open && activeTab === "hosts",
  });

  // Update global verification settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: { showVerified?: boolean; showRecommended?: boolean }) => {
      const response = await apiRequest('/api/admin/verification-settings', {
        method: "PUT",
        body: settings
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification-settings"] });
      toast({
        title: "Configuración actualizada",
        description: "Los ajustes globales se han guardado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    },
  });

  // Update individual user status mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
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
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    },
  });

  const handleGlobalSettingsChange = (setting: 'showVerified' | 'showRecommended', value: boolean) => {
    updateSettingsMutation.mutate({ [setting]: value });
  };

  const handleUserStatusChange = (userId: string, field: string, value: boolean) => {
    updateUserMutation.mutate({
      userId,
      updates: { [field]: value }
    });
  };

  // Filter hosts only
  const hostUsers = allUsers.filter(user => user.isHost);

  if (settingsLoading && activeTab === "settings") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Cargando configuración...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Panel de Administración</DialogTitle>
          <DialogDescription>
            Gestiona la configuración global y el estado de hosts individuales
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuración Global
            </TabsTrigger>
            <TabsTrigger value="hosts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gestión de Hosts
            </TabsTrigger>
          </TabsList>

          {/* Global Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración Global de Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Visibilidad de Badges Globales</Label>
                  <p className="text-sm text-gray-600">
                    Estos ajustes controlan si los badges se muestran globalmente en toda la plataforma. 
                    Los ajustes individuales por host funcionan independientemente.
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showVerified"
                      checked={verificationSettings?.showVerified || false}
                      onCheckedChange={(checked) => 
                        handleGlobalSettingsChange('showVerified', Boolean(checked))
                      }
                      disabled={updateSettingsMutation.isPending}
                    />
                    <Label htmlFor="showVerified" className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-500" />
                      Mostrar badges de "Verificado" globalmente
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showRecommended"
                      checked={verificationSettings?.showRecommended || false}
                      onCheckedChange={(checked) => 
                        handleGlobalSettingsChange('showRecommended', Boolean(checked))
                      }
                      disabled={updateSettingsMutation.isPending}
                    />
                    <Label htmlFor="showRecommended" className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Mostrar badges de "Recomendado" globalmente
                    </Label>
                  </div>
                </div>

                {updateSettingsMutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando configuración...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hosts Management Tab */}
          <TabsContent value="hosts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión Individual de Hosts</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="ml-2">Cargando hosts...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hostUsers.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No hay hosts registrados en el sistema
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-4 py-2 text-left">Host</th>
                              <th className="border border-gray-300 px-4 py-2 text-center">Email</th>
                              <th className="border border-gray-300 px-4 py-2 text-center">Verificado</th>
                              <th className="border border-gray-300 px-4 py-2 text-center">Recomendado</th>
                              <th className="border border-gray-300 px-4 py-2 text-center">Destacado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hostUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2">
                                  <div className="flex items-center gap-3">
                                    {user.profileImageUrl ? (
                                      <img
                                        src={user.profileImageUrl.startsWith('/storage/') 
                                          ? user.profileImageUrl 
                                          : `/storage/${user.profileImageUrl}`}
                                        alt=""
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-gray-400" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium">
                                        {user.firstName} {user.lastName}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {user.title || 'Sin título'}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                  {user.email}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  <Checkbox
                                    checked={user.isVerified || false}
                                    onCheckedChange={(checked) => 
                                      handleUserStatusChange(user.id, 'isVerified', Boolean(checked))
                                    }
                                    disabled={updateUserMutation.isPending}
                                  />
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  <Checkbox
                                    checked={user.isRecommended || false}
                                    onCheckedChange={(checked) => 
                                      handleUserStatusChange(user.id, 'isRecommended', Boolean(checked))
                                    }
                                    disabled={updateUserMutation.isPending}
                                  />
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  <Checkbox
                                    checked={user.isFeatured || false}
                                    onCheckedChange={(checked) => 
                                      handleUserStatusChange(user.id, 'isFeatured', Boolean(checked))
                                    }
                                    disabled={updateUserMutation.isPending}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
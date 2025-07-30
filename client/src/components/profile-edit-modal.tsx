import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Camera, User } from "lucide-react";

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  phone?: string;
  address?: string;
  title?: string;
  description?: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function ProfileEditModal({ isOpen, onClose, user }: ProfileEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    title: user.title || "",
    phone: user.phone || "",
    address: user.address || "",
    description: user.description || "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente.",
      });
      onClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(17,12%,6%)]">Editar Perfil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-[hsl(244,91%,95%)]">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button 
                type="button"
                className="absolute -bottom-2 -right-2 bg-[hsl(244,91%,68%)] text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-[hsl(244,91%,60%)] transition-colors"
                onClick={() => toast({ title: "Próximamente", description: "La funcionalidad de cambio de foto estará disponible pronto." })}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Haz clic en la cámara para cambiar tu foto</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                Nombre
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="mt-1"
                placeholder="Tu nombre"
              />
            </div>
            
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Apellido
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="mt-1"
                placeholder="Tu apellido"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Título profesional
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="mt-1"
                placeholder="Ej: Desarrollador Full Stack"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <Input
                value={user.email || ""}
                disabled
                className="mt-1 bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Teléfono
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="mt-1"
                placeholder="+34 612 345 678"
              />
            </div>

            {/* Address Information */}
            <div className="md:col-span-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Dirección completa
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="mt-1"
                placeholder="Calle, Ciudad, País"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descripción personal
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                className="mt-1"
                placeholder="Cuéntanos sobre ti, tu experiencia y tus intereses..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              className="bg-[hsl(244,91%,68%)] text-white hover:bg-[hsl(244,91%,60%)]"
            >
              {updateProfileMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

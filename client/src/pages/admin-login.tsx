import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield } from "lucide-react";
import { Link } from "wouter";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isAdmin } = useAdminAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/admin/login", {
        method: "POST",
        body: data,
      });
      
      if (response.ok) {
        toast({
          title: "Acceso exitoso",
          description: "Redirigiendo al panel de administración...",
        });
        
        // Since we're using Replit Auth, just redirect
        // The auth state will be updated automatically
        setTimeout(() => {
          window.location.href = "/admin-dashboard";
        }, 1000);
      } else {
        const error = await response.text();
        toast({
          title: "Error de acceso",
          description: error || "Credenciales incorrectas",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <img 
              src="/uploads/images/dialoomblue.png"
              alt="Dialoom" 
              className="h-12 mx-auto"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Shield className="w-8 h-8 text-[hsl(188,100%,38%)]" />
            Acceso Administrativo
          </h1>
          <p className="mt-2 text-gray-600">
            Ingresa con tus credenciales de administrador
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  {...register("username")}
                  className={errors.username ? "border-red-500" : ""}
                  placeholder="admin"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
                disabled={isLoading}
              >
                {isLoading ? "Ingresando..." : "Ingresar"}
              </Button>

              <div className="text-center mt-4">
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                  Volver al inicio
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
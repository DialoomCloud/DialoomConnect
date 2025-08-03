import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TestLogin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLogin = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/auth/test-login", {
        method: "POST",
        body: {}
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Sesión iniciada",
          description: `Bienvenido ${data.user.name}`,
        });
        
        // Invalidate auth queries
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        // Redirect to profile
        setTimeout(() => {
          window.location.href = "/profile";
        }, 500);
      } else {
        throw new Error(data.message || "Error al iniciar sesión");
      }
    } catch (error: any) {
      console.error("Test login error:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        body: {}
      });
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Reload page
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <CardHeader>
            <CardTitle>No disponible</CardTitle>
            <CardDescription>Esta página solo está disponible en desarrollo</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Login</CardTitle>
          <CardDescription>
            Iniciar sesión con el usuario de prueba
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Usuario de prueba:</p>
            <p className="font-mono text-sm">billing@thopters.com</p>
          </div>
          
          <Button 
            onClick={handleTestLogin} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión como test"}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">O</span>
            </div>
          </div>
          
          <Button 
            onClick={handleLogout} 
            variant="outline"
            className="w-full"
          >
            Limpiar sesión actual
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Esta página solo está disponible en modo desarrollo
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
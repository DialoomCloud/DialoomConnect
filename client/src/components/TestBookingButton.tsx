import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface TestBookingButtonProps {
  hostId: string;
  hostName: string;
  onBookingCreated?: (bookingId: string) => void;
}

export function TestBookingButton({ hostId, hostName, onBookingCreated }: TestBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [testStatus, setTestStatus] = useState<any>(null);
  const { toast } = useToast();

  // Check test mode status
  const checkTestStatus = async () => {
    try {
      const response = await apiRequest("GET", "/api/test/status");
      const data = await response.json();
      setTestStatus(data);
      return data;
    } catch (error) {
      console.error("Error checking test status:", error);
      return null;
    }
  };

  const handleClick = async () => {
    const status = await checkTestStatus();
    if (!status?.testModeEnabled || !status?.isTestUser) {
      setShowDialog(true);
      return;
    }
    
    await createTestBooking();
  };

  const createTestBooking = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/test/instant-booking", {
        hostId,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear reserva de prueba");
      }

      const booking = await response.json();
      
      toast({
        title: "Reserva de prueba creada",
        description: "Puedes iniciar la videollamada inmediatamente",
        variant: "default",
      });

      if (onBookingCreated) {
        onBookingCreated(booking.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la reserva de prueba",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDialog(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creando...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" />
            Reserva de Prueba
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modo de Prueba</DialogTitle>
            <DialogDescription>
              {testStatus && !testStatus.testModeEnabled && (
                <div className="space-y-4">
                  <p>El modo de prueba no está habilitado en el sistema.</p>
                  <Badge variant="secondary">Modo de prueba desactivado</Badge>
                </div>
              )}
              {testStatus && testStatus.testModeEnabled && !testStatus.isTestUser && (
                <div className="space-y-4">
                  <p>Tu usuario no es un usuario de prueba.</p>
                  <p className="text-sm">Para usar esta función, debes iniciar sesión con un usuario de prueba como:</p>
                  <code className="block p-2 bg-muted rounded text-sm">
                    Email: billing@thopters.com<br />
                    Contraseña: test2
                  </code>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
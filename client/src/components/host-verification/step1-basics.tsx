import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Step1BasicsProps {
  onNext: () => void;
}

export function Step1Basics({ onNext }: Step1BasicsProps) {
  const { toast } = useToast();
  const requestVerification = useMutation({
    mutationFn: () => apiRequest("/api/host/request-verification", { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Verificación iniciada",
        description: "Revisa tu correo para activar tu cuenta de host",
      });
      onNext();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo iniciar la verificación",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificación de Host</CardTitle>
        <CardDescription>
          Conviértete en un host verificado para ofrecer tus servicios profesionales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Para comenzar el proceso de verificación inicia la solicitud y revisa tu correo de activación.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => requestVerification.mutate()} disabled={requestVerification.isPending}>
          {requestVerification.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando...
            </>
          ) : (
            "Iniciar Verificación"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}


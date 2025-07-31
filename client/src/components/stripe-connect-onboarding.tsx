import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, CheckCircle, AlertCircle, Euro } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function StripeConnectOnboarding() {
  const { toast } = useToast();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Check account status
  const { data: accountStatus, isLoading, refetch } = useQuery({
    queryKey: ["/api/stripe/connect/account-status"],
    queryFn: async () => {
      const response = await apiRequest("/api/stripe/connect/account-status", { method: "GET" });
      return response.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds while onboarding
  });

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/stripe/connect/create-account", { method: "POST" });
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Cuenta creada",
        description: "Tu cuenta de Stripe Connect ha sido creada exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get onboarding link mutation
  const getOnboardingLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/stripe/connect/onboarding-link", { method: "POST" });
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    await createAccountMutation.mutateAsync();
    setIsCreatingAccount(false);
  };

  const handleContinueOnboarding = () => {
    getOnboardingLinkMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Already completed onboarding
  if (accountStatus?.onboardingCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Stripe Connect Configurado
          </CardTitle>
          <CardDescription>
            Tu cuenta está lista para recibir pagos directamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Euro className="h-4 w-4" />
            <AlertDescription>
              Los pagos de tus videollamadas se procesarán directamente a tu cuenta.
              Las facturas se emitirán automáticamente a nombre de tu negocio.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Has account but onboarding not completed
  if (accountStatus?.hasAccount && !accountStatus?.onboardingCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Completa tu configuración
          </CardTitle>
          <CardDescription>
            Necesitas completar el proceso de verificación en Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tu cuenta de Stripe Connect está creada pero necesitas completar la verificación
                para poder recibir pagos. Este proceso incluye verificar tu identidad y
                proporcionar información fiscal.
              </AlertDescription>
            </Alert>

            {accountStatus?.requirements?.currently_due?.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Información pendiente:</p>
                <ul className="list-disc list-inside space-y-1">
                  {accountStatus.requirements.currently_due.map((req: string, index: number) => (
                    <li key={index}>{req.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              onClick={handleContinueOnboarding}
              disabled={getOnboardingLinkMutation.isPending}
              className="w-full"
            >
              {getOnboardingLinkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirigiendo...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Continuar con la verificación
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No account yet
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configura Stripe Connect</CardTitle>
        <CardDescription>
          Recibe pagos directamente y emite facturas a tu nombre
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <Euro className="h-4 w-4" />
            <AlertDescription>
              Con Stripe Connect, los clientes pagarán directamente a tu cuenta bancaria.
              Dialoom solo cobrará su comisión del 10% + IVA automáticamente.
              Las facturas se emitirán a nombre de tu negocio.
            </AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm">
            <p className="font-medium">Beneficios de usar Stripe Connect:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Recibe pagos directamente en tu cuenta bancaria</li>
              <li>Emite facturas automáticas a nombre de tu negocio</li>
              <li>Gestiona tus impuestos de forma independiente</li>
              <li>Accede a tu panel de Stripe para ver transacciones</li>
              <li>Cumple con las regulaciones fiscales europeas</li>
            </ul>
          </div>

          <Button 
            onClick={handleCreateAccount}
            disabled={isCreatingAccount || createAccountMutation.isPending}
            className="w-full"
          >
            {isCreatingAccount || createAccountMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Comenzar configuración
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
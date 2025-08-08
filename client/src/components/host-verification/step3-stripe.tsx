import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard } from "lucide-react";

interface Step3StripeProps {
  onNext?: () => void;
}

export function Step3Stripe({ onNext }: Step3StripeProps) {
  const { toast } = useToast();
  const getOnboardingLink = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/stripe/connect/onboarding-link", { method: "POST" });
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.url;
      onNext && onNext();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configura Stripe Connect</CardTitle>
        <CardDescription>Completa tu configuración de pagos en Stripe</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Te redirigiremos a Stripe para que completes la verificación de tu cuenta y puedas recibir pagos.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => getOnboardingLink.mutate()} disabled={getOnboardingLink.isPending}>
          {getOnboardingLink.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirigiendo...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Continuar con Stripe
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}


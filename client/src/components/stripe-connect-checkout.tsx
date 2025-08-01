import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface StripeConnectCheckoutProps {
  hostId: string;
  amount: number;
  currency?: string;
  description: string;
  onSuccess?: (paymentIntentId: string) => void;
  onCancel?: () => void;
}

interface CheckoutFormProps {
  onSuccess?: (paymentIntentId: string) => void;
  onCancel?: () => void;
  amount: number;
  currency: string;
  description: string;
}

function CheckoutForm({ onSuccess, onCancel, amount, currency, description }: CheckoutFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: t('payment.error'),
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: t('payment.success'),
          description: t('payment.successMessage'),
        });
        onSuccess?.(paymentIntent.id);
      }
    } catch (error) {
      toast({
        title: t('payment.error'),
        description: t('payment.generalError'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t('payment.completePayment')}
        </CardTitle>
        <div className="text-center">
          <div className="text-2xl font-bold text-[hsl(188,100%,38%)]">
            {formatAmount(amount, currency)}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement
            options={{
              layout: "tabs",
              paymentMethodOrder: ['card', 'google_pay', 'apple_pay']
            }}
          />
          
          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isProcessing}
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1 bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('payment.processing')}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('payment.pay')} {formatAmount(amount, currency)}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function StripeConnectCheckout({
  hostId,
  amount,
  currency = "EUR",
  description,
  onSuccess,
  onCancel
}: StripeConnectCheckoutProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Create payment intent with Stripe Connect
  const createPaymentIntent = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payments/create-connect-payment", {
        hostId,
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        description,
        payment_method_types: ['card', 'google_pay', 'apple_pay', 'sepa_debit']
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast({
        title: t('payment.error'),
        description: error.message || t('payment.generalError'),
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  useEffect(() => {
    createPaymentIntent.mutate();
  }, [hostId, amount]);

  if (isLoading || !clientSecret) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(188,100%,38%)]" />
            <p className="text-gray-600">{t('payment.preparing')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: 'hsl(188, 100%, 38%)',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      }
    }
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        onSuccess={onSuccess}
        onCancel={onCancel}
        amount={amount}
        currency={currency}
        description={description}
      />
    </Elements>
  );
}
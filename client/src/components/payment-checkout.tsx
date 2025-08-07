import { useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Check, Euro, Users, Calendar, Clock } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  bookingDetails: {
    id: string;
    hostName: string;
    date: string;
    time: string;
    duration: number;
    basePrice: number;
    serviceAddons: {
      screenSharing: boolean;
      translation: boolean;
      recording: boolean;
      transcription: boolean;
    };
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ bookingDetails, onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const servicePrices = {
    screenSharing: 10.00,
    translation: 25.00,
    recording: 10.00,
    transcription: 5.00,
  };

  const calculateTotal = () => {
    let total = bookingDetails.basePrice;
    if (bookingDetails.serviceAddons.screenSharing) total += servicePrices.screenSharing;
    if (bookingDetails.serviceAddons.translation) total += servicePrices.translation;
    if (bookingDetails.serviceAddons.recording) total += servicePrices.recording;
    if (bookingDetails.serviceAddons.transcription) total += servicePrices.transcription;
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await apiRequest('POST', '/api/stripe/create-payment-intent', {
        bookingId: bookingDetails.id,
        amount: calculateTotal(),
        serviceAddons: bookingDetails.serviceAddons,
      });
      const data = await response.json();
      const { clientSecret } = data;

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        toast({
          title: "Error en el pago",
          description: error.message || "No se pudo procesar el pago",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pago exitoso",
          description: "Tu videollamada ha sido confirmada",
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el pago",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const total = calculateTotal();
  const commission = total * 0.10;
  const vat = commission * 0.21;
  const hostReceives = total - commission - vat;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumen de la reserva
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Host:
            </span>
            <span className="font-medium">{bookingDetails.hostName}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha:
            </span>
            <span className="font-medium">{bookingDetails.date}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hora:
            </span>
            <span className="font-medium">{bookingDetails.time}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Duración:</span>
            <span className="font-medium">{bookingDetails.duration} minutos</span>
          </div>

          <Separator />

          {/* Price breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Precio base:</span>
              <span>€{bookingDetails.basePrice.toFixed(2)}</span>
            </div>

            {bookingDetails.serviceAddons.screenSharing && (
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Check className="h-3 w-3" />
                  Compartir pantalla:
                </span>
                <span>€{servicePrices.screenSharing.toFixed(2)}</span>
              </div>
            )}

            {bookingDetails.serviceAddons.translation && (
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Check className="h-3 w-3" />
                  Traducción simultánea:
                </span>
                <span>€{servicePrices.translation.toFixed(2)}</span>
              </div>
            )}

            {bookingDetails.serviceAddons.recording && (
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Check className="h-3 w-3" />
                  Grabación:
                </span>
                <span>€{servicePrices.recording.toFixed(2)}</span>
              </div>
            )}

            {bookingDetails.serviceAddons.transcription && (
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Check className="h-3 w-3" />
                  Transcripción:
                </span>
                <span>€{servicePrices.transcription.toFixed(2)}</span>
              </div>
            )}

            <Separator />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-primary">€{total.toFixed(2)}</span>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Comisión Dialoom (10%):</span>
                <span>€{commission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (21%):</span>
                <span>€{vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>El host recibirá:</span>
                <span>€{hostReceives.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Información de pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 border rounded-md">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  "Procesando..."
                ) : (
                  `Pagar €${total.toFixed(2)}`
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function PaymentCheckout(props: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
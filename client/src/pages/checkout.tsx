
// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface BookingData {
  hostId: string;
  hostName: string;
  selectedDate: string;
  selectedTime: string;
  selectedDuration: {
    duration: number;
    price: number;
  };
  selectedServices: {
    screenSharing: boolean;
    translation: boolean;
    recording: boolean;
    transcription: boolean;
  };
}

const CheckoutForm = ({ bookingData }: { bookingData: BookingData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch service prices
  const { data: servicePricing } = useQuery({
    queryKey: ["/api/config/service-prices"],
  });

  const calculateTotal = () => {
    if (!servicePricing || !bookingData) return 0;

    let total = parseFloat(bookingData.selectedDuration.price || 0);
    if (bookingData.selectedServices?.screenSharing)
      total += servicePricing.screenSharing || 0;
    if (bookingData.selectedServices?.translation)
      total += servicePricing.translation || 0;
    if (bookingData.selectedServices?.recording)
      total += servicePricing.recording || 0;
    if (bookingData.selectedServices?.transcription)
      total += servicePricing.transcription || 0;
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success`,
        },
      });

      if (error) {
        console.error("Payment failed:", error);
        toast({
          title: "Error en el pago",
          description: error.message || "No se pudo procesar el pago",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el pago",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setLocation("/hosts")}
          className="flex-1 text-[hsl(188,100%,38%)] border-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,95%)]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="flex-1 bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
        >
          {isProcessing ? "Procesando..." : `Pagar €${calculateTotal()}`}
        </Button>
      </div>
    </form>
  );
};

export default function Checkout() {
  const [, params] = useRoute("/checkout/:sessionId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const { session, clearSession } = useBookingSessionStore();

  // Get booking session data
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ["/api/booking-session", params?.sessionId],
    queryFn: async () => {
      const response = await apiRequest(
        `/api/booking-session/${params?.sessionId}`
      );
      return response.json();
    },
    enabled: !!params?.sessionId,
    retry: false,
  });

  // Create payment intent when session data is loaded
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!sessionData) return;

      try {
        const response = await apiRequest(
          "POST",
          "/api/stripe/create-payment-intent",
          {
            bookingSessionId: params?.sessionId,
          },
        );
        const data = await response.json();

        setClientSecret(data.clientSecret);
        setBookingData(sessionData);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        toast({
          title: "Error",
          description: "No se pudo inicializar el pago",
          variant: "destructive",
        });
        setLocation("/hosts");
      }
    };

    createPaymentIntent();
  }, [sessionData, params?.sessionId]);

  if (isLoading || !clientSecret || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[hsl(188,100%,38%)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "hsl(188, 100%, 38%)",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#ef4444",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[hsl(188,100%,38%)]">
                Resumen de la Reserva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium">{bookingData.hostName}</p>
              <p>
                {format(new Date(bookingData.selectedDate), "dd MMMM yyyy", {
                  locale: es,
                })}
              </p>
              <p>
                {bookingData.selectedTime} (
                {bookingData.selectedDuration.duration} min)
              </p>

              <Separator />

              {/* Services Summary */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-[hsl(188,100%,38%)]">
                  Servicios adicionales:
                </h4>
                {bookingData.selectedServices.screenSharing && (
                  <p className="text-sm">Compartir pantalla</p>
                )}
                {bookingData.selectedServices.recording && (
                  <p className="text-sm">Grabación</p>
                )}
                {!bookingData.selectedServices.screenSharing &&
                  !bookingData.selectedServices.recording && (
                    <p className="text-sm">Ninguno seleccionado</p>
                  )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Sesión ({bookingData.selectedDuration.duration} min)
                  </span>
                  <span>€{bookingData.selectedDuration.price}</span>
                </div>
                {/* Add service prices here if needed */}
                <Separator />
                <div className="flex justify-between font-bold text-[hsl(188,100%,38%)]">
                  <span>Total</span>
                  <span>€{bookingData.selectedDuration.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[hsl(188,100%,38%)]">
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm bookingData={bookingData} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

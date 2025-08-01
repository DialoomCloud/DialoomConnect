import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentMethods } from "@/components/payment-methods";
import { StripeConnectCheckout } from "@/components/stripe-connect-checkout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  User, 
  Star, 
  MapPin, 
  CheckCircle,
  ArrowLeft,
  Sparkles
} from "lucide-react";

export default function PaymentDemo() {
  const { t } = useTranslation();
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // Demo host data
  const demoHost = {
    id: "36733853",
    name: "Nacho Saladrigas",
    title: "Experto en Tecnología y Desarrollo",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    reviews: 127,
    location: "Barcelona, España",
    isVerified: true
  };

  const demoPricing = {
    duration: 60,
    price: 85,
    currency: "EUR"
  };

  const handleBackToMethods = () => {
    setShowStripeCheckout(false);
    setShowPaymentMethods(true);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log("Payment successful:", paymentIntentId);
    setShowStripeCheckout(false);
    setShowPaymentMethods(false);
    setSelectedPaymentMethod(null);
  };

  if (showStripeCheckout && selectedPaymentMethod) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={handleBackToMethods}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a métodos de pago
            </Button>
          </div>
          
          <StripeConnectCheckout
            hostId={demoHost.id}
            amount={demoPricing.price}
            currency={demoPricing.currency}
            description={`Videollamada de ${demoPricing.duration} minutos con ${demoHost.name}`}
            onSuccess={handlePaymentSuccess}
            onCancel={handleBackToMethods}
          />
        </div>
      </div>
    );
  }

  if (showPaymentMethods) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentMethods(false)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la reserva
            </Button>
          </div>

          <PaymentMethods
            amount={demoPricing.price}
            currency={demoPricing.currency}
            hostName={demoHost.name}
            isConnectEnabled={true}
            onPaymentMethodSelect={(method) => {
              setSelectedPaymentMethod(method);
              setShowStripeCheckout(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-4">
            Demo Stripe Connect - Métodos de Pago
          </h1>
          <p className="text-lg text-gray-600">
            Demostración de integración completa con Google Pay, Apple Pay, Visa, Mastercard
          </p>
        </div>

        {/* Demo Booking Card */}
        <Card className="max-w-2xl mx-auto mb-8 border-[hsl(220,13%,90%)] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-[hsl(188,100%,38%)]" />
              Resumen de Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Host Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={demoHost.avatar}
                alt={demoHost.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[hsl(188,100%,38%)]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{demoHost.name}</h3>
                  {demoHost.isVerified && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-1">{demoHost.title}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{demoHost.rating} ({demoHost.reviews} reseñas)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{demoHost.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Booking Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duración:</span>
                <span className="font-semibold">{demoPricing.duration} minutos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-semibold">Martes, 2 Agosto 2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hora:</span>
                <span className="font-semibold">15:00 - 16:00</span>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Videollamada ({demoPricing.duration} min):</span>
                <span>€{demoPricing.price}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span className="text-[hsl(188,100%,38%)]">€{demoPricing.price}</span>
              </div>
            </div>

            {/* Stripe Connect Badge */}
            <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">
                Procesado de forma segura con Stripe Connect
              </span>
            </div>

            {/* Action Button */}
            <Button 
              onClick={() => setShowPaymentMethods(true)}
              className="w-full bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] text-lg py-6"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Proceder al Pago
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-green-800 mb-3">✓ Métodos de Pago Disponibles</h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Tarjetas de crédito/débito (Visa, Mastercard, Amex)</li>
                <li>• Google Pay</li>
                <li>• Apple Pay</li>
                <li>• SEPA Domiciliación bancaria</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-800 mb-3">🔒 Seguridad y Características</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Encriptación SSL/TLS</li>
                <li>• Cumple con PCI DSS</li>
                <li>• Autenticación 3D Secure</li>
                <li>• Detección de fraude en tiempo real</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
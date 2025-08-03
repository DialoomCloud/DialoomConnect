import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Languages, Video, FileText, Calendar, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import PaymentCheckout from "./payment-checkout";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: {
    id: string;
    name: string;
  };
  pricing: {
    duration: number;
    price: string;
  };
  selectedDate: Date;
  selectedTime: string;
}

export function BookingModal({ isOpen, onClose, host, pricing, selectedDate, selectedTime }: BookingModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedServices, setSelectedServices] = useState({
    screenSharing: false,
    translation: false,
    recording: false,
    transcription: false,
  });
  const [showPayment, setShowPayment] = useState(false);
  
  // Check if current user is a test user
  const isTestUser = user?.email === 'billing@thopters.com';

  // Get available services for this host
  const { data: hostServices = {}, isLoading: servicesLoading } = useQuery<{
    screenSharing?: number;
    translation?: number;
    recording?: number;
    transcription?: number;
  }>({
    queryKey: [`/api/host/${host.id}/services`],
    enabled: isOpen,
  });

  const servicePrices = {
    screenSharing: hostServices.screenSharing || 0,
    translation: hostServices.translation || 0,
    recording: hostServices.recording || 0,
    transcription: hostServices.transcription || 0,
  };

  const calculateTotal = () => {
    // Test users get free bookings
    if (isTestUser) return 0;
    
    let total = parseFloat(pricing.price);
    if (selectedServices.screenSharing) total += servicePrices.screenSharing;
    if (selectedServices.translation) total += servicePrices.translation;
    if (selectedServices.recording) total += servicePrices.recording;
    if (selectedServices.transcription) total += servicePrices.transcription;
    return total;
  };

  const handleServiceToggle = (service: keyof typeof selectedServices) => {
    setSelectedServices(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const handleProceedToPayment = () => {
    setShowPayment(true);
  };

  if (showPayment) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl" aria-describedby="payment-dialog-description">
          <div id="payment-dialog-description" className="sr-only">
            Procede con el pago de tu reserva
          </div>
          <PaymentCheckout
            bookingDetails={{
              id: `booking-${Date.now()}`,
              hostName: host.name,
              date: format(selectedDate, "d 'de' MMMM yyyy", { locale: es }),
              time: selectedTime,
              duration: pricing.duration,
              basePrice: parseFloat(pricing.price),
              serviceAddons: selectedServices,
            }}
            onSuccess={() => {
              toast({
                title: "Reserva confirmada",
                description: "Tu videollamada ha sido programada exitosamente",
              });
              onClose();
            }}
            onCancel={() => setShowPayment(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="booking-dialog-description">
        <DialogHeader>
          <DialogTitle>Confirmar Reserva</DialogTitle>
        </DialogHeader>
        <div id="booking-dialog-description" className="sr-only">
          Confirma los detalles de tu reserva de videollamada
        </div>

        <div className="space-y-4">
          {/* Booking details */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span>{format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span>{selectedTime} ({pricing.duration} minutos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">
                    {isTestUser ? 'Modo de Prueba - GRATIS' : `Precio base: €${pricing.price}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service options - Only show if services are available */}
          {!servicesLoading && Object.keys(hostServices).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Servicios Adicionales</h3>
              
              <div className="space-y-3">
                {hostServices.screenSharing !== undefined && (
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="booking-screen-sharing"
                        checked={selectedServices.screenSharing}
                        onCheckedChange={() => handleServiceToggle('screenSharing')}
                      />
                      <div className="flex flex-col">
                        <Label htmlFor="booking-screen-sharing" className="flex items-center gap-2 cursor-pointer">
                          <Monitor className="w-4 h-4 text-gray-600" />
                          <span>Compartir Pantalla</span>
                        </Label>
                        <span className="text-sm text-gray-500 ml-6">Permite compartir tu pantalla durante la llamada</span>
                      </div>
                    </div>
                    <span className="font-medium text-[hsl(188,80%,42%)]">
                      {isTestUser ? 'GRATIS' : `+€${servicePrices.screenSharing.toFixed(2)}`}
                    </span>
                  </div>
                )}

                {hostServices.translation !== undefined && (
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="booking-translation"
                        checked={selectedServices.translation}
                        onCheckedChange={() => handleServiceToggle('translation')}
                      />
                      <div className="flex flex-col">
                        <Label htmlFor="booking-translation" className="flex items-center gap-2 cursor-pointer">
                          <Languages className="w-4 h-4 text-gray-600" />
                          <span>Traducción Simultánea</span>
                        </Label>
                        <span className="text-sm text-gray-500 ml-6">Ofrece traducción en tiempo real durante la sesión</span>
                      </div>
                    </div>
                    <span className="font-medium text-[hsl(188,80%,42%)]">
                      {isTestUser ? 'GRATIS' : `+€${servicePrices.translation.toFixed(2)}`}
                    </span>
                  </div>
                )}

                {hostServices.recording !== undefined && (
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="booking-recording"
                        checked={selectedServices.recording}
                        onCheckedChange={() => handleServiceToggle('recording')}
                      />
                      <div className="flex flex-col">
                        <Label htmlFor="booking-recording" className="flex items-center gap-2 cursor-pointer">
                          <Video className="w-4 h-4 text-gray-600" />
                          <span>Grabación de Sesión</span>
                        </Label>
                        <span className="text-sm text-gray-500 ml-6">Permite grabar la videollamada para referencia futura</span>
                      </div>
                    </div>
                    <span className="font-medium text-[hsl(188,80%,42%)]">
                      {isTestUser ? 'GRATIS' : `+€${servicePrices.recording.toFixed(2)}`}
                    </span>
                  </div>
                )}

                {hostServices.transcription !== undefined && (
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">  
                      <Checkbox
                        id="booking-transcription"
                        checked={selectedServices.transcription}
                        onCheckedChange={() => handleServiceToggle('transcription')}
                      />
                      <div className="flex flex-col">
                        <Label htmlFor="booking-transcription" className="flex items-center gap-2 cursor-pointer">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span>Transcripción Automática</span>
                        </Label>
                        <span className="text-sm text-gray-500 ml-6">Genera una transcripción escrita de la conversación</span>
                      </div>
                    </div>
                    <span className="font-medium text-[hsl(188,80%,42%)]">
                      {isTestUser ? 'GRATIS' : `+€${servicePrices.transcription.toFixed(2)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total:</span>
              <span className="text-2xl font-bold text-[hsl(188,80%,42%)]">
                {isTestUser ? 'GRATIS (Modo de Prueba)' : `€${calculateTotal().toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleProceedToPayment}
              className="flex-1 bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
            >
              {isTestUser ? 'Iniciar Prueba' : 'Proceder al Pago'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Languages, Video, FileText, Calendar, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
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
  const [selectedServices, setSelectedServices] = useState({
    screenSharing: false,
    translation: false,
    recording: false,
    transcription: false,
  });
  const [showPayment, setShowPayment] = useState(false);

  const servicePrices = {
    screenSharing: 10.00,
    translation: 25.00,
    recording: 10.00,
    transcription: 5.00,
  };

  const calculateTotal = () => {
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
        <DialogContent className="max-w-2xl">
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Reserva</DialogTitle>
        </DialogHeader>

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
                  <span className="font-medium">Precio base: €{pricing.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service options */}
          <div className="space-y-3">
            <h3 className="font-medium">Servicios Adicionales</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="booking-screen-sharing"
                    checked={selectedServices.screenSharing}
                    onCheckedChange={() => handleServiceToggle('screenSharing')}
                  />
                  <Label htmlFor="booking-screen-sharing" className="flex items-center gap-2 cursor-pointer">
                    <Monitor className="w-4 h-4 text-gray-600" />
                    <span>Compartir Pantalla</span>
                  </Label>
                </div>
                <span className="font-medium text-[hsl(159,61%,50%)]">+€{servicePrices.screenSharing}</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="booking-translation"
                    checked={selectedServices.translation}
                    onCheckedChange={() => handleServiceToggle('translation')}
                  />
                  <Label htmlFor="booking-translation" className="flex items-center gap-2 cursor-pointer">
                    <Languages className="w-4 h-4 text-gray-600" />
                    <span>Traducción Simultánea</span>
                  </Label>
                </div>
                <span className="font-medium text-[hsl(159,61%,50%)]">+€{servicePrices.translation}</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="booking-recording"
                    checked={selectedServices.recording}
                    onCheckedChange={() => handleServiceToggle('recording')}
                  />
                  <Label htmlFor="booking-recording" className="flex items-center gap-2 cursor-pointer">
                    <Video className="w-4 h-4 text-gray-600" />
                    <span>Grabación de Sesión</span>
                  </Label>
                </div>
                <span className="font-medium text-[hsl(159,61%,50%)]">+€{servicePrices.recording}</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="booking-transcription"
                    checked={selectedServices.transcription}
                    onCheckedChange={() => handleServiceToggle('transcription')}
                  />
                  <Label htmlFor="booking-transcription" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span>Transcripción Automática</span>
                  </Label>
                </div>
                <span className="font-medium text-[hsl(159,61%,50%)]">+€{servicePrices.transcription}</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total:</span>
              <span className="text-2xl font-bold text-[hsl(159,61%,50%)]">€{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleProceedToPayment}
              className="flex-1 bg-[hsl(244,91%,68%)] hover:bg-[hsl(244,91%,60%)]"
            >
              Proceder al Pago
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
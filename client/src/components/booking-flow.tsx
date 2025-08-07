import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Star,
  Instagram,
  Twitter,
  Linkedin,
  Globe,
  MapPin,
  Languages,
  Monitor,
  FileText,
  DollarSign
} from "lucide-react";
import { format, getDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import PaymentCheckout from "./payment-checkout";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useVerificationSettings } from "@/hooks/useVerificationSettings";
import { apiRequest } from "@/lib/queryClient";

interface BookingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  host: any;
  hostServices?: {
    screenSharing?: number;
    translation?: number;
    recording?: number;
    transcription?: number;
  };
}

type BookingStep = 'host-intro' | 'select-date' | 'select-time' | 'select-services' | 'payment' | 'success';

export function BookingFlow({ isOpen, onClose, host, hostServices = {} }: BookingFlowProps) {
  const { toast } = useToast();
  const { data: verificationSettings } = useVerificationSettings();
  const [currentStep, setCurrentStep] = useState<BookingStep>('host-intro');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedDuration, setSelectedDuration] = useState<any>();
  const [selectedServices, setSelectedServices] = useState({
    screenSharing: false,
    translation: false,
    recording: false,
    transcription: false,
  });

  // Fetch host availability
  const { data: availability } = useQuery({
    queryKey: [`/api/users/${host.id}/availability`],
    enabled: isOpen && !!host.id,
  });

  // Initialize selected services based on what host has enabled
  useEffect(() => {
    if (isOpen && hostServices) {
      setSelectedServices({
        screenSharing: hostServices.screenSharing !== undefined && hostServices.screenSharing > 0,
        translation: false, // Not enabled for this host
        recording: hostServices.recording !== undefined && hostServices.recording > 0,
        transcription: false, // Not enabled for this host
      });
    }
  }, [isOpen, hostServices]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('host-intro');
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setSelectedDuration(undefined);
      setSelectedServices({
        screenSharing: hostServices.screenSharing !== undefined && hostServices.screenSharing > 0,
        translation: false,
        recording: hostServices.recording !== undefined && hostServices.recording > 0,
        transcription: false,
      });
    }
  }, [isOpen, hostServices]);

  // Get available time slots for selected date
  const getTimeSlots = () => {
    if (!selectedDate || !availability) {
      return [];
    }

    const dayOfWeek = getDay(selectedDate);
    const availableSlots = availability.filter((slot: any) => {
      if (slot.dayOfWeek !== null) {
        return slot.dayOfWeek === dayOfWeek;
      }
      if (slot.date) {
        const slotDate = parseISO(slot.date);
        return format(slotDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      }
      return false;
    });

    const timeSlots: string[] = [];
    availableSlots.forEach((slot: any) => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      
      for (let hour = startHour; hour < endHour || (hour === endHour && 0 < endMin); hour++) {
        for (let min = (hour === startHour ? startMin : 0); min < 60 && (hour < endHour || min < endMin); min += 30) {
          timeSlots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
        }
      }
    });

    return timeSlots;
  };

  // Check if a date has availability
  const isDateAvailable = (date: Date) => {
    if (!availability || availability.length === 0) return false;
    
    const dayOfWeek = getDay(date);
    return availability.some((slot: any) => {
      if (slot.dayOfWeek !== null) {
        return slot.dayOfWeek === dayOfWeek;
      }
      if (slot.date) {
        const slotDate = parseISO(slot.date);
        return format(slotDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      }
      return false;
    });
  };

  const handleNext = () => {
    const steps: BookingStep[] = ['host-intro', 'select-date', 'select-time', 'select-services', 'payment', 'success'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: BookingStep[] = ['host-intro', 'select-date', 'select-time', 'select-services', 'payment', 'success'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const calculateTotal = () => {
    let total = Number(selectedDuration?.price) || 0;
    if (selectedServices.screenSharing && hostServices.screenSharing) {
      total += Number(hostServices.screenSharing) || 0;
    }
    if (selectedServices.translation && hostServices.translation) {
      total += Number(hostServices.translation) || 0;
    }
    if (selectedServices.recording && hostServices.recording) {
      total += Number(hostServices.recording) || 0;
    }
    if (selectedServices.transcription && hostServices.transcription) {
      total += Number(hostServices.transcription) || 0;
    }
    return total;
  };

  const handlePaymentComplete = () => {
    setCurrentStep('success');
    setTimeout(() => {
      toast({
        title: "¡Reserva confirmada!",
        description: "Recibirás un email con los detalles de la sesión.",
      });
      onClose();
      // Reset state
      setCurrentStep('host-intro');
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setSelectedDuration(undefined);
      setSelectedServices({
        screenSharing: hostServices.screenSharing !== undefined && hostServices.screenSharing > 0,
        translation: false,
        recording: hostServices.recording !== undefined && hostServices.recording > 0,
        transcription: false,
      });
    }, 3000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'host-intro':
        return (
          <div className="space-y-6">
            {/* Host header with avatar */}
            <div className="text-center space-y-4">
              <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-xl">
                <AvatarImage src={host.profileImageUrl} alt={host.firstName} />
                <AvatarFallback>{host.firstName?.[0]}</AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                  {host.firstName} {host.lastName}
                  {host.isVerified && verificationSettings?.showVerified && (
                    <Badge className="bg-blue-500 text-white">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </h2>
                <p className="text-gray-600">{host.title}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{host.rating || '5.0'}</span>
                  <span className="text-gray-500">({host.reviewCount || '12'} reseñas)</span>
                </div>
              </div>

              {/* Social links */}
              <div className="flex justify-center gap-3">
                {host.socialMedia?.instagram && (
                  <a href={`https://instagram.com/${host.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-5 h-5 text-gray-600 hover:text-pink-600 transition-colors" />
                  </a>
                )}
                {host.socialMedia?.twitter && (
                  <a href={`https://twitter.com/${host.socialMedia.twitter}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-5 h-5 text-gray-600 hover:text-blue-400 transition-colors" />
                  </a>
                )}
                {host.socialMedia?.linkedin && (
                  <a href={`https://linkedin.com/in/${host.socialMedia.linkedin}`} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-5 h-5 text-gray-600 hover:text-blue-600 transition-colors" />
                  </a>
                )}
                {host.socialMedia?.website && (
                  <a href={host.socialMedia.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-5 h-5 text-gray-600 hover:text-green-600 transition-colors" />
                  </a>
                )}
              </div>
            </div>

            {/* Host info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{host.city}, {host.countryCode}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Languages className="w-4 h-4" />
                <span>Español, English, Català</span>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Sobre mí</h3>
              <p className="text-sm text-gray-700 line-clamp-4">
                {host.description}
              </p>
            </div>

            {/* Services preview */}
            <div className="grid grid-cols-2 gap-3">
              {host.pricing?.map((price: any) => (
                <Card key={price.id} className="border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-[hsl(188,80%,42%)]" />
                      <span className="text-sm font-medium">{price.duration} min</span>
                    </div>
                    <p className="text-lg font-bold text-[hsl(188,80%,42%)]">€{price.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button 
              onClick={handleNext}
              className="w-full bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
              size="lg"
            >
              Reservar Sesión
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 'select-date':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Selecciona una fecha</h2>
              <p className="text-gray-600">Elige el día que mejor te convenga</p>
            </div>

            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={es}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || !isDateAvailable(date);
                }}
                className="rounded-md border"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedDate}
                className="flex-1 bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'select-time':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Selecciona la hora</h2>
              <p className="text-gray-600">
                {selectedDate && format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>

            {/* Duration selection */}
            <div>
              <h3 className="font-semibold mb-3">Duración de la sesión</h3>
              <div className="grid grid-cols-2 gap-3">
                {host.pricing?.map((price: any) => (
                  <Card 
                    key={price.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedDuration?.id === price.id 
                        ? "border-[hsl(188,80%,42%)] bg-[hsl(188,80%,42%)]/5" 
                        : "hover:border-gray-300"
                    )}
                    onClick={() => setSelectedDuration(price)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{price.duration} minutos</span>
                        <span className="text-lg font-bold text-[hsl(188,80%,42%)]">€{price.price}</span>
                      </div>
                      {price.duration === 0 && (
                        <p className="text-xs text-gray-500">Consulta gratuita</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <h3 className="font-semibold mb-3">Horarios disponibles</h3>
              <div className="grid grid-cols-4 gap-2">
                {getTimeSlots().length === 0 ? (
                  <p className="col-span-4 text-center text-gray-500">No hay horarios disponibles para esta fecha</p>
                ) : (
                  getTimeSlots().map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        selectedTime === time && "bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
                      )}
                    >
                      {time}
                    </Button>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedTime || !selectedDuration}
                className="flex-1 bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'select-services':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Servicios adicionales</h2>
              <p className="text-gray-600">Personaliza tu experiencia</p>
            </div>

            {/* Booking summary */}
            <Card className="bg-gray-50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-600" />
                  <span>{selectedDate && format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span>{selectedTime} ({selectedDuration?.duration} minutos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Precio base: €{selectedDuration?.price}</span>
                </div>
              </CardContent>
            </Card>

            {/* Additional services */}
            {Object.keys(hostServices).length > 0 && (
              <div className="space-y-3">
                {hostServices.screenSharing !== undefined && (
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedServices.screenSharing 
                        ? "border-[hsl(188,80%,42%)] bg-[hsl(188,80%,42%)]/5" 
                        : "hover:border-gray-300"
                    )}
                    onClick={() => setSelectedServices(prev => ({ ...prev, screenSharing: !prev.screenSharing }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Monitor className="w-5 h-5 text-[hsl(188,80%,42%)]" />
                          <div>
                            <p className="font-medium">Compartir Pantalla</p>
                            <p className="text-sm text-gray-500">Comparte tu pantalla durante la sesión</p>
                          </div>
                        </div>
                        <span className="font-medium text-[hsl(188,80%,42%)]">
                          +€{hostServices.screenSharing}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {hostServices.translation !== undefined && (
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedServices.translation 
                        ? "border-[hsl(188,80%,42%)] bg-[hsl(188,80%,42%)]/5" 
                        : "hover:border-gray-300"
                    )}
                    onClick={() => setSelectedServices(prev => ({ ...prev, translation: !prev.translation }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Languages className="w-5 h-5 text-[hsl(188,80%,42%)]" />
                          <div>
                            <p className="font-medium">Traducción Simultánea</p>
                            <p className="text-sm text-gray-500">Traducción en tiempo real</p>
                          </div>
                        </div>
                        <span className="font-medium text-[hsl(188,80%,42%)]">
                          +€{hostServices.translation}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {hostServices.recording !== undefined && (
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedServices.recording 
                        ? "border-[hsl(188,80%,42%)] bg-[hsl(188,80%,42%)]/5" 
                        : "hover:border-gray-300"
                    )}
                    onClick={() => setSelectedServices(prev => ({ ...prev, recording: !prev.recording }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Video className="w-5 h-5 text-[hsl(188,80%,42%)]" />
                          <div>
                            <p className="font-medium">Grabación de Sesión</p>
                            <p className="text-sm text-gray-500">Recibe la grabación completa</p>
                          </div>
                        </div>
                        <span className="font-medium text-[hsl(188,80%,42%)]">
                          +€{hostServices.recording}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {hostServices.transcription !== undefined && (
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedServices.transcription 
                        ? "border-[hsl(188,80%,42%)] bg-[hsl(188,80%,42%)]/5" 
                        : "hover:border-gray-300"
                    )}
                    onClick={() => setSelectedServices(prev => ({ ...prev, transcription: !prev.transcription }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[hsl(188,80%,42%)]" />
                          <div>
                            <p className="font-medium">Transcripción</p>
                            <p className="text-sm text-gray-500">Transcripción escrita de la conversación</p>
                          </div>
                        </div>
                        <span className="font-medium text-[hsl(188,80%,42%)]">
                          +€{hostServices.transcription}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-2xl font-bold text-[hsl(188,80%,42%)]">
                  €{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
              >
                Proceder al Pago
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Pago Seguro</h2>
              <p className="text-gray-600">Completa tu reserva de forma segura</p>
            </div>

            <PaymentCheckout 
              bookingDetails={{
                id: `booking-${Date.now()}`,
                hostName: `${host.firstName} ${host.lastName}`,
                date: selectedDate ? format(selectedDate, "d 'de' MMMM yyyy", { locale: es }) : '',
                time: selectedTime || '',
                duration: selectedDuration?.duration || 0,
                basePrice: selectedDuration?.price || 0,
                serviceAddons: selectedServices,
              }}
              onSuccess={handlePaymentComplete}
              onCancel={handleBack}
            />
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">¡Reserva Confirmada!</h2>
              <p className="text-gray-600">
                Tu sesión con {host.firstName} ha sido confirmada exitosamente
              </p>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="p-4 text-left space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Fecha:</span>{' '}
                  {selectedDate && format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Hora:</span> {selectedTime}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Duración:</span> {selectedDuration?.duration} minutos
                </p>
                <p className="text-sm">
                  <span className="font-medium">Total pagado:</span> €{calculateTotal().toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <p className="text-sm text-gray-500">
              Recibirás un email con todos los detalles y el enlace para unirte a la videollamada
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Reservar Sesión</DialogTitle>
        </VisuallyHidden>
        {/* Progress indicator */}
        {currentStep !== 'success' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {['host-intro', 'select-date', 'select-time', 'select-services', 'payment'].map((step, index) => (
                <div
                  key={step}
                  className={cn(
                    "flex-1 h-1 bg-gray-200 rounded-full mx-1",
                    index <= ['host-intro', 'select-date', 'select-time', 'select-services', 'payment'].indexOf(currentStep) &&
                    "bg-[hsl(188,80%,42%)]"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Clock, User, MapPin, Star } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface HostDetails {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  description?: string;
  city?: string;
  nationality?: string;
  profileImageUrl?: string;
  isVerified?: boolean;
  isRecommended?: boolean;
  averageRating?: number;
  totalSessions?: number;
}

interface PricingOption {
  duration: number;
  price: string;
  currency: string;
}

interface AvailabilitySlot {
  date: string;
  time: string;
  available: boolean;
}

interface ServiceOptions {
  screenSharing: boolean;
  translation: boolean;
  recording: boolean;
  transcription: boolean;
}

interface BookingFlowDirectProps {
  hostId: string;
  hostDetails: HostDetails;
  pricingOptions: PricingOption[];
  availability: AvailabilitySlot[];
  serviceOptions?: {
    enablesScreenSharing?: boolean;
    enablesTranslation?: boolean;
    enablesRecording?: boolean;
    enablesTranscription?: boolean;
  };
}

export function BookingFlowDirect({ 
  hostId, 
  hostDetails, 
  pricingOptions, 
  availability,
  serviceOptions = {}
}: BookingFlowDirectProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<PricingOption | null>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceOptions>({
    screenSharing: false,
    translation: false,
    recording: false,
    transcription: false,
  });

  // Get available time slots for selected date
  const getAvailableTimesForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return availability
      .filter(slot => slot.date === dateString && slot.available)
      .map(slot => slot.time);
  };

  // Create booking session mutation
  const createBookingSessionMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/booking-session', bookingData);
      return response.json();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error al crear la sesión de reserva. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !selectedDuration) {
      toast({
        title: "Información incompleta",
        description: "Por favor selecciona fecha, hora y duración para continuar.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      hostId,
      hostName: `${hostDetails.firstName} ${hostDetails.lastName}`,
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
      selectedTime,
      selectedDuration,
      selectedServices,
    };

    createBookingSessionMutation.mutate(bookingData, {
      onSuccess: (data) => {
        const checkoutUrl = `/checkout/${data.sessionId}`;
        if (isAuthenticated) {
          setLocation(checkoutUrl);
        } else {
          setLocation(`/login?redirect=${encodeURIComponent(checkoutUrl)}`);
        }
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Host Information */}
      <Card className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={hostDetails.profileImageUrl || '/placeholder-avatar.png'}
              alt={`${hostDetails.firstName} ${hostDetails.lastName}`}
              className="w-20 h-20 rounded-full object-cover"
            />
            {hostDetails.isVerified && (
              <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 py-0.5">
                ✓
              </Badge>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {hostDetails.firstName} {hostDetails.lastName}
              {hostDetails.isRecommended && (
                <Badge className="ml-2 bg-yellow-500 text-white">
                  Recomendado
                </Badge>
              )}
            </h1>
            
            {hostDetails.title && (
              <p className="text-gray-600 font-medium">{hostDetails.title}</p>
            )}
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              {hostDetails.city && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {hostDetails.city}
                </div>
              )}
              
              {hostDetails.averageRating && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {hostDetails.averageRating}
                </div>
              )}
              
              {hostDetails.totalSessions && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {hostDetails.totalSessions} sesiones
                </div>
              )}
            </div>
            
            {hostDetails.description && (
              <p className="mt-3 text-gray-700">{hostDetails.description}</p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Date Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Seleccionar fecha
          </h2>
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={es}
            disabled={(date) => {
              const dateString = format(date, 'yyyy-MM-dd');
              return !availability.some(slot => slot.date === dateString && slot.available);
            }}
            className="rounded-md border"
          />
        </Card>

        {/* Time and Duration Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Horario y duración
          </h2>
          
          {/* Time Selection */}
          {selectedDate && (
            <div className="mb-6">
              <h3 className="font-medium mb-3">Horarios disponibles</h3>
              <div className="grid grid-cols-3 gap-2">
                {getAvailableTimesForDate(selectedDate).map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className="text-sm"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Duration Selection */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Duración</h3>
            <div className="space-y-2">
              {pricingOptions.map((option) => (
                <div key={option.duration} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`duration-${option.duration}`}
                    name="duration"
                    checked={selectedDuration?.duration === option.duration}
                    onChange={() => setSelectedDuration(option)}
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor={`duration-${option.duration}`}
                    className="flex-1 flex justify-between cursor-pointer"
                  >
                    <span>{option.duration} minutos</span>
                    <span className="font-medium">€{option.price}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Services */}
      {(serviceOptions.enablesScreenSharing || serviceOptions.enablesTranslation || 
        serviceOptions.enablesRecording || serviceOptions.enablesTranscription) && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Servicios adicionales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceOptions.enablesScreenSharing && (
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="screenSharing"
                  checked={selectedServices.screenSharing}
                  onCheckedChange={(checked) =>
                    setSelectedServices({ ...selectedServices, screenSharing: !!checked })
                  }
                />
                <label htmlFor="screenSharing" className="flex-1 cursor-pointer">
                  Compartir pantalla (+€10)
                </label>
              </div>
            )}
            
            {serviceOptions.enablesTranslation && (
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="translation"
                  checked={selectedServices.translation}
                  onCheckedChange={(checked) =>
                    setSelectedServices({ ...selectedServices, translation: !!checked })
                  }
                />
                <label htmlFor="translation" className="flex-1 cursor-pointer">
                  Traducción en tiempo real (+€15)
                </label>
              </div>
            )}
            
            {serviceOptions.enablesRecording && (
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="recording"
                  checked={selectedServices.recording}
                  onCheckedChange={(checked) =>
                    setSelectedServices({ ...selectedServices, recording: !!checked })
                  }
                />
                <label htmlFor="recording" className="flex-1 cursor-pointer">
                  Grabación de sesión (+€5)
                </label>
              </div>
            )}
            
            {serviceOptions.enablesTranscription && (
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="transcription"
                  checked={selectedServices.transcription}
                  onCheckedChange={(checked) =>
                    setSelectedServices({ ...selectedServices, transcription: !!checked })
                  }
                />
                <label htmlFor="transcription" className="flex-1 cursor-pointer">
                  Transcripción automática (+€8)
                </label>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Book Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleBooking}
          disabled={!selectedDate || !selectedTime || !selectedDuration || createBookingSessionMutation.isPending}
          className="px-8 py-3 text-lg"
        >
          {createBookingSessionMutation.isPending ? "Procesando..." : "Reservar sesión"}
        </Button>
      </div>
    </div>
  );
}
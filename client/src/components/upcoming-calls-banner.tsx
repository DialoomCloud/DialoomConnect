import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, User, Timer, AlertCircle, Languages } from "lucide-react";
import { format, differenceInMilliseconds, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import type { Booking } from "@shared/schema";

interface BookingWithLanguage extends Booking {
  callLanguage?: string;
}

interface UpcomingCallsBannerProps {
  bookings: BookingWithLanguage[];
  userId?: string;
}

export function UpcomingCallsBanner({ bookings, userId }: UpcomingCallsBannerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter upcoming bookings (next 7 days) and sort by date
  const upcomingBookings = bookings
    .filter(booking => {
      const bookingDate = new Date(booking.scheduledDate);
      const timeDiff = differenceInMilliseconds(bookingDate, currentTime);
      return booking.status === "confirmed" && timeDiff > 0 && timeDiff < 7 * 24 * 60 * 60 * 1000; // Next 7 days
    })
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  if (upcomingBookings.length === 0) {
    return null;
  }

  const nextBooking = upcomingBookings[0];
  const bookingDate = new Date(nextBooking.scheduledDate);
  const timeDiff = differenceInMilliseconds(bookingDate, currentTime);
  
  // Calculate countdown components
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  // Determine urgency level
  const isVeryUrgent = timeDiff < 5 * 60 * 1000; // Less than 5 minutes
  const isUrgent = timeDiff < 30 * 60 * 1000; // Less than 30 minutes
  const isSoon = timeDiff < 60 * 60 * 1000; // Less than 1 hour

  const formatCountdown = () => {
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getUrgencyStyles = () => {
    if (isVeryUrgent) {
      return {
        containerClass: "bg-gradient-to-r from-red-50 to-pink-50 border-red-300 shadow-xl border-2 animate-pulse",
        countdownClass: "text-red-700 font-bold text-xl lg:text-2xl",
        buttonClass: "bg-red-600 hover:bg-red-700 text-white animate-pulse border border-red-700"
      };
    } else if (isUrgent) {
      return {
        containerClass: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 shadow-xl border-2",
        countdownClass: "text-orange-700 font-bold text-xl lg:text-2xl",
        buttonClass: "bg-orange-600 hover:bg-orange-700 text-white border border-orange-700"
      };
    } else if (isSoon) {
      return {
        containerClass: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-xl border-2",
        countdownClass: "text-blue-700 font-bold text-xl lg:text-2xl",
        buttonClass: "bg-blue-600 hover:bg-blue-700 text-white border border-blue-700"
      };
    } else {
      return {
        containerClass: "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 shadow-lg border-2",
        countdownClass: "text-emerald-700 font-bold text-lg lg:text-xl",
        buttonClass: "bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] text-white border border-[hsl(188,100%,28%)]"
      };
    }
  };

  const styles = getUrgencyStyles();

  return (
    <Card className={`${styles.containerClass} mb-8`}>
      <CardContent className="p-6">
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Call info and countdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
            {/* Urgency indicator */}
            <div className="flex items-center gap-3">
              {isVeryUrgent ? (
                <AlertCircle className="w-8 h-8 text-red-600 animate-pulse" />
              ) : (
                <Timer className="w-8 h-8 text-gray-600" />
              )}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {isVeryUrgent ? "¡LLAMADA INMINENTE!" : "Próxima Videollamada"}
                </h3>
                <div className={styles.countdownClass}>
                  {isVeryUrgent ? "¡COMIENZA EN " : "Comienza en "}
                  {formatCountdown()}
                </div>
              </div>
            </div>

            {/* Call details */}
            <div className="border-l-0 sm:border-l sm:border-gray-300 sm:pl-6 lg:pl-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {format(bookingDate, "d 'de' MMMM", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {nextBooking.startTime} - {nextBooking.duration} min
                  </span>
                </div>
                {nextBooking.callLanguage && (
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{nextBooking.callLanguage}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {nextBooking.hostId === userId
                    ? `Invitado: Usuario #${nextBooking.guestId}`
                    : `Mentor: ${nextBooking.hostName}`
                  }
                </span>
                <Badge variant="outline" className="ml-2">
                  €{nextBooking.price}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right side - Join button */}
          <div className="flex flex-col items-center lg:items-end gap-3 mt-4 lg:mt-0">
            <Button 
              size="lg"
              className={`${styles.buttonClass} px-8 py-4 text-lg font-semibold shadow-lg transform transition-transform hover:scale-105 w-full sm:w-auto`}
              onClick={() => window.location.href = `/video-call/${nextBooking.id}`}
            >
              <Video className="w-5 h-5 mr-2" />
              Unirse a Llamada
            </Button>
            
            {upcomingBookings.length > 1 && (
              <span className="text-sm text-gray-500">
                +{upcomingBookings.length - 1} más próximas
              </span>
            )}
          </div>
        </div>

        {/* Additional upcoming calls preview (if more than 1) */}
        {upcomingBookings.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Otras llamadas próximas:</h4>
            <div className="flex gap-4">
              {upcomingBookings.slice(1, 4).map((booking, index) => (
                <div key={booking.id} className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {format(new Date(booking.scheduledDate), "d MMM", { locale: es })} - {booking.startTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
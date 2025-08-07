import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format, addDays, startOfDay, isAfter, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import type { HostAvailability } from "@shared/schema";

interface DateTimeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  availability: HostAvailability[];
  onConfirm: (date: Date, time: string) => void;
}

export function DateTimeSelector({ isOpen, onClose, availability, onConfirm }: DateTimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Get available time slots for the selected date
  const getAvailableTimeSlotsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Check for specific date availability first
    const specificDateSlots = availability.filter(
      slot => slot.date && format(new Date(slot.date), "yyyy-MM-dd") === dateStr
    );
    
    if (specificDateSlots.length > 0) {
      return specificDateSlots;
    }
    
    // Otherwise check for recurring weekly availability
    return availability.filter(slot => slot.dayOfWeek === dayOfWeek && !slot.date);
  };

  // Generate time slots based on availability
  const generateTimeSlots = (slot: HostAvailability) => {
    const slots: string[] = [];
    const [startHour, startMinute] = slot.startTime.split(':').map(Number);
    const [endHour, endMinute] = slot.endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
      
      // Increment by 15 minutes
      currentMinute += 15;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
      }
    }
    
    return slots;
  };

  const availableTimeSlots = selectedDate 
    ? getAvailableTimeSlotsForDate(selectedDate).flatMap(generateTimeSlots)
    : [];

  // Disable dates without availability
  const disabledDays = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Check if date is in the past
    if (!isAfter(date, startOfDay(new Date())) && !isSameDay(date, new Date())) {
      return true;
    }
    
    // Check for specific date availability
    const hasSpecificDate = availability.some(
      slot => slot.date && format(new Date(slot.date), "yyyy-MM-dd") === dateStr
    );
    
    if (hasSpecificDate) return false;
    
    // Check for recurring availability
    const hasRecurring = availability.some(
      slot => slot.dayOfWeek === dayOfWeek && !slot.date
    );
    
    return !hasRecurring;
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(selectedDate, selectedTime);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby="datetime-dialog-description">
        <DialogHeader>
          <DialogTitle>Selecciona Fecha y Hora</DialogTitle>
        </DialogHeader>
        <div id="datetime-dialog-description" className="sr-only">
          Selecciona la fecha y hora para tu videollamada
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <h3 className="font-medium mb-3">Fecha</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disabledDays}
              locale={es}
              className="rounded-md border"
              fromDate={startOfMonth(new Date())}
              toDate={addDays(new Date(), 90)}
              showOutsideDays={false}
              weekStartsOn={1}
              showWeekNumber={false}
              fixedWeeks={false}
              ISOWeek={false}
            />
          </div>

          {/* Time slots */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horarios Disponibles
            </h3>
            {selectedDate && availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {availableTimeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    className={selectedTime === time ? "bg-[hsl(188,100%,38%)]" : ""}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : selectedDate ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500 text-center">
                    No hay horarios disponibles para esta fecha
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500 text-center">
                    Selecciona una fecha para ver los horarios disponibles
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)]"
          >
            Continuar con la Reserva
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
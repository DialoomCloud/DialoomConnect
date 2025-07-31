import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Plus, Trash2, Clock, DollarSign, CalendarDays } from "lucide-react";
import type { HostAvailability, HostPricing } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

export function HostAvailabilitySection() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1);
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({ startTime: "", endTime: "" });
  const [customDuration, setCustomDuration] = useState<number>(120);
  const [customPrice, setCustomPrice] = useState<number>(0);

  // Fetch availability
  const { data: availability = [], isLoading: availabilityLoading } = useQuery<HostAvailability[]>({
    queryKey: ["/api/host/availability"],
  });

  // Fetch pricing
  const { data: pricing = [], isLoading: pricingLoading } = useQuery<HostPricing[]>({
    queryKey: ["/api/host/pricing"],
  });

  // Add availability mutation
  const addAvailabilityMutation = useMutation({
    mutationFn: async (data: { date?: string; dayOfWeek?: number; startTime: string; endTime: string }) => {
      await apiRequest("/api/host/availability", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/host/availability"] });
      toast({
        title: "Disponibilidad agregada",
        description: "La franja horaria se ha agregado correctamente.",
      });
      setNewTimeSlot({ startTime: "", endTime: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar la disponibilidad.",
        variant: "destructive",
      });
    },
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/host/availability/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/host/availability"] });
      toast({
        title: "Disponibilidad eliminada",
        description: "La franja horaria se ha eliminado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la disponibilidad.",
        variant: "destructive",
      });
    },
  });

  // Update pricing mutation
  const updatePricingMutation = useMutation({
    mutationFn: async (data: { duration: number; price: number; isActive: boolean; isCustom?: boolean }) => {
      await apiRequest("/api/host/pricing", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/host/pricing"] });
      toast({
        title: "Precio actualizado",
        description: "Los precios se han actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio.",
        variant: "destructive",
      });
    },
  });

  const handleAddTimeSlot = (isSpecificDate: boolean) => {
    if (!newTimeSlot.startTime || !newTimeSlot.endTime) {
      toast({
        title: "Error",
        description: "Por favor, ingresa hora de inicio y fin.",
        variant: "destructive",
      });
      return;
    }

    const data = isSpecificDate
      ? { date: format(selectedDate!, "yyyy-MM-dd"), ...newTimeSlot }
      : { dayOfWeek: selectedDayOfWeek, ...newTimeSlot };

    addAvailabilityMutation.mutate(data);
  };

  const handlePricingToggle = (duration: number, isActive: boolean, currentPrice?: number) => {
    updatePricingMutation.mutate({
      duration,
      price: currentPrice || 0,
      isActive,
      isCustom: false,
    });
  };

  const handleCustomPricing = () => {
    if (customDuration <= 0 || customPrice < 0) {
      toast({
        title: "Error",
        description: "Por favor, ingresa valores válidos.",
        variant: "destructive",
      });
      return;
    }

    updatePricingMutation.mutate({
      duration: customDuration,
      price: customPrice,
      isActive: true,
      isCustom: true,
    });
  };

  const daysOfWeek = [
    "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
  ];

  const getPricingInfo = (duration: number) => {
    return pricing.find(p => p.duration === duration);
  };

  return (
    <div className="space-y-6">
      {/* Pricing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Precios y Duración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Free tier */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">Llamada Gratuita</Label>
              <p className="text-sm text-gray-600">Ofrece llamadas gratuitas de introducción</p>
            </div>
            <Switch
              checked={getPricingInfo(0)?.isActive || false}
              onCheckedChange={(checked) => handlePricingToggle(0, checked)}
            />
          </div>

          {/* 30 minutes */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <Label className="text-base font-medium">30 Minutos</Label>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">€</span>
                <Input
                  type="number"
                  value={getPricingInfo(30)?.price || ""}
                  onChange={(e) => updatePricingMutation.mutate({
                    duration: 30,
                    price: parseFloat(e.target.value) || 0,
                    isActive: true,
                  })}
                  className="w-24"
                  placeholder="0.00"
                />
              </div>
              <Switch
                checked={getPricingInfo(30)?.isActive || false}
                onCheckedChange={(checked) => handlePricingToggle(30, checked, parseFloat(getPricingInfo(30)?.price || "0"))}
              />
            </div>
          </div>

          {/* 60 minutes */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <Label className="text-base font-medium">60 Minutos</Label>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">€</span>
                <Input
                  type="number"
                  value={getPricingInfo(60)?.price || ""}
                  onChange={(e) => updatePricingMutation.mutate({
                    duration: 60,
                    price: parseFloat(e.target.value) || 0,
                    isActive: true,
                  })}
                  className="w-24"
                  placeholder="0.00"
                />
              </div>
              <Switch
                checked={getPricingInfo(60)?.isActive || false}
                onCheckedChange={(checked) => handlePricingToggle(60, checked, parseFloat(getPricingInfo(60)?.price || "0"))}
              />
            </div>
          </div>

          {/* 90 minutes */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <Label className="text-base font-medium">90 Minutos</Label>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">€</span>
                <Input
                  type="number"
                  value={getPricingInfo(90)?.price || ""}
                  onChange={(e) => updatePricingMutation.mutate({
                    duration: 90,
                    price: parseFloat(e.target.value) || 0,
                    isActive: true,
                  })}
                  className="w-24"
                  placeholder="0.00"
                />
              </div>
              <Switch
                checked={getPricingInfo(90)?.isActive || false}
                onCheckedChange={(checked) => handlePricingToggle(90, checked, parseFloat(getPricingInfo(90)?.price || "0"))}
              />
            </div>
          </div>

          {/* Custom duration */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <Label className="text-base font-medium mb-3 block">Duración Personalizada</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-sm">Minutos</Label>
                <Input
                  type="number"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(parseInt(e.target.value) || 0)}
                  placeholder="120"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm">Precio (€)</Label>
                <Input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCustomPricing}
                  disabled={updatePricingMutation.isPending}
                >
                  Agregar
                </Button>
              </div>
            </div>
            {/* Show existing custom durations */}
            <div className="mt-4 space-y-2">
              {pricing.filter(p => p.isCustom).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.duration} minutos - €{p.price}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updatePricingMutation.mutate({
                      duration: p.duration,
                      price: parseFloat(p.price),
                      isActive: false,
                      isCustom: true,
                    })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">Horario Semanal</TabsTrigger>
              <TabsTrigger value="specific">Fechas Específicas</TabsTrigger>
            </TabsList>

            {/* Weekly Schedule */}
            <TabsContent value="weekly" className="space-y-4">
              <div className="space-y-2">
                <Label>Día de la semana</Label>
                <select
                  value={selectedDayOfWeek}
                  onChange={(e) => setSelectedDayOfWeek(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                >
                  {daysOfWeek.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hora de inicio</Label>
                  <Input
                    type="time"
                    value={newTimeSlot.startTime}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Hora de fin</Label>
                  <Input
                    type="time"
                    value={newTimeSlot.endTime}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleAddTimeSlot(false)}
                disabled={addAvailabilityMutation.isPending}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Franja Horaria
              </Button>

              {/* Weekly slots list */}
              <div className="space-y-2">
                {availability
                  .filter(a => a.dayOfWeek !== null && !a.date)
                  .sort((a, b) => (a.dayOfWeek || 0) - (b.dayOfWeek || 0))
                  .map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{daysOfWeek[slot.dayOfWeek || 0]}</span>
                        <span className="text-gray-600">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAvailabilityMutation.mutate(slot.id)}
                        disabled={deleteAvailabilityMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </TabsContent>

            {/* Specific Dates */}
            <TabsContent value="specific" className="space-y-4">
              <div>
                <Label>Selecciona una fecha</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={es}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Hora de inicio</Label>
                      <Input
                        type="time"
                        value={newTimeSlot.startTime}
                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Hora de fin</Label>
                      <Input
                        type="time"
                        value={newTimeSlot.endTime}
                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddTimeSlot(true)}
                    disabled={addAvailabilityMutation.isPending}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Franja Horaria
                  </Button>
                </>
              )}

              {/* Specific date slots list */}
              <div className="space-y-2">
                {availability
                  .filter(a => a.date)
                  .sort((a, b) => new Date(a.date || "").getTime() - new Date(b.date || "").getTime())
                  .map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {format(new Date(slot.date || ""), "d 'de' MMMM 'de' yyyy", { locale: es })}
                        </span>
                        <span className="text-gray-600">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAvailabilityMutation.mutate(slot.id)}
                        disabled={deleteAvailabilityMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
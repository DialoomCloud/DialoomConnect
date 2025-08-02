import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Plus, Trash2, Clock, DollarSign, CalendarDays, Monitor, Languages, Video, FileText, Settings } from "lucide-react";
import type { HostAvailability, HostPricing } from "@shared/schema";
import { format } from "date-fns";
import { es, enUS, ca } from "date-fns/locale";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

export function HostAvailabilitySection() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({ startTime: "", endTime: "" });
  const [customDuration, setCustomDuration] = useState<number>(120);
  const [customPrice, setCustomPrice] = useState<number>(0);
  
  // Fetch admin config
  const { data: adminConfig } = useQuery<Record<string, any>>({
    queryKey: ['/api/admin/config'],
  });
  
  // Get appropriate locale for date-fns
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'ca': return ca;
      default: return es;
    }
  };

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
        title: t('availability.addSuccess'),
        description: t('availability.addSuccessDesc'),
      });
      setNewTimeSlot({ startTime: "", endTime: "" });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('availability.addError'),
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
        title: t('availability.deleteSuccess'),
        description: t('availability.deleteSuccessDesc'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('availability.deleteError'),
        variant: "destructive",
      });
    },
  });

  // Update pricing mutation
  const updatePricingMutation = useMutation({
    mutationFn: async (data: { 
      duration: number; 
      price: number; 
      isActive: boolean; 
      isCustom?: boolean;
      includesScreenSharing?: boolean;
      includesTranslation?: boolean;
      includesRecording?: boolean;
      includesTranscription?: boolean;
    }) => {
      await apiRequest("/api/host/pricing", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/host/pricing"] });
      toast({
        title: t('pricing.updateSuccess'),
        description: t('pricing.updateSuccessDesc'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('pricing.updateError'),
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

    if (isSpecificDate) {
      const data = { date: format(selectedDate!, "yyyy-MM-dd"), ...newTimeSlot };
      addAvailabilityMutation.mutate(data);
    } else {
      // Add time slot for each selected day
      selectedDaysOfWeek.forEach(dayOfWeek => {
        addAvailabilityMutation.mutate({ dayOfWeek, ...newTimeSlot });
      });
    }
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
    t('availability.sunday'),
    t('availability.monday'), 
    t('availability.tuesday'),
    t('availability.wednesday'),
    t('availability.thursday'),
    t('availability.friday'),
    t('availability.saturday')
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
            {t('pricing.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Free tier - 5 minutes */}
          {adminConfig?.allow_free_calls !== false && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">{t('availability.freeConsultation')} (5 min)</Label>
                <p className="text-sm text-gray-600">{t('pricing.freeDesc')}</p>
              </div>
              <Switch
                checked={getPricingInfo(5)?.isActive || false}
                onCheckedChange={(checked) => handlePricingToggle(5, checked)}
              />
            </div>
          )}

          {/* 30 minutes */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <Label className="text-base font-medium">{t('availability.30minutes')}</Label>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">€</span>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={Math.round(parseFloat(getPricingInfo(30)?.price || "0"))}
                  onChange={(e) => updatePricingMutation.mutate({
                    duration: 30,
                    price: parseInt(e.target.value) || 0,
                    isActive: true,
                  })}
                  className="w-24"
                  placeholder="30"
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
              <Label className="text-base font-medium">{t('availability.60minutes')}</Label>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">€</span>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={Math.round(parseFloat(getPricingInfo(60)?.price || "0"))}
                  onChange={(e) => updatePricingMutation.mutate({
                    duration: 60,
                    price: parseInt(e.target.value) || 0,
                    isActive: true,
                  })}
                  className="w-24"
                  placeholder="60"
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
              <Label className="text-base font-medium">{t('availability.90minutes')}</Label>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">€</span>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={Math.round(parseFloat(getPricingInfo(90)?.price || "0"))}
                  onChange={(e) => updatePricingMutation.mutate({
                    duration: 90,
                    price: parseInt(e.target.value) || 0,
                    isActive: true,
                  })}
                  className="w-24"
                  placeholder="90"
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
            <Label className="text-base font-medium mb-3 block">{t('pricing.customDuration')}</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-sm">{t('pricing.minutes')}</Label>
                <Input
                  type="number"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(parseInt(e.target.value) || 0)}
                  placeholder="120"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm">{t('pricing.price')} (€)</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(parseInt(e.target.value) || 0)}
                  placeholder="120"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCustomPricing}
                  disabled={updatePricingMutation.isPending}
                >
                  {t('common.add')}
                </Button>
              </div>
            </div>
            {/* Show existing custom durations */}
            <div className="mt-4 space-y-2">
              {pricing.filter(p => p.isCustom).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.duration} minutos - €{Math.round(parseFloat(p.price))}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updatePricingMutation.mutate({
                      duration: p.duration,
                      price: parseInt(p.price),
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

      {/* Additional Services Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('services.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">{t('services.description')}</p>
          
          {/* Screen Sharing */}
          {adminConfig?.allow_screen_sharing !== false && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <div>
                  <Label className="text-base font-medium">{t('services.screenSharing')}</Label>
                  <p className="text-sm text-gray-600">{t('services.screenSharingDesc')}</p>
                </div>
              </div>
              <Switch
                checked={pricing.some(p => p.includesScreenSharing)}
                onCheckedChange={(checked) => {
                  const activePricing = pricing.filter(p => p.isActive);
                  activePricing.forEach(p => {
                    updatePricingMutation.mutate({
                      duration: p.duration,
                      price: parseFloat(p.price),
                      isActive: true,
                      includesScreenSharing: checked,
                      includesTranslation: p.includesTranslation,
                      includesRecording: p.includesRecording,
                      includesTranscription: p.includesTranscription,
                    });
                  });
                }}
              />
            </div>
          )}

          {/* Translation */}
          {adminConfig?.allow_translation !== false && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5 text-gray-600" />
                <div>
                  <Label className="text-base font-medium">{t('services.translation')}</Label>
                  <p className="text-sm text-gray-600">{t('services.translationDesc')}</p>
                </div>
              </div>
              <Switch
                checked={pricing.some(p => p.includesTranslation)}
                onCheckedChange={(checked) => {
                  const activePricing = pricing.filter(p => p.isActive);
                  activePricing.forEach(p => {
                    updatePricingMutation.mutate({
                      duration: p.duration,
                      price: parseFloat(p.price),
                      isActive: true,
                      includesScreenSharing: p.includesScreenSharing,
                      includesTranslation: checked,
                      includesRecording: p.includesRecording,
                      includesTranscription: p.includesTranscription,
                    });
                  });
                }}
              />
            </div>
          )}

          {/* Recording */}
          {adminConfig?.allow_recording !== false && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-gray-600" />
                <div>
                  <Label className="text-base font-medium">{t('services.recording')}</Label>
                  <p className="text-sm text-gray-600">{t('services.recordingDesc')}</p>
                </div>
              </div>
              <Switch
                checked={pricing.some(p => p.includesRecording)}
                onCheckedChange={(checked) => {
                  const activePricing = pricing.filter(p => p.isActive);
                  activePricing.forEach(p => {
                    updatePricingMutation.mutate({
                      duration: p.duration,
                      price: parseFloat(p.price),
                      isActive: true,
                      includesScreenSharing: p.includesScreenSharing,
                      includesTranslation: p.includesTranslation,
                      includesRecording: checked,
                      includesTranscription: p.includesTranscription,
                    });
                  });
                }}
              />
            </div>
          )}

          {/* Transcription */}
          {adminConfig?.allow_transcription !== false && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <Label className="text-base font-medium">{t('services.transcription')}</Label>
                  <p className="text-sm text-gray-600">{t('services.transcriptionDesc')}</p>
                </div>
              </div>
              <Switch
                checked={pricing.some(p => p.includesTranscription)}
                onCheckedChange={(checked) => {
                  const activePricing = pricing.filter(p => p.isActive);
                  activePricing.forEach(p => {
                    updatePricingMutation.mutate({
                      duration: p.duration,
                      price: parseFloat(p.price),
                      isActive: true,
                      includesScreenSharing: p.includesScreenSharing,
                      includesTranslation: p.includesTranslation,
                      includesRecording: p.includesRecording,
                      includesTranscription: checked,
                    });
                  });
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            {t('availability.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">{t('availability.weeklySchedule')}</TabsTrigger>
              <TabsTrigger value="specific">{t('availability.specificDates')}</TabsTrigger>
            </TabsList>

            {/* Weekly Schedule */}
            <TabsContent value="weekly" className="space-y-4">
              <div className="space-y-2">
                <Label className="block mb-2">{t('availability.selectDays')}</Label>
                <div className="space-y-2">
                  {daysOfWeek.map((day, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`weekday-${index}`}
                        checked={selectedDaysOfWeek.includes(index)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDaysOfWeek([...selectedDaysOfWeek, index]);
                          } else {
                            setSelectedDaysOfWeek(selectedDaysOfWeek.filter(d => d !== index));
                          }
                        }}
                        className="border-gray-300 text-[hsl(188,100%,38%)]"
                      />
                      <Label 
                        htmlFor={`weekday-${index}`}
                        className="flex-1 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('availability.startTime')}</Label>
                  <Input
                    type="time"
                    value={newTimeSlot.startTime}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('availability.endTime')}</Label>
                  <Input
                    type="time"
                    value={newTimeSlot.endTime}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleAddTimeSlot(false)}
                disabled={addAvailabilityMutation.isPending || selectedDaysOfWeek.length === 0}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('availability.addTimeSlot')} {selectedDaysOfWeek.length} {selectedDaysOfWeek.length !== 1 ? t('common.days') : t('common.day')}
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
                <Label>{t('availability.selectDate')}</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={getDateLocale()}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('availability.startTime')}</Label>
                      <Input
                        type="time"
                        value={newTimeSlot.startTime}
                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{t('availability.endTime')}</Label>
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
                    {t('availability.addSlot')}
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
                          {format(new Date(slot.date || ""), i18n.language === 'es' ? "d 'de' MMMM 'de' yyyy" : "MMMM d, yyyy", { locale: getDateLocale() })}
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
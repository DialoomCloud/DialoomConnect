import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, Euro, Plus, Save, Trash2 } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: 0, label: 'availability.sunday' },
  { value: 1, label: 'availability.monday' },
  { value: 2, label: 'availability.tuesday' },
  { value: 3, label: 'availability.wednesday' },
  { value: 4, label: 'availability.thursday' },
  { value: 5, label: 'availability.friday' },
  { value: 6, label: 'availability.saturday' },
];

const DURATION_OPTIONS = [
  { value: 0, label: 'availability.freeConsultation', price: 0 },
  { value: 30, label: 'availability.30minutes' },
  { value: 60, label: 'availability.60minutes' },
  { value: 90, label: 'availability.90minutes' },
];

export default function HostAvailability() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [pricingOptions, setPricingOptions] = useState<{ duration: number; price: string }[]>([
    { duration: 30, price: "50" },
    { duration: 60, price: "90" },
    { duration: 90, price: "120" }
  ]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch host availability
  const { data: availability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ["/api/host/availability"],
    enabled: isAuthenticated,
  });

  // Fetch host pricing
  const { data: pricing = [], isLoading: pricingLoading } = useQuery({
    queryKey: ["/api/host/pricing"],
    enabled: isAuthenticated,
  });

  // Save availability mutation
  const saveAvailabilityMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest({ 
        url: '/api/host/availability', 
        options: { 
          method: "POST",
          body: JSON.stringify(data)
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/host/availability"] });
      toast({
        title: t('availability.saveSuccess'),
        description: t('availability.saveSuccessDesc'),
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('common.error'),
        description: t('availability.saveError'),
        variant: "destructive",
      });
    },
  });

  // Save pricing mutation
  const savePricingMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest({ 
        url: '/api/host/pricing', 
        options: { 
          method: "POST",
          body: JSON.stringify(data)
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/host/pricing"] });
      toast({
        title: t('pricing.saveSuccess'),
        description: t('pricing.saveSuccessDesc'),
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('common.error'),
        description: t('pricing.saveError'),
        variant: "destructive",
      });
    },
  });

  const handleSaveAvailability = () => {
    const availabilityData = selectedDays.map(day => ({
      dayOfWeek: day,
      startTime,
      endTime,
    }));
    
    saveAvailabilityMutation.mutate(availabilityData);
  };

  const handleSavePricing = () => {
    const pricingData = pricingOptions.map(option => ({
      duration: option.duration,
      price: parseFloat(option.price) || 0,
    }));
    
    savePricingMutation.mutate(pricingData);
  };

  const updatePricing = (duration: number, price: string) => {
    setPricingOptions(prev => 
      prev.map(opt => opt.duration === duration ? { ...opt, price } : opt)
    );
  };

  if (authLoading || availabilityLoading || pricingLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(188,100%,38%)]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-4">{t('availability.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('availability.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Availability Settings */}
          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {t('availability.weeklySchedule')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">{t('availability.selectDays')}</Label>
                <div className="space-y-2">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={selectedDays.includes(day.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDays([...selectedDays, day.value]);
                          } else {
                            setSelectedDays(selectedDays.filter(d => d !== day.value));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`day-${day.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {t(day.label)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">{t('availability.startTime')}</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">{t('availability.endTime')}</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveAvailability}
                disabled={selectedDays.length === 0 || saveAvailabilityMutation.isPending}
                className="w-full bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)]"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('availability.saveSchedule')}
              </Button>
            </CardContent>
          </Card>

          {/* Pricing Settings */}
          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-[hsl(188,80%,42%)]" />
                {t('pricing.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">{t('availability.freeConsultation')}</Label>
                    <Badge className="bg-[hsl(188,80%,95%)] text-[hsl(188,80%,42%)]">
                      {t('pricing.free')}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{t('pricing.freeDesc')}</p>
                </div>

                {pricingOptions.map(option => (
                  <div key={option.duration} className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      {option.duration} {t('pricing.minutes')}
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">€</span>
                      <Input
                        type="number"
                        value={option.price}
                        onChange={(e) => updatePricing(option.duration, e.target.value)}
                        className="w-24"
                        min="0"
                        step="5"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSavePricing}
                disabled={savePricingMutation.isPending}
                className="w-full bg-[hsl(188,80%,42%)] text-white hover:bg-[hsl(188,80%,36%)]"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('pricing.savePricing')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Schedule Display */}
        {availability.length > 0 && (
          <Card className="mt-8 bg-white border-[hsl(220,13%,90%)] shadow-lg">
            <CardHeader>
              <CardTitle>{t('availability.currentSchedule')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availability.map((slot: any) => (
                  <div key={slot.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t(DAYS_OF_WEEK.find(d => d.value === slot.dayOfWeek)?.label || '')}</p>
                      <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
                    </div>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Star, 
  TrendingUp,
  CalendarCheck,
  CalendarX,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Booking } from "@shared/schema";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState("upcoming");

  // Fetch bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  // Calculate statistics
  const stats = {
    totalEarnings: bookings
      .filter(b => b.status === "completed" && b.hostId === user?.id)
      .reduce((sum, b) => sum + parseFloat(b.price), 0),
    upcomingCalls: bookings
      .filter(b => b.status === "confirmed" && new Date(b.scheduledDate) >= new Date())
      .length,
    completedCalls: bookings.filter(b => b.status === "completed").length,
    averageRating: 4.8, // This would come from reviews
  };

  const upcomingBookings = bookings.filter(
    b => b.status === "confirmed" && new Date(b.scheduledDate) >= new Date()
  );

  const pastBookings = bookings.filter(
    b => b.status === "completed" || new Date(b.scheduledDate) < new Date()
  );

  if (authLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(244,91%,68%)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-4">Panel de Control</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gestiona tus videollamadas, revisa las reseñas y controla tus ingresos
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[hsl(159,61%,95%)] rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[hsl(159,61%,50%)]" />
                </div>
                <TrendingUp className="w-4 h-4 text-[hsl(159,61%,50%)]" />
              </div>
              <h3 className="text-2xl font-bold text-[hsl(17,12%,6%)]">€{stats.totalEarnings.toFixed(2)}</h3>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[hsl(244,91%,95%)] rounded-full flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6 text-[hsl(244,91%,68%)]" />
                </div>
                <span className="text-sm font-medium text-[hsl(244,91%,68%)]">+2</span>
              </div>
              <h3 className="text-2xl font-bold text-[hsl(17,12%,6%)]">{stats.upcomingCalls}</h3>
              <p className="text-sm text-gray-600">Llamadas Pendientes</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[hsl(340,82%,95%)] rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-[hsl(340,82%,52%)]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[hsl(17,12%,6%)]">{stats.completedCalls}</h3>
              <p className="text-sm text-gray-600">Llamadas Completadas</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[hsl(48,96%,95%)] rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-[hsl(48,96%,53%)]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[hsl(17,12%,6%)]">{stats.averageRating}</h3>
              <p className="text-sm text-gray-600">Calificación Promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
          <CardHeader>
            <CardTitle>Gestión de Llamadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Próximas</TabsTrigger>
                <TabsTrigger value="past">Pasadas</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tienes llamadas pendientes
                  </div>
                ) : (
                  upcomingBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {format(new Date(booking.scheduledDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                            </span>
                            <Clock className="w-4 h-4 text-gray-500 ml-4" />
                            <span>{booking.startTime} - {booking.duration} min</span>
                          </div>
                          <p className="text-sm text-gray-600">Invitado: Usuario #{booking.guestId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[hsl(159,61%,50%)]">€{booking.price}</p>
                          <Button size="sm" className="mt-2">
                            Unirse a Llamada
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tienes llamadas pasadas
                  </div>
                ) : (
                  pastBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {format(new Date(booking.scheduledDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                            </span>
                            <Badge 
                              variant={booking.status === "completed" ? "default" : "secondary"}
                              className="ml-2"
                            >
                              {booking.status === "completed" ? "Completada" : "Cancelada"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Invitado: Usuario #{booking.guestId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[hsl(159,61%,50%)]">€{booking.price}</p>
                          <Button size="sm" variant="outline" className="mt-2">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Ver Reseña
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Billing Section */}
        <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Facturación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Este Mes</p>
                  <p className="text-2xl font-bold text-[hsl(159,61%,50%)]">€245.00</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Mes Pasado</p>
                  <p className="text-2xl font-bold text-gray-700">€180.00</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Anual</p>
                  <p className="text-2xl font-bold text-gray-700">€{stats.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline">
                  Descargar Factura
                </Button>
                <Button className="bg-[hsl(244,91%,68%)] text-white hover:bg-[hsl(244,91%,60%)]">
                  Configurar Pagos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
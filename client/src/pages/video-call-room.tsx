import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { VideoCall } from "@/components/video-call";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function VideoCallRoom() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCallActive, setIsCallActive] = useState(false);

  // Fetch booking details and token
  const { data: callData, error, isLoading } = useQuery({
    queryKey: ["/api/video-call/token", bookingId],
    queryFn: async () => {
      const response = await apiRequest("POST", `/api/video-call/token`, {
        bookingId: bookingId,
        userId: user?.id
      });
      return await response.json();
    },
    enabled: !!user && !!bookingId,
  });

  const handleEndCall = async () => {
    try {
      await apiRequest("POST", `/api/video-call/end`, {
        bookingId: bookingId
      });
      
      toast({
        title: "Llamada finalizada",
        description: "La videollamada ha terminado",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo finalizar la llamada correctamente",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[hsl(188,100%,38%)] mx-auto mb-4" />
          <p className="text-white">Preparando la videollamada...</p>
        </div>
      </div>
    );
  }

  if (error || !callData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Error al acceder a la llamada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              No se pudo acceder a esta videollamada. Verifica que tienes permiso y que la llamada está programada.
            </p>
            <Button 
              onClick={() => setLocation("/dashboard")}
              className="w-full"
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCallActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Videollamada con {callData.hostName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Fecha:</p>
                <p className="font-medium">{new Date(callData.scheduledDate).toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hora:</p>
                <p className="font-medium">{callData.startTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duración:</p>
                <p className="font-medium">{callData.duration} minutos</p>
              </div>
              
              {callData.services && callData.services.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Servicios adicionales:</p>
                  <ul className="list-disc list-inside text-sm">
                    {callData.services.map((service: string) => (
                      <li key={service} className="text-gray-700">{service}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                onClick={() => setIsCallActive(true)}
                className="w-full bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
              >
                Unirse a la Videollamada
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <VideoCall
      appId={callData.appId || ""}
      channelName={callData.channelName}
      token={callData.token}
      userId={user?.id || ""}
      onEndCall={handleEndCall}
    />
  );
}
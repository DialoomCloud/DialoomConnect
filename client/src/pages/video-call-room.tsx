import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { VideoCall } from "@/components/video-call";
import { VideoCallLobby } from "@/components/video-call-lobby";
import { SessionRatingModal } from "@/components/session-rating-modal";
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
  const [showLobby, setShowLobby] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Fetch booking details and token
  const { data: callData, error, isLoading } = useQuery({
    queryKey: ["/api/video-call/token", bookingId],
    queryFn: async () => {
      const response = await fetch("/api/video-call/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: bookingId,
          userId: user && typeof user === 'object' && 'id' in user ? user.id : ""
        }),
      });
      if (!response.ok) throw new Error("Failed to get call token");
      return response.json();
    },
    enabled: !!user && !!bookingId,
  });

  const handleEndCall = async () => {
    try {
      await apiRequest("POST", `/api/video-call/end/${bookingId}`);
      
      // Show rating modal if user is the guest
      if (callData && user && typeof user === 'object' && 'id' in user && user.id === callData.guestId) {
        setShowRatingModal(true);
      } else {
        toast({
          title: "Llamada finalizada",
          description: "La videollamada ha terminado",
        });
        setLocation("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo finalizar la llamada correctamente",
        variant: "destructive",
      });
    }
  };

  const handleJoinCall = () => {
    setShowLobby(false);
    setIsCallActive(true);
  };

  const handleCancelLobby = () => {
    setLocation("/dashboard");
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

  // Show lobby if call is not active and lobby is enabled
  if (!isCallActive && showLobby) {
    return (
      <>
        <VideoCallLobby
          onJoinCall={handleJoinCall}
          onCancel={handleCancelLobby}
          hostName={callData.hostName}
          sessionDetails={{
            date: new Date(callData.scheduledDate).toLocaleDateString('es-ES'),
            time: callData.startTime,
            duration: callData.duration,
            callLanguage: callData.callLanguage
          }}
        />
        
        {/* Rating Modal */}
        {showRatingModal && (
          <SessionRatingModal
            isOpen={showRatingModal}
            onClose={() => {
              setShowRatingModal(false);
              setLocation("/dashboard");
            }}
            bookingId={bookingId || ""}
            hostName={callData.hostName}
          />
        )}
      </>
    );
  }

  return (
    <>
      <VideoCall
        appId={callData.appId || ""}
        channelName={callData.channelName}
        token={callData.token}
        userId={user && typeof user === 'object' && 'id' in user ? String(user.id) : ""}
        onEndCall={handleEndCall}
        callLanguage={callData.callLanguage}
      />
      
      {/* Rating Modal */}
      {showRatingModal && (
        <SessionRatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setLocation("/dashboard");
          }}
          bookingId={bookingId || ""}
          hostName={callData.hostName}
        />
      )}
    </>
  );
}
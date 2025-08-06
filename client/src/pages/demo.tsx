import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoCall } from "@/components/video-call";
import { Video, Users, Coffee, Loader2, Share } from "lucide-react";

interface DemoCallData {
  appId: string;
  channelName: string;
  token: string;
  userId: string;
}

export default function Demo() {
  const { toast } = useToast();
  const [isInCall, setIsInCall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callData, setCallData] = useState<DemoCallData | null>(null);
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");

  // Generate random user name and room name on load
  useEffect(() => {
    const adjectives = ["Happy", "Cool", "Smart", "Friendly", "Creative", "Brilliant", "Awesome", "Dynamic"];
    const nouns = ["Tiger", "Eagle", "Dolphin", "Phoenix", "Lion", "Falcon", "Wolf", "Shark"];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    
    setUserName(`${randomAdjective}${randomNoun}${randomNumber}`);
    setRoomName(`demo-room-${Math.floor(Math.random() * 1000)}`);
  }, []);

  const joinCall = async () => {
    if (!userName.trim() || !roomName.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa tu nombre y nombre de sala",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/video-call/demo-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName: roomName.trim(),
          userName: userName.trim()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get demo token");
      }

      const data = await response.json();
      setCallData(data);
      setIsInCall(true);
      
      toast({
        title: "¡Conexión exitosa!",
        description: "Te has unido a la videollamada demo",
      });
    } catch (error) {
      console.error("Error joining demo call:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo unir a la videollamada. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = () => {
    setIsInCall(false);
    setCallData(null);
    toast({
      title: "Llamada finalizada",
      description: "Has salido de la videollamada demo",
    });
  };

  const copyRoomLink = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('room', roomName);
    navigator.clipboard.writeText(currentUrl.toString());
    toast({
      title: "Link copiado",
      description: "El enlace de la sala ha sido copiado al portapapeles",
    });
  };

  // If in call, show video call interface
  if (isInCall && callData) {
    return (
      <VideoCall
        appId={callData.appId}
        channelName={callData.channelName}
        token={callData.token}
        userId={callData.userId}
        onEndCall={endCall}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(220,9%,98%)] to-[hsl(220,20%,95%)]">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[hsl(17,12%,6%)] mb-4">
              Demo de Videollamadas
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Prueba nuestra tecnología de videollamadas sin necesidad de registro. Conecta con otros usuarios de forma anónima y experimenta la calidad de Dialoom.
            </p>
          </div>
        </div>

        {/* Demo Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Join Room Card */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[hsl(17,12%,6%)]">
                  <Users className="w-6 h-6 text-[hsl(188,100%,38%)]" />
                  Unirse a Videollamada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userName" className="text-sm font-medium text-gray-700">
                      Tu nombre (será visible para otros participantes)
                    </Label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="mt-1"
                      maxLength={50}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="roomName" className="text-sm font-medium text-gray-700">
                      Nombre de la sala
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="roomName"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Ej: mi-sala-demo"
                        className="flex-1"
                        maxLength={100}
                      />
                      <Button
                        variant="outline"
                        onClick={copyRoomLink}
                        className="px-3"
                        title="Copiar enlace de la sala"
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Comparte este nombre con otros para que se unan a la misma sala
                    </p>
                  </div>
                </div>

                <Button
                  onClick={joinCall}
                  disabled={isLoading || !userName.trim() || !roomName.trim()}
                  className="w-full bg-[hsl(188,100%,38%)] text-white hover:bg-[hsl(188,100%,32%)] h-12 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5 mr-2" />
                      Unirse a la Videollamada
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Information Card */}
          <div className="space-y-6">
            <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[hsl(17,12%,6%)]">
                  <Coffee className="w-6 h-6 text-[hsl(188,100%,38%)]" />
                  Cómo funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[hsl(188,100%,38%)] font-semibold text-xs">1</span>
                    </div>
                    <p>Ingresa tu nombre y el nombre de la sala</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[hsl(188,100%,38%)] font-semibold text-xs">2</span>
                    </div>
                    <p>Haz clic en "Unirse a la Videollamada"</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[hsl(188,100%,38%)] font-semibold text-xs">3</span>
                    </div>
                    <p>Permite acceso a tu cámara y micrófono</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[hsl(188,100%,38%)] font-semibold text-xs">4</span>
                    </div>
                    <p>¡Comienza a conversar con otros usuarios!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[hsl(188,100%,95%)] to-[hsl(188,80%,90%)] border-[hsl(188,100%,85%)] shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-[hsl(188,100%,25%)] mb-3">
                  ✨ Características del Demo
                </h3>
                <ul className="space-y-2 text-sm text-[hsl(188,100%,30%)]">
                  <li>• Videollamadas HD sin registro</li>
                  <li>• Audio cristalino</li>
                  <li>• Hasta 10 participantes</li>
                  <li>• Compatible con móviles</li>
                  <li>• Sin límite de tiempo</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-[hsl(17,12%,6%)] mb-8">
            Experimenta la Tecnología de Dialoom
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-lg border border-[hsl(220,13%,90%)]">
              <div className="w-12 h-12 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-2">
                Video HD
              </h3>
              <p className="text-gray-600 text-sm">
                Calidad de video excepcional con tecnología Agora
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg border border-[hsl(220,13%,90%)]">
              <div className="w-12 h-12 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-2">
                Multiparticipante
              </h3>
              <p className="text-gray-600 text-sm">
                Conecta con múltiples personas simultáneamente
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg border border-[hsl(220,13%,90%)]">
              <div className="w-12 h-12 bg-[hsl(188,100%,95%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-6 h-6 text-[hsl(188,100%,38%)]" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(17,12%,6%)] mb-2">
                Fácil de Usar
              </h3>
              <p className="text-gray-600 text-sm">
                Interfaz intuitiva, sin configuraciones complejas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
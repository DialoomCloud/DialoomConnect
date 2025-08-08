import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Video, VideoOff, Settings, Loader2, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoCallLobbyProps {
  onJoinCall: () => void;
  onCancel: () => void;
  hostName: string;
  sessionDetails: {
    date: string;
    time: string;
    duration: number;
    callLanguage?: string;
  };
}

export function VideoCallLobby({ onJoinCall, onCancel, hostName, sessionDetails }: VideoCallLobbyProps) {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeDevices();
    return () => {
      // Cleanup stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeDevices = async () => {
    try {
      // Request permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');

      setCameras(videoDevices);
      setMicrophones(audioDevices);

      // Set default devices
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
      if (audioDevices.length > 0) {
        setSelectedMic(audioDevices[0].deviceId);
      }

      // Display video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara o micrófono. Por favor verifica los permisos.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const updateMediaStream = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: isCameraOn ? { deviceId: selectedCamera ? { exact: selectedCamera } : undefined } : false,
        audio: isMicOn ? { deviceId: selectedMic ? { exact: selectedMic } : undefined } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error updating media stream:', error);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      updateMediaStream();
    }
  }, [isCameraOn, isMicOn, selectedCamera, selectedMic]);

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full">
        <CardHeader>
          <CardTitle>Preparándote para la sesión con {hostName}</CardTitle>
          <p className="text-sm text-gray-600">
            {sessionDetails.date} a las {sessionDetails.time} • {sessionDetails.duration} minutos
          </p>
          {sessionDetails.callLanguage && (
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <Languages className="w-4 h-4" />
              {sessionDetails.callLanguage}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Video Preview */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`}
                    />
                    {!isCameraOn && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <VideoOff className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Media Controls */}
              <div className="flex justify-center space-x-4">
                <Button
                  variant={isCameraOn ? "default" : "secondary"}
                  size="lg"
                  onClick={toggleCamera}
                  disabled={isLoading}
                >
                  {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                <Button
                  variant={isMicOn ? "default" : "secondary"}
                  size="lg"
                  onClick={toggleMic}
                  disabled={isLoading}
                >
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowSettings(!showSettings)}
                  disabled={isLoading}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Settings and Info */}
            <div className="space-y-6">
              {showSettings ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Configuración de dispositivos</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cámara</label>
                    <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una cámara" />
                      </SelectTrigger>
                      <SelectContent>
                        {cameras.map((camera) => (
                          <SelectItem key={camera.deviceId} value={camera.deviceId}>
                            {camera.label || `Cámara ${camera.deviceId.slice(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Micrófono</label>
                    <Select value={selectedMic} onValueChange={setSelectedMic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un micrófono" />
                      </SelectTrigger>
                      <SelectContent>
                        {microphones.map((mic) => (
                          <SelectItem key={mic.deviceId} value={mic.deviceId}>
                            {mic.label || `Micrófono ${mic.deviceId.slice(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold">Antes de unirte</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Asegúrate de estar en un lugar tranquilo</li>
                    <li>• Verifica que tu cámara y micrófono funcionen correctamente</li>
                    <li>• Ten preparadas tus preguntas o temas a tratar</li>
                    <li>• Mantén una conexión a internet estable</li>
                  </ul>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Consejo:</strong> Para una mejor experiencia, utiliza auriculares 
                      para evitar eco y ruido de fondo.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button 
                  onClick={onJoinCall} 
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  Unirse a la sesión
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  AgoraRTCProvider,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack
} from "agora-rtc-react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  PhoneOff,
  Monitor,
  MonitorOff,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoCallProps {
  appId: string;
  channelName: string;
  token: string;
  userId: string;
  onEndCall: () => void;
}

function VideoCallContent({ appId, channelName, token, userId, onEndCall }: VideoCallProps) {
  const { localCameraTrack } = useLocalCameraTrack();
  const { localMicrophoneTrack } = useLocalMicrophoneTrack();
  const remoteUsers = useRemoteUsers();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const { toast } = useToast();

  usePublish([localCameraTrack, localMicrophoneTrack]);
  useJoin({ appid: appId, channel: channelName, token, uid: userId });

  const toggleMute = () => {
    if (localMicrophoneTrack) {
      localMicrophoneTrack.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localCameraTrack) {
      localCameraTrack.setEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack({});
        await localCameraTrack?.setEnabled(false);
        setIsScreenSharing(true);
        toast({
          title: "Compartiendo pantalla",
          description: "Tu pantalla está siendo compartida",
        });
      } else {
        // Stop screen sharing
        await localCameraTrack?.setEnabled(true);
        setIsScreenSharing(false);
        toast({
          title: "Pantalla compartida detenida",
          description: "Ya no estás compartiendo tu pantalla",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo compartir la pantalla",
        variant: "destructive",
      });
    }
  };

  const isLoading = !localCameraTrack || !localMicrophoneTrack;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[hsl(188,100%,38%)] mx-auto mb-4" />
          <p className="text-white">Cargando cámara y micrófono...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Local Video */}
          <Card className="bg-black border-gray-800 overflow-hidden">
            <CardContent className="p-0 h-full relative">
              <LocalVideoTrack 
                track={localCameraTrack} 
                play={!isVideoOff}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg">
                Tú {isMuted && <MicOff className="inline-block w-4 h-4 ml-2" />}
              </div>
            </CardContent>
          </Card>

          {/* Remote Users */}
          {remoteUsers.map((user) => (
            <Card key={user.uid} className="bg-black border-gray-800 overflow-hidden">
              <CardContent className="p-0 h-full relative">
                <RemoteUser 
                  user={user}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg">
                  Usuario {user.uid}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex justify-center items-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "default"}
            size="lg"
            onClick={toggleMute}
            className="rounded-full w-14 h-14"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            variant={isVideoOff ? "destructive" : "default"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-14 h-14"
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full w-14 h-14"
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="rounded-full w-16 h-14 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function VideoCall({ appId, channelName, token, userId, onEndCall }: VideoCallProps) {
  const client = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  );

  return (
    <AgoraRTCProvider client={client}>
      <VideoCallContent 
        appId={appId}
        channelName={channelName}
        token={token}
        userId={userId}
        onEndCall={onEndCall}
      />
    </AgoraRTCProvider>
  );
}
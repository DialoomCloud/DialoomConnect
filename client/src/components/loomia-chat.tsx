import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Minimize2, Maximize2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
}

interface LoomiaResponse {
  response: string;
  intent: {
    intent: string;
    confidence: number;
    suggestedActions?: string[];
  };
  suggestions?: {
    categories: Array<{
      name: string;
      description: string;
      subcategories?: string[];
    }>;
    skills: Array<{
      name: string;
      category: string;
      description: string;
    }>;
  };
}

export function LoomiaChat() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! Soy Loomia, tu asistente de IA para Dialoom. ¿En qué puedo ayudarte hoy?\n\n• Puedo sugerir categorías y skills para tu perfil profesional\n• Ayudarte con reservas y pagos\n• Guiarte en la configuración de precios y disponibilidad\n• Resolver dudas sobre videollamadas\n• Y cualquier otra consulta sobre la plataforma",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/loomia/chat", {
        message,
        userRole: user?.role || "guest",
        conversationHistory: messages.slice(-6) // Last 6 messages for context
      });
      return response.json() as Promise<LoomiaResponse>;
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        intent: data.intent.intent,
        confidence: data.intent.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show suggested actions if available
      if (data.intent.suggestedActions && data.intent.suggestedActions.length > 0) {
        toast({
          title: "Acciones sugeridas",
          description: data.intent.suggestedActions.join(", "),
          duration: 5000,
        });
      }

      // Show notification if AI suggestions were generated
      if (data.suggestions) {
        toast({
          title: "Sugerencias de IA generadas",
          description: `Se han generado ${data.suggestions.categories.length} categorías y ${data.suggestions.skills.length} skills sugeridas.`,
          duration: 7000,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case "booking": return "bg-blue-100 text-blue-800";
      case "profile_setup": return "bg-green-100 text-green-800";
      case "technical_help": return "bg-red-100 text-red-800";
      case "general_info": return "bg-gray-100 text-gray-800";
      case "support": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 z-50 shadow-xl border-2 border-[hsl(188,100%,38%)] ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    } transition-all duration-300`}>
      <CardHeader className="p-4 bg-[hsl(188,100%,38%)] text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold">Loomia</CardTitle>
            <Badge variant="secondary" className="text-xs bg-white/20 hover:bg-white/30">
              IA Assistant
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(100%-64px)]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className={`rounded-full p-2 ${
                    message.role === "user" 
                      ? "bg-[hsl(188,100%,38%)] text-white" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block p-3 rounded-lg max-w-[280px] ${
                      message.role === "user"
                        ? "bg-[hsl(188,100%,38%)] text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.intent && message.confidence && message.confidence > 0.7 && (
                      <div className="mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getIntentColor(message.intent)}`}
                        >
                          {message.intent} ({Math.round(message.confidence * 100)}%)
                        </Badge>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex items-start gap-3">
                  <div className="rounded-full p-2 bg-gray-100 text-gray-700">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-3 rounded-lg bg-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                        <span className="text-xs text-gray-500">Loomia está pensando...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Escribe tu mensaje..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Loomia puede cometer errores. Verifica información importante.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
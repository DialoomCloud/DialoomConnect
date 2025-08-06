import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Mail, User, MessageCircle, Phone, Building, CheckCircle, Loader2 } from "lucide-react";

interface RequestHostData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export default function RequestHost() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<RequestHostData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitRequestMutation = useMutation({
    mutationFn: async (data: RequestHostData) => {
      return await apiRequest("/api/request-host", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Solicitud enviada",
        description: "Hemos recibido tu solicitud. Te contactaremos pronto.",
      });
    },
    onError: (error: any) => {
      console.error("Error sending request:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof RequestHostData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa al menos el nombre, email y mensaje.",
        variant: "destructive",
      });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, ingresa un email válido.",
        variant: "destructive",
      });
      return;
    }

    submitRequestMutation.mutate(formData);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Solicitud Enviada!
              </h1>
              
              <p className="text-gray-600 mb-6">
                Gracias por tu interés en convertirte en host de Dialoom. Hemos recibido tu solicitud y nos pondremos en contacto contigo dentro de las próximas 24-48 horas.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Próximos pasos:</strong>
                  <br />
                  • Revisaremos tu solicitud
                  <br />
                  • Te contactaremos para una breve entrevista
                  <br />
                  • Te guiaremos en el proceso de configuración del perfil
                </p>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
              >
                Volver al Inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-[hsl(188,100%,38%)] text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="w-6 h-6" />
              Solicitar ser Host
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Te interesa compartir tu conocimiento?
              </h2>
              <p className="text-gray-600">
                Únete a nuestra comunidad de expertos y ayuda a otros a alcanzar sus objetivos. 
                Completa este formulario y nos pondremos en contacto contigo para comenzar el proceso.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono (opcional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      placeholder="+34 123 456 789"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa/Organización (opcional)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="pl-10"
                      placeholder="Tu empresa"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Cuéntanos sobre ti *
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="pl-10 min-h-[120px]"
                    placeholder="Describe tu experiencia, área de especialización, y por qué te gustaría ser host en Dialoom..."
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">¿Qué incluye ser host?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Configura tu propio horario y tarifas</li>
                  <li>• Comparte tu conocimiento con personas motivadas</li>
                  <li>• Gana ingresos adicionales desde casa</li>
                  <li>• Acceso a herramientas profesionales de videollamada</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={submitRequestMutation.isPending}
                className="w-full bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] text-white py-3"
              >
                {submitRequestMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando solicitud...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              Al enviar este formulario, aceptas que nos pongamos en contacto contigo sobre oportunidades de host.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
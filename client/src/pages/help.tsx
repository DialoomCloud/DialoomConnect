import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { HelpCircle, MessageCircle, Video, Calendar, CreditCard, UserCheck, Settings, Globe, Mail, Phone, Bot, Sparkles, Send, User } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Help() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("/api/contact", {
        method: "POST",
        body: data
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Mensaje enviado!",
        description: "Te responderemos pronto. Gracias por contactarnos.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-[hsl(188,100%,38%)] text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <HelpCircle className="w-6 h-6" />
              {t('help.title')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <p className="text-gray-600 mb-8">
              {t('help.subtitle')}
            </p>

            <Accordion type="single" collapsible className="space-y-4">
              {/* Getting Started Section */}
              <AccordionItem value="getting-started">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.gettingStarted')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.whatIsDialoom')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.whatIsDialoomAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.howToSignUp')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.howToSignUpAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* For Hosts Section */}
              <AccordionItem value="for-hosts">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.forHosts')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.setAvailability')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.setAvailabilityAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.setRates')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.setRatesAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.receivePayments')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.receivePaymentsAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* For Clients Section */}
              <AccordionItem value="for-clients">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.forClients')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.howToBook')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.howToBookAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.additionalServicesBooking')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.additionalServicesBookingAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Video Calls Section */}
              <AccordionItem value="video-calls">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.videoCalls')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.joinVideoCallDashboard')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.joinVideoCallDashboardAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.videoRequirementsUpdate')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.videoRequirementsUpdateAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Payments Section */}
              <AccordionItem value="payments">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.paymentsAndBilling')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.paymentMethodsUpdate')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.paymentMethodsUpdateAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.getInvoiceUpdate')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.getInvoiceUpdateAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Technical Issues Section */}
              <AccordionItem value="technical">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.technicalProblems')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.cannotAccessAccountUpdate')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.cannotAccessAccountUpdateAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.videoAudioProblemsUpdate')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.videoAudioProblemsUpdateAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Chat Support with Loomia */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Bot className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                Soporte Inteligente con Loomia
              </h3>
              
              <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-none shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-[hsl(188,100%,38%)] to-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-2">
                        🤖 Loomia está aquí para ayudarte
                      </h4>
                      <p className="text-gray-600 text-lg">
                        Tu asistente inteligente está disponible 24/7 para resolver todas tus dudas
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 bg-white/70 rounded-lg p-4">
                      <MessageCircle className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                      <span className="text-sm font-medium">Respuestas instantáneas</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/70 rounded-lg p-4">
                      <Settings className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                      <span className="text-sm font-medium">Soporte técnico avanzado</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/70 rounded-lg p-4">
                      <UserCheck className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                      <span className="text-sm font-medium">Ayuda personalizada</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-[hsl(188,100%,38%)] to-purple-600 hover:from-[hsl(188,100%,32%)] hover:to-purple-700 text-white px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      onClick={() => {
                        // Aquí iría la lógica para abrir el chat con Loomia
                        toast({
                          title: "🚀 Loomia se está activando...",
                          description: "El chat inteligente estará disponible muy pronto",
                        });
                      }}
                    >
                      <Bot className="w-5 h-5 mr-2" />
                      Iniciar Chat con Loomia
                      <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Resources */}
              <Card className="p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                  <h4 className="font-semibold text-lg">Recursos Adicionales</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/legal/terms" className="flex items-center gap-2 text-[hsl(188,100%,38%)] hover:underline p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span>📋</span>
                    Términos de Servicio
                  </Link>
                  <Link href="/legal/privacy" className="flex items-center gap-2 text-[hsl(188,100%,38%)] hover:underline p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span>🔒</span>
                    Política de Privacidad
                  </Link>
                </div>
              </Card>
              
              {/* Contact Form */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                  <h4 className="font-semibold text-lg">¿Prefieres contacto directo?</h4>
                </div>
                <p className="text-gray-600 mb-6">
                  Si necesitas soporte personalizado o tienes una consulta específica, envíanos un mensaje y te responderemos lo antes posible.
                </p>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    contactMutation.mutate(formData);
                  }}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="¿En qué podemos ayudarte?"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe tu consulta o problema..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={contactMutation.isPending}
                    className="w-full bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
                  >
                    {contactMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[hsl(188,100%,38%)] hover:underline">
            {t('help.returnHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
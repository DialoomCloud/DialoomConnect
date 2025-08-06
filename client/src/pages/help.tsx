import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { HelpCircle, MessageCircle, Video, Calendar, CreditCard, UserCheck, Settings, Globe, Mail, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  const { t, i18n } = useTranslation();

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
                      {i18n.language === 'es' ? 
                        'Busca el host que te interesa, ve a su perfil y haz clic en "Reservar Videollamada". Selecciona la fecha, hora y duración, y completa el pago.' : 
                       i18n.language === 'ca' ? 
                        'Busca el host que t\'interessa, ves al seu perfil i fes clic a "Reservar Videotrucada". Selecciona la data, hora i durada, i completa el pagament.' : 
                        'Find the host you\'re interested in, go to their profile and click "Book Video Call". Select the date, time and duration, and complete the payment.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {i18n.language === 'es' ? '¿Qué servicios adicionales puedo contratar?' : 
                       i18n.language === 'ca' ? 'Quins serveis addicionals puc contractar?' : 
                       'What additional services can I purchase?'}
                    </h4>
                    <p className="text-gray-600">
                      {i18n.language === 'es' ? 
                        'Durante la reserva, puedes añadir: compartir pantalla (€10), traducción simultánea (€25), grabación (€10) y transcripción automática (€5).' : 
                       i18n.language === 'ca' ? 
                        'Durant la reserva, pots afegir: compartir pantalla (€10), traducció simultània (€25), gravació (€10) i transcripció automàtica (€5).' : 
                        'During booking, you can add: screen sharing (€10), simultaneous translation (€25), recording (€10) and automatic transcription (€5).'}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Video Calls Section */}
              <AccordionItem value="video-calls">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {i18n.language === 'es' ? 'Videollamadas' : 
                     i18n.language === 'ca' ? 'Videotrucades' : 
                     'Video Calls'}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {i18n.language === 'es' ? '¿Cómo me uno a una videollamada?' : 
                       i18n.language === 'ca' ? 'Com m\'uneixo a una videotrucada?' : 
                       'How do I join a video call?'}
                    </h4>
                    <p className="text-gray-600">
                      {i18n.language === 'es' ? 
                        'Ve a tu dashboard y encontrarás un botón "Unirse a Llamada" en cada reserva confirmada. Haz clic en él a la hora programada para entrar a la videollamada.' : 
                       i18n.language === 'ca' ? 
                        'Ves al teu dashboard i trobaràs un botó "Unir-se a Trucada" a cada reserva confirmada. Fes clic en ell a l\'hora programada per entrar a la videotrucada.' : 
                        'Go to your dashboard and you\'ll find a "Join Call" button on each confirmed booking. Click it at the scheduled time to enter the video call.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {i18n.language === 'es' ? '¿Qué necesito para las videollamadas?' : 
                       i18n.language === 'ca' ? 'Què necessito per a les videotrucades?' : 
                       'What do I need for video calls?'}
                    </h4>
                    <p className="text-gray-600">
                      {i18n.language === 'es' ? 
                        'Necesitas una cámara web, micrófono y conexión a internet estable. Recomendamos usar Chrome, Firefox o Safari actualizados para la mejor experiencia.' : 
                       i18n.language === 'ca' ? 
                        'Necessites una càmera web, micròfon i connexió a internet estable. Recomanem utilitzar Chrome, Firefox o Safari actualitzats per a la millor experiència.' : 
                        'You need a webcam, microphone and stable internet connection. We recommend using updated Chrome, Firefox or Safari for the best experience.'}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Payments Section */}
              <AccordionItem value="payments">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {i18n.language === 'es' ? 'Pagos y Facturación' : 
                     i18n.language === 'ca' ? 'Pagaments i Facturació' : 
                     'Payments and Billing'}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {i18n.language === 'es' ? '¿Qué métodos de pago aceptan?' : 
                       i18n.language === 'ca' ? 'Quins mètodes de pagament accepten?' : 
                       'What payment methods do you accept?'}
                    </h4>
                    <p className="text-gray-600">
                      {i18n.language === 'es' ? 
                        'Aceptamos todas las tarjetas principales (Visa, MasterCard, American Express) a través de Stripe, que procesa los pagos de forma segura.' : 
                       i18n.language === 'ca' ? 
                        'Acceptem totes les targetes principals (Visa, MasterCard, American Express) a través de Stripe, que processa els pagaments de forma segura.' : 
                        'We accept all major cards (Visa, MasterCard, American Express) through Stripe, which processes payments securely.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {i18n.language === 'es' ? '¿Cómo obtengo mi factura?' : 
                       i18n.language === 'ca' ? 'Com obtinc la meva factura?' : 
                       'How do I get my invoice?'}
                    </h4>
                    <p className="text-gray-600">
                      {i18n.language === 'es' ? 
                        'Las facturas se generan automáticamente después de cada videollamada. Puedes descargarlas desde tu dashboard en la sección de "Facturación".' : 
                       i18n.language === 'ca' ? 
                        'Les factures es generen automàticament després de cada videotrucada. Pots descarregar-les des del teu dashboard a la secció de "Facturació".' : 
                        'Invoices are generated automatically after each video call. You can download them from your dashboard in the "Billing" section.'}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Technical Issues Section */}
              <AccordionItem value="technical">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {i18n.language === 'es' ? 'Problemas Técnicos' : 
                     i18n.language === 'ca' ? 'Problemes Tècnics' : 
                     'Technical Issues'}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {i18n.language === 'es' ? 'No puedo acceder a mi cuenta' : 
                       i18n.language === 'ca' ? 'No puc accedir al meu compte' : 
                       'I can\'t access my account'}
                    </h4>
                    <p className="text-gray-600">
                      {i18n.language === 'es' ? 
                        'Asegúrate de usar la misma cuenta de Replit con la que te registraste. Si el problema persiste, contacta a soporte.' : 
                       i18n.language === 'ca' ? 
                        'Assegura\'t d\'utilitzar el mateix compte de Replit amb el qual et vas registrar. Si el problema persisteix, contacta amb suport.' : 
                        'Make sure you\'re using the same Replit account you registered with. If the problem persists, contact support.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {i18n.language === 'es' ? 'Problemas con video o audio' : 
                       i18n.language === 'ca' ? 'Problemes amb vídeo o àudio' : 
                       'Video or audio problems'}
                    </h4>
                    <p className="text-gray-600">
                      {i18n.language === 'es' ? 
                        'Verifica que tu navegador tenga permisos para usar cámara y micrófono. Prueba cerrar otras aplicaciones que puedan estar usando estos dispositivos.' : 
                       i18n.language === 'ca' ? 
                        'Verifica que el teu navegador tingui permisos per utilitzar càmera i micròfon. Prova tancar altres aplicacions que puguin estar utilitzant aquests dispositius.' : 
                        'Verify that your browser has permissions to use camera and microphone. Try closing other applications that might be using these devices.'}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Contact Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '¿Necesitas más ayuda?' : 
                 i18n.language === 'ca' ? 'Necessites més ajuda?' : 
                 'Need more help?'}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    <h4 className="font-semibold">
                      {i18n.language === 'es' ? 'Soporte por Email' : 
                       i18n.language === 'ca' ? 'Suport per Email' : 
                       'Email Support'}
                    </h4>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {i18n.language === 'es' ? 
                      'Envíanos tus preguntas y te responderemos en 24-48 horas.' : 
                     i18n.language === 'ca' ? 
                      'Envia\'ns les teves preguntes i et respondrem en 24-48 hores.' : 
                      'Send us your questions and we\'ll respond within 24-48 hours.'}
                  </p>
                  <a href="mailto:support@dialoom.cloud" className="text-[hsl(188,100%,38%)] hover:underline">
                    support@dialoom.cloud
                  </a>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    <h4 className="font-semibold">
                      {i18n.language === 'es' ? 'Recursos Adicionales' : 
                       i18n.language === 'ca' ? 'Recursos Addicionals' : 
                       'Additional Resources'}
                    </h4>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {i18n.language === 'es' ? 
                      'Consulta nuestros términos de servicio y políticas para más información.' : 
                     i18n.language === 'ca' ? 
                      'Consulta els nostres termes de servei i polítiques per a més informació.' : 
                      'Check our terms of service and policies for more information.'}
                  </p>
                  <div className="space-y-1">
                    <Link href="/legal/terms" className="text-[hsl(188,100%,38%)] hover:underline block">
                      {i18n.language === 'es' ? 'Términos de Servicio' : 
                       i18n.language === 'ca' ? 'Termes de Servei' : 
                       'Terms of Service'}
                    </Link>
                    <Link href="/legal/privacy" className="text-[hsl(188,100%,38%)] hover:underline block">
                      {i18n.language === 'es' ? 'Política de Privacidad' : 
                       i18n.language === 'ca' ? 'Política de Privadesa' : 
                       'Privacy Policy'}
                    </Link>
                  </div>
                </Card>
              </div>
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
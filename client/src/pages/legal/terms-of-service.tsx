import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { FileText, Scale, Users, CreditCard, Ban, Shield, AlertCircle, Globe } from "lucide-react";

export default function TermsOfService() {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-[hsl(188,100%,38%)] text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6" />
              {i18n.language === 'es' ? 'Términos de Servicio' : 
               i18n.language === 'ca' ? 'Termes de Servei' : 'Terms of Service'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="prose prose-gray max-w-none p-8">
            <p className="text-gray-600 mb-6">
              {i18n.language === 'es' ? 'Última actualización: 31 de julio de 2025' : 
               i18n.language === 'ca' ? 'Última actualització: 31 de juliol de 2025' : 
               'Last updated: July 31, 2025'}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '1. Aceptación de Términos' : 
                 i18n.language === 'ca' ? '1. Acceptació de Termes' : 
                 '1. Acceptance of Terms'}
              </h2>
              <p>
                {i18n.language === 'es' ? 
                  'Al utilizar Dialoom, aceptas estos términos de servicio. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.' : 
                 i18n.language === 'ca' ? 
                  'En utilitzar Dialoom, acceptes aquests termes de servei. Si no estàs d\'acord amb alguna part d\'aquests termes, no has d\'utilitzar els nostres serveis.' : 
                  'By using Dialoom, you agree to these terms of service. If you do not agree with any part of these terms, you should not use our services.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '2. Descripción del Servicio' : 
                 i18n.language === 'ca' ? '2. Descripció del Servei' : 
                 '2. Service Description'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 
                  'Dialoom es una plataforma que conecta profesionales (hosts) con clientes para realizar videollamadas remuneradas. Nuestros servicios incluyen:' : 
                 i18n.language === 'ca' ? 
                  'Dialoom és una plataforma que connecta professionals (hosts) amb clients per realitzar videotrucades remunerades. Els nostres serveis inclouen:' : 
                  'Dialoom is a platform that connects professionals (hosts) with clients for paid video calls. Our services include:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{i18n.language === 'es' ? 'Sistema de reservas y calendario' : 
                     i18n.language === 'ca' ? 'Sistema de reserves i calendari' : 
                     'Booking and calendar system'}</li>
                <li>{i18n.language === 'es' ? 'Videollamadas con tecnología Agora' : 
                     i18n.language === 'ca' ? 'Videotrucades amb tecnologia Agora' : 
                     'Video calls powered by Agora'}</li>
                <li>{i18n.language === 'es' ? 'Procesamiento de pagos con Stripe' : 
                     i18n.language === 'ca' ? 'Processament de pagaments amb Stripe' : 
                     'Payment processing with Stripe'}</li>
                <li>{i18n.language === 'es' ? 'Emisión de facturas' : 
                     i18n.language === 'ca' ? 'Emissió de factures' : 
                     'Invoice generation'}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '3. Pagos y Comisiones' : 
                 i18n.language === 'ca' ? '3. Pagaments i Comissions' : 
                 '3. Payments and Fees'}
              </h2>
              <div className="space-y-4">
                <p>
                  {i18n.language === 'es' ? 
                    'Los hosts establecen sus propias tarifas. Dialoom cobra una comisión del 10% + IVA sobre cada transacción.' : 
                   i18n.language === 'ca' ? 
                    'Els hosts estableixen les seves pròpies tarifes. Dialoom cobra una comissió del 10% + IVA sobre cada transacció.' : 
                    'Hosts set their own rates. Dialoom charges a 10% commission + VAT on each transaction.'}
                </p>
                <p>
                  {i18n.language === 'es' ? 
                    'Los servicios adicionales (compartir pantalla, traducción, grabación, transcripción) tienen tarifas separadas que se suman al precio de la videollamada.' : 
                   i18n.language === 'ca' ? 
                    'Els serveis addicionals (compartir pantalla, traducció, gravació, transcripció) tenen tarifes separades que se sumen al preu de la videotrucada.' : 
                    'Additional services (screen sharing, translation, recording, transcription) have separate fees that are added to the video call price.'}
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '4. Responsabilidades del Usuario' : 
                 i18n.language === 'ca' ? '4. Responsabilitats de l\'Usuari' : 
                 '4. User Responsibilities'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 'Los usuarios se comprometen a:' : 
                 i18n.language === 'ca' ? 'Els usuaris es comprometen a:' : 
                 'Users agree to:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{i18n.language === 'es' ? 'Proporcionar información veraz y actualizada' : 
                     i18n.language === 'ca' ? 'Proporcionar informació veraç i actualitzada' : 
                     'Provide truthful and up-to-date information'}</li>
                <li>{i18n.language === 'es' ? 'No utilizar el servicio para actividades ilegales' : 
                     i18n.language === 'ca' ? 'No utilitzar el servei per a activitats il·legals' : 
                     'Not use the service for illegal activities'}</li>
                <li>{i18n.language === 'es' ? 'Respetar los derechos de propiedad intelectual' : 
                     i18n.language === 'ca' ? 'Respectar els drets de propietat intel·lectual' : 
                     'Respect intellectual property rights'}</li>
                <li>{i18n.language === 'es' ? 'Mantener la confidencialidad de las credenciales' : 
                     i18n.language === 'ca' ? 'Mantenir la confidencialitat de les credencials' : 
                     'Maintain the confidentiality of credentials'}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Ban className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '5. Usos Prohibidos' : 
                 i18n.language === 'ca' ? '5. Usos Prohibits' : 
                 '5. Prohibited Uses'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 'Está prohibido:' : 
                 i18n.language === 'ca' ? 'Està prohibit:' : 
                 'It is prohibited to:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{i18n.language === 'es' ? 'Compartir contenido ilegal o inapropiado' : 
                     i18n.language === 'ca' ? 'Compartir contingut il·legal o inadequat' : 
                     'Share illegal or inappropriate content'}</li>
                <li>{i18n.language === 'es' ? 'Acosar o amenazar a otros usuarios' : 
                     i18n.language === 'ca' ? 'Assetjar o amenaçar altres usuaris' : 
                     'Harass or threaten other users'}</li>
                <li>{i18n.language === 'es' ? 'Intentar acceder sin autorización a otros sistemas' : 
                     i18n.language === 'ca' ? 'Intentar accedir sense autorització a altres sistemes' : 
                     'Attempt unauthorized access to other systems'}</li>
                <li>{i18n.language === 'es' ? 'Usar bots o scripts automatizados sin permiso' : 
                     i18n.language === 'ca' ? 'Utilitzar bots o scripts automatitzats sense permís' : 
                     'Use bots or automated scripts without permission'}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '6. Limitación de Responsabilidad' : 
                 i18n.language === 'ca' ? '6. Limitació de Responsabilitat' : 
                 '6. Limitation of Liability'}
              </h2>
              <p>
                {i18n.language === 'es' ? 
                  'Dialoom actúa como intermediario entre hosts y clientes. No somos responsables del contenido o la calidad de las videollamadas. Los hosts son profesionales independientes y no empleados de Dialoom.' : 
                 i18n.language === 'ca' ? 
                  'Dialoom actua com a intermediari entre hosts i clients. No som responsables del contingut o la qualitat de les videotrucades. Els hosts són professionals independents i no empleats de Dialoom.' : 
                  'Dialoom acts as an intermediary between hosts and clients. We are not responsible for the content or quality of video calls. Hosts are independent professionals and not employees of Dialoom.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '7. Ley Aplicable' : 
                 i18n.language === 'ca' ? '7. Llei Aplicable' : 
                 '7. Governing Law'}
              </h2>
              <p>
                {i18n.language === 'es' ? 
                  'Estos términos se rigen por las leyes de España. Cualquier disputa se resolverá en los tribunales de Barcelona.' : 
                 i18n.language === 'ca' ? 
                  'Aquests termes es regeixen per les lleis d\'Espanya. Qualsevol disputa es resoldrà als tribunals de Barcelona.' : 
                  'These terms are governed by the laws of Spain. Any disputes will be resolved in the courts of Barcelona.'}
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                {i18n.language === 'es' ? 
                  'Al registrarte y usar Dialoom, confirmas que has leído y aceptado estos términos de servicio.' : 
                 i18n.language === 'ca' ? 
                  'En registrar-te i utilitzar Dialoom, confirmes que has llegit i acceptat aquests termes de servei.' : 
                  'By registering and using Dialoom, you confirm that you have read and accepted these terms of service.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[hsl(188,100%,38%)] hover:underline">
            {i18n.language === 'es' ? '← Volver al inicio' : 
             i18n.language === 'ca' ? '← Tornar a l\'inici' : 
             '← Back to home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
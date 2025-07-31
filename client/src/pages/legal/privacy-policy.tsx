import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Shield, Lock, Eye, Users, Globe, Mail, Clock, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-[hsl(188,100%,38%)] text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="w-6 h-6" />
              {i18n.language === 'es' ? 'Política de Privacidad' : 
               i18n.language === 'ca' ? 'Política de Privadesa' : 'Privacy Policy'}
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
                <Eye className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '1. Información que Recopilamos' : 
                 i18n.language === 'ca' ? '1. Informació que Recopilem' : 
                 '1. Information We Collect'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 
                  'En Dialoom, recopilamos información para proporcionar y mejorar nuestros servicios de videollamadas profesionales:' : 
                 i18n.language === 'ca' ? 
                  'A Dialoom, recopilem informació per proporcionar i millorar els nostres serveis de videotrucades professionals:' : 
                  'At Dialoom, we collect information to provide and improve our professional video calling services:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{i18n.language === 'es' ? 'Información de perfil (nombre, email, foto)' : 
                     i18n.language === 'ca' ? 'Informació de perfil (nom, email, foto)' : 
                     'Profile information (name, email, photo)'}</li>
                <li>{i18n.language === 'es' ? 'Datos de contacto profesionales' : 
                     i18n.language === 'ca' ? 'Dades de contacte professionals' : 
                     'Professional contact details'}</li>
                <li>{i18n.language === 'es' ? 'Contenido multimedia compartido' : 
                     i18n.language === 'ca' ? 'Contingut multimèdia compartit' : 
                     'Shared multimedia content'}</li>
                <li>{i18n.language === 'es' ? 'Información de facturación y pagos' : 
                     i18n.language === 'ca' ? 'Informació de facturació i pagaments' : 
                     'Billing and payment information'}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '2. Cómo Usamos tu Información' : 
                 i18n.language === 'ca' ? '2. Com Utilitzem la teva Informació' : 
                 '2. How We Use Your Information'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 'Utilizamos tu información para:' : 
                 i18n.language === 'ca' ? 'Utilitzem la teva informació per:' : 
                 'We use your information to:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{i18n.language === 'es' ? 'Facilitar videollamadas entre hosts y clientes' : 
                     i18n.language === 'ca' ? 'Facilitar videotrucades entre hosts i clients' : 
                     'Facilitate video calls between hosts and clients'}</li>
                <li>{i18n.language === 'es' ? 'Procesar pagos y emitir facturas' : 
                     i18n.language === 'ca' ? 'Processar pagaments i emetre factures' : 
                     'Process payments and issue invoices'}</li>
                <li>{i18n.language === 'es' ? 'Mejorar nuestros servicios' : 
                     i18n.language === 'ca' ? 'Millorar els nostres serveis' : 
                     'Improve our services'}</li>
                <li>{i18n.language === 'es' ? 'Cumplir con obligaciones legales' : 
                     i18n.language === 'ca' ? 'Complir amb obligacions legals' : 
                     'Comply with legal obligations'}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '3. Compartir Información' : 
                 i18n.language === 'ca' ? '3. Compartir Informació' : 
                 '3. Sharing Information'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 
                  'Solo compartimos tu información cuando es necesario para proporcionar nuestros servicios o cuando la ley lo requiere. Nunca vendemos datos personales a terceros.' : 
                 i18n.language === 'ca' ? 
                  'Només compartim la teva informació quan és necessari per proporcionar els nostres serveis o quan la llei ho requereix. Mai venem dades personals a tercers.' : 
                  'We only share your information when necessary to provide our services or when required by law. We never sell personal data to third parties.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '4. Derechos GDPR' : 
                 i18n.language === 'ca' ? '4. Drets GDPR' : 
                 '4. GDPR Rights'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 
                  'Si eres residente de la UE, tienes derecho a:' : 
                 i18n.language === 'ca' ? 
                  'Si ets resident de la UE, tens dret a:' : 
                  'If you are an EU resident, you have the right to:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{i18n.language === 'es' ? 'Acceder a tus datos personales' : 
                     i18n.language === 'ca' ? 'Accedir a les teves dades personals' : 
                     'Access your personal data'}</li>
                <li>{i18n.language === 'es' ? 'Rectificar información incorrecta' : 
                     i18n.language === 'ca' ? 'Rectificar informació incorrecta' : 
                     'Rectify incorrect information'}</li>
                <li>{i18n.language === 'es' ? 'Solicitar la eliminación de tus datos' : 
                     i18n.language === 'ca' ? 'Sol·licitar l\'eliminació de les teves dades' : 
                     'Request deletion of your data'}</li>
                <li>{i18n.language === 'es' ? 'Exportar tus datos' : 
                     i18n.language === 'ca' ? 'Exportar les teves dades' : 
                     'Export your data'}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '5. Retención de Datos' : 
                 i18n.language === 'ca' ? '5. Retenció de Dades' : 
                 '5. Data Retention'}
              </h2>
              <p>
                {i18n.language === 'es' ? 
                  'Conservamos tu información personal solo durante el tiempo necesario para proporcionar nuestros servicios y cumplir con las obligaciones legales. Los datos de facturación se conservan según los requisitos fiscales aplicables.' : 
                 i18n.language === 'ca' ? 
                  'Conservem la teva informació personal només durant el temps necessari per proporcionar els nostres serveis i complir amb les obligacions legals. Les dades de facturació es conserven segons els requisits fiscals aplicables.' : 
                  'We retain your personal information only for as long as necessary to provide our services and comply with legal obligations. Billing data is retained according to applicable tax requirements.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '6. Contacto' : 
                 i18n.language === 'ca' ? '6. Contacte' : 
                 '6. Contact'}
              </h2>
              <p>
                {i18n.language === 'es' ? 
                  'Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tus datos, contáctanos en:' : 
                 i18n.language === 'ca' ? 
                  'Si tens preguntes sobre aquesta política de privadesa o sobre com gestionem les teves dades, contacta\'ns a:' : 
                  'If you have questions about this privacy policy or how we handle your data, contact us at:'}
              </p>
              <p className="mt-2">
                <a href="mailto:privacy@dialoom.cloud" className="text-[hsl(188,100%,38%)] hover:underline">
                  privacy@dialoom.cloud
                </a>
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                {i18n.language === 'es' ? 
                  'Al usar Dialoom, aceptas esta política de privacidad.' : 
                 i18n.language === 'ca' ? 
                  'En utilitzar Dialoom, acceptes aquesta política de privadesa.' : 
                  'By using Dialoom, you agree to this privacy policy.'}
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
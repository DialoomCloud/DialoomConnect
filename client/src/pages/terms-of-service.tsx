import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale, Ban, Euro, AlertTriangle } from "lucide-react";

export default function TermsOfService() {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-8">
          {i18n.language === 'es' 
            ? 'Términos de Servicio'
            : i18n.language === 'ca'
            ? 'Termes de Servei'
            : 'Terms of Service'}
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Aceptación de Términos'
                : i18n.language === 'ca'
                ? 'Acceptació de Termes'
                : 'Acceptance of Terms'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {i18n.language === 'es' 
                ? 'Al utilizar Dialoom, aceptas estos términos de servicio. Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestros servicios.'
                : i18n.language === 'ca'
                ? 'En utilitzar Dialoom, acceptes aquests termes de servei. Si no estàs d\'acord amb algun d\'aquests termes, no has d\'utilitzar els nostres serveis.'
                : 'By using Dialoom, you accept these terms of service. If you do not agree with any of these terms, you should not use our services.'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {i18n.language === 'es' 
                ? 'Fecha de entrada en vigor: 1 de enero de 2025'
                : i18n.language === 'ca'
                ? 'Data d\'entrada en vigor: 1 de gener de 2025'
                : 'Effective date: January 1, 2025'}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Uso del Servicio'
                : i18n.language === 'ca'
                ? 'Ús del Servei'
                : 'Use of Service'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">
              {i18n.language === 'es' ? 'Permitido:' : i18n.language === 'ca' ? 'Permès:' : 'Allowed:'}
            </h3>
            <ul className="space-y-2 mb-4">
              <li className="text-sm">✓ {i18n.language === 'es' ? 'Uso profesional para videollamadas y consultas' : i18n.language === 'ca' ? 'Ús professional per a videotrucades i consultes' : 'Professional use for video calls and consultations'}</li>
              <li className="text-sm">✓ {i18n.language === 'es' ? 'Compartir contenido multimedia propio' : i18n.language === 'ca' ? 'Compartir contingut multimèdia propi' : 'Sharing your own multimedia content'}</li>
              <li className="text-sm">✓ {i18n.language === 'es' ? 'Ofrecer servicios legales y éticos' : i18n.language === 'ca' ? 'Oferir serveis legals i ètics' : 'Offering legal and ethical services'}</li>
            </ul>
            
            <h3 className="font-semibold mb-2">
              {i18n.language === 'es' ? 'Prohibido:' : i18n.language === 'ca' ? 'Prohibit:' : 'Prohibited:'}
            </h3>
            <ul className="space-y-2">
              <li className="text-sm">✗ {i18n.language === 'es' ? 'Contenido ilegal o inapropiado' : i18n.language === 'ca' ? 'Contingut il·legal o inapropiat' : 'Illegal or inappropriate content'}</li>
              <li className="text-sm">✗ {i18n.language === 'es' ? 'Spam o actividades fraudulentas' : i18n.language === 'ca' ? 'Spam o activitats fraudulentes' : 'Spam or fraudulent activities'}</li>
              <li className="text-sm">✗ {i18n.language === 'es' ? 'Violar derechos de propiedad intelectual' : i18n.language === 'ca' ? 'Violar drets de propietat intel·lectual' : 'Violating intellectual property rights'}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Pagos y Facturación'
                : i18n.language === 'ca'
                ? 'Pagaments i Facturació'
                : 'Payments and Billing'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="text-sm">
                <strong>{i18n.language === 'es' ? 'Comisión:' : i18n.language === 'ca' ? 'Comissió:' : 'Commission:'}</strong> 
                {i18n.language === 'es' 
                  ? ' Dialoom cobra una comisión del 10% + IVA sobre cada transacción'
                  : i18n.language === 'ca'
                  ? ' Dialoom cobra una comissió del 10% + IVA sobre cada transacció'
                  : ' Dialoom charges a 10% + VAT commission on each transaction'}
              </li>
              <li className="text-sm">
                <strong>{i18n.language === 'es' ? 'Procesamiento:' : i18n.language === 'ca' ? 'Processament:' : 'Processing:'}</strong> 
                {i18n.language === 'es' 
                  ? ' Los pagos se procesan de forma segura a través de Stripe'
                  : i18n.language === 'ca'
                  ? ' Els pagaments es processen de forma segura a través de Stripe'
                  : ' Payments are securely processed through Stripe'}
              </li>
              <li className="text-sm">
                <strong>{i18n.language === 'es' ? 'Reembolsos:' : i18n.language === 'ca' ? 'Reemborsaments:' : 'Refunds:'}</strong> 
                {i18n.language === 'es' 
                  ? ' Sujetos a nuestra política de cancelación'
                  : i18n.language === 'ca'
                  ? ' Subjectes a la nostra política de cancel·lació'
                  : ' Subject to our cancellation policy'}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Limitación de Responsabilidad'
                : i18n.language === 'ca'
                ? 'Limitació de Responsabilitat'
                : 'Limitation of Liability'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {i18n.language === 'es' 
                ? 'Dialoom proporciona la plataforma pero no es responsable del contenido o servicios ofrecidos por los usuarios. Los usuarios son responsables de cumplir con las leyes aplicables en su jurisdicción.'
                : i18n.language === 'ca'
                ? 'Dialoom proporciona la plataforma però no és responsable del contingut o serveis oferts pels usuaris. Els usuaris són responsables de complir amb les lleis aplicables a la seva jurisdicció.'
                : 'Dialoom provides the platform but is not responsible for the content or services offered by users. Users are responsible for complying with applicable laws in their jurisdiction.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Modificaciones'
                : i18n.language === 'ca'
                ? 'Modificacions'
                : 'Modifications'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {i18n.language === 'es' 
                ? 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos al publicarse en esta página. Es tu responsabilidad revisar estos términos periódicamente.'
                : i18n.language === 'ca'
                ? 'Ens reservem el dret de modificar aquests termes en qualsevol moment. Els canvis seran efectius en publicar-se en aquesta pàgina. És la teva responsabilitat revisar aquests termes periòdicament.'
                : 'We reserve the right to modify these terms at any time. Changes will be effective upon posting on this page. It is your responsibility to review these terms periodically.'}
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">
                {i18n.language === 'es' 
                  ? 'Para consultas legales: legal@dialoom.com'
                  : i18n.language === 'ca'
                  ? 'Per a consultes legals: legal@dialoom.com'
                  : 'For legal inquiries: legal@dialoom.com'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
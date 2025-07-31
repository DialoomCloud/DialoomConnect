import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Copyright, AlertTriangle, FileText, Mail, Send, Shield, Gavel, ExternalLink } from "lucide-react";

export default function DMCA() {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-[hsl(188,100%,38%)] text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Copyright className="w-6 h-6" />
              {i18n.language === 'es' ? 'Política DMCA' : 
               i18n.language === 'ca' ? 'Política DMCA' : 'DMCA Policy'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="prose prose-gray max-w-none p-8">
            <p className="text-gray-600 mb-6">
              {i18n.language === 'es' ? 'Digital Millennium Copyright Act - Aviso y Procedimiento' : 
               i18n.language === 'ca' ? 'Digital Millennium Copyright Act - Avís i Procediment' : 
               'Digital Millennium Copyright Act - Notice and Procedure'}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '1. Nuestro Compromiso' : 
                 i18n.language === 'ca' ? '1. El Nostre Compromís' : 
                 '1. Our Commitment'}
              </h2>
              <p>
                {i18n.language === 'es' ? 
                  'Dialoom respeta los derechos de propiedad intelectual de otros y esperamos que nuestros usuarios hagan lo mismo. En cumplimiento con la Digital Millennium Copyright Act (DMCA), respondemos rápidamente a las notificaciones de presunta infracción de derechos de autor.' : 
                 i18n.language === 'ca' ? 
                  'Dialoom respecta els drets de propietat intel·lectual d\'altres i esperem que els nostres usuaris facin el mateix. En compliment amb la Digital Millennium Copyright Act (DMCA), responem ràpidament a les notificacions de presumpta infracció de drets d\'autor.' : 
                  'Dialoom respects the intellectual property rights of others and expects our users to do the same. In compliance with the Digital Millennium Copyright Act (DMCA), we respond promptly to notices of alleged copyright infringement.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '2. Notificación de Infracción' : 
                 i18n.language === 'ca' ? '2. Notificació d\'Infracció' : 
                 '2. Infringement Notification'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 
                  'Si crees que tu trabajo protegido por derechos de autor ha sido copiado de una manera que constituye una infracción, proporciona la siguiente información:' : 
                 i18n.language === 'ca' ? 
                  'Si creus que el teu treball protegit per drets d\'autor ha estat copiat d\'una manera que constitueix una infracció, proporciona la següent informació:' : 
                  'If you believe your copyrighted work has been copied in a way that constitutes infringement, provide the following information:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{i18n.language === 'es' ? 'Identificación del trabajo con derechos de autor' : 
                     i18n.language === 'ca' ? 'Identificació del treball amb drets d\'autor' : 
                     'Identification of the copyrighted work'}</li>
                <li>{i18n.language === 'es' ? 'URL o ubicación del material infractor' : 
                     i18n.language === 'ca' ? 'URL o ubicació del material infractor' : 
                     'URL or location of the infringing material'}</li>
                <li>{i18n.language === 'es' ? 'Tu información de contacto completa' : 
                     i18n.language === 'ca' ? 'La teva informació de contacte completa' : 
                     'Your complete contact information'}</li>
                <li>{i18n.language === 'es' ? 'Declaración de buena fe' : 
                     i18n.language === 'ca' ? 'Declaració de bona fe' : 
                     'Good faith statement'}</li>
                <li>{i18n.language === 'es' ? 'Declaración de exactitud bajo pena de perjurio' : 
                     i18n.language === 'ca' ? 'Declaració d\'exactitud sota pena de perjuri' : 
                     'Statement of accuracy under penalty of perjury'}</li>
                <li>{i18n.language === 'es' ? 'Firma física o electrónica' : 
                     i18n.language === 'ca' ? 'Signatura física o electrònica' : 
                     'Physical or electronic signature'}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '3. Proceso de Contranotificación' : 
                 i18n.language === 'ca' ? '3. Procés de Contranotificació' : 
                 '3. Counter-notification Process'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 
                  'Si crees que tu contenido fue eliminado por error, puedes enviar una contranotificación con:' : 
                 i18n.language === 'ca' ? 
                  'Si creus que el teu contingut va ser eliminat per error, pots enviar una contranotificació amb:' : 
                  'If you believe your content was removed by mistake, you can submit a counter-notification with:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{i18n.language === 'es' ? 'Identificación del material eliminado' : 
                     i18n.language === 'ca' ? 'Identificació del material eliminat' : 
                     'Identification of the removed material'}</li>
                <li>{i18n.language === 'es' ? 'Declaración bajo pena de perjurio' : 
                     i18n.language === 'ca' ? 'Declaració sota pena de perjuri' : 
                     'Statement under penalty of perjury'}</li>
                <li>{i18n.language === 'es' ? 'Consentimiento a la jurisdicción' : 
                     i18n.language === 'ca' ? 'Consentiment a la jurisdicció' : 
                     'Consent to jurisdiction'}</li>
                <li>{i18n.language === 'es' ? 'Tu firma' : 
                     i18n.language === 'ca' ? 'La teva signatura' : 
                     'Your signature'}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '4. Política de Infractores Reincidentes' : 
                 i18n.language === 'ca' ? '4. Política d\'Infractors Reincidents' : 
                 '4. Repeat Infringer Policy'}
              </h2>
              <p>
                {i18n.language === 'es' ? 
                  'Dialoom puede, en circunstancias apropiadas y a su discreción, desactivar o terminar las cuentas de usuarios que infrinjan repetidamente los derechos de autor de otros.' : 
                 i18n.language === 'ca' ? 
                  'Dialoom pot, en circumstàncies apropiades i a la seva discreció, desactivar o terminar els comptes d\'usuaris que infringeixin repetidament els drets d\'autor d\'altres.' : 
                  'Dialoom may, in appropriate circumstances and at its discretion, disable or terminate accounts of users who repeatedly infringe the copyrights of others.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '5. Agente Designado DMCA' : 
                 i18n.language === 'ca' ? '5. Agent Designat DMCA' : 
                 '5. Designated DMCA Agent'}
              </h2>
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="mb-4">
                  {i18n.language === 'es' ? 
                    'Todas las notificaciones DMCA deben enviarse a nuestro agente designado:' : 
                   i18n.language === 'ca' ? 
                    'Totes les notificacions DMCA s\'han d\'enviar al nostre agent designat:' : 
                    'All DMCA notices should be sent to our designated agent:'}
                </p>
                <div className="space-y-2">
                  <p><strong>Dialoom DMCA Agent</strong></p>
                  <p>Email: <a href="mailto:dmca@dialoom.cloud" className="text-[hsl(188,100%,38%)] hover:underline">dmca@dialoom.cloud</a></p>
                  <p>{i18n.language === 'es' ? 'Asunto: Notificación DMCA' : 
                      i18n.language === 'ca' ? 'Assumpte: Notificació DMCA' : 
                      'Subject: DMCA Notice'}</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '6. Información Adicional' : 
                 i18n.language === 'ca' ? '6. Informació Addicional' : 
                 '6. Additional Information'}
              </h2>
              <p>
                {i18n.language === 'es' ? 
                  'Para más información sobre la DMCA, visita el sitio web de la Oficina de Derechos de Autor de los Estados Unidos en' : 
                 i18n.language === 'ca' ? 
                  'Per a més informació sobre la DMCA, visita el lloc web de l\'Oficina de Drets d\'Autor dels Estats Units a' : 
                  'For more information about the DMCA, visit the U.S. Copyright Office website at'} {' '}
                <a href="https://www.copyright.gov" target="_blank" rel="noopener noreferrer" className="text-[hsl(188,100%,38%)] hover:underline">
                  www.copyright.gov
                </a>
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>{i18n.language === 'es' ? 'Importante:' : 
                         i18n.language === 'ca' ? 'Important:' : 
                         'Important:'}</strong> {' '}
                {i18n.language === 'es' ? 
                  'Presentar una notificación DMCA falsa puede resultar en responsabilidad legal. Consulta con un abogado antes de presentar una notificación si no estás seguro.' : 
                 i18n.language === 'ca' ? 
                  'Presentar una notificació DMCA falsa pot resultar en responsabilitat legal. Consulta amb un advocat abans de presentar una notificació si no estàs segur.' : 
                  'Filing a false DMCA notice may result in legal liability. Consult with an attorney before filing a notice if you are unsure.'}
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
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Mail, Database, Lock, UserCheck, AlertCircle } from "lucide-react";

export default function PrivacyPolicy() {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-8">
          {i18n.language === 'es' 
            ? 'Política de Privacidad'
            : i18n.language === 'ca'
            ? 'Política de Privadesa'
            : 'Privacy Policy'}
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Información General'
                : i18n.language === 'ca'
                ? 'Informació General'
                : 'General Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-gray-600">
              {i18n.language === 'es' 
                ? 'En Dialoom, nos tomamos muy en serio la protección de tus datos personales. Esta política de privacidad describe cómo recopilamos, usamos y protegemos tu información de acuerdo con el Reglamento General de Protección de Datos (RGPD) de la Unión Europea.'
                : i18n.language === 'ca'
                ? 'A Dialoom, ens prenem molt seriosament la protecció de les teves dades personals. Aquesta política de privadesa descriu com recopilem, utilitzem i protegim la teva informació d\'acord amb el Reglament General de Protecció de Dades (RGPD) de la Unió Europea.'
                : 'At Dialoom, we take the protection of your personal data very seriously. This privacy policy describes how we collect, use and protect your information in accordance with the European Union\'s General Data Protection Regulation (GDPR).'}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              {i18n.language === 'es' 
                ? 'Última actualización: 31 de julio de 2025'
                : i18n.language === 'ca'
                ? 'Última actualització: 31 de juliol de 2025'
                : 'Last updated: July 31, 2025'}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Datos que Recopilamos'
                : i18n.language === 'ca'
                ? 'Dades que Recopilem'
                : 'Data We Collect'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <UserCheck className="w-4 h-4 mt-1 text-green-600" />
                <div>
                  <strong>{i18n.language === 'es' ? 'Información de Cuenta:' : i18n.language === 'ca' ? 'Informació de Compte:' : 'Account Information:'}</strong>
                  <p className="text-sm text-gray-600">
                    {i18n.language === 'es' 
                      ? 'Nombre, correo electrónico, foto de perfil, información profesional'
                      : i18n.language === 'ca'
                      ? 'Nom, correu electrònic, foto de perfil, informació professional'
                      : 'Name, email, profile photo, professional information'}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Database className="w-4 h-4 mt-1 text-blue-600" />
                <div>
                  <strong>{i18n.language === 'es' ? 'Datos de Uso:' : i18n.language === 'ca' ? 'Dades d\'Ús:' : 'Usage Data:'}</strong>
                  <p className="text-sm text-gray-600">
                    {i18n.language === 'es' 
                      ? 'Registros de videollamadas, preferencias de usuario, historial de pagos'
                      : i18n.language === 'ca'
                      ? 'Registres de videotrucades, preferències d\'usuari, historial de pagaments'
                      : 'Video call logs, user preferences, payment history'}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 mt-1 text-purple-600" />
                <div>
                  <strong>{i18n.language === 'es' ? 'Datos de Pago:' : i18n.language === 'ca' ? 'Dades de Pagament:' : 'Payment Data:'}</strong>
                  <p className="text-sm text-gray-600">
                    {i18n.language === 'es' 
                      ? 'Procesados de forma segura por Stripe (no almacenamos datos de tarjetas)'
                      : i18n.language === 'ca'
                      ? 'Processats de forma segura per Stripe (no emmagatzemem dades de targetes)'
                      : 'Securely processed by Stripe (we do not store card data)'}
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Cómo Protegemos tus Datos'
                : i18n.language === 'ca'
                ? 'Com Protegim les teves Dades'
                : 'How We Protect Your Data'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="text-sm">• {i18n.language === 'es' ? 'Encriptación SSL/TLS para todas las comunicaciones' : i18n.language === 'ca' ? 'Encriptació SSL/TLS per a totes les comunicacions' : 'SSL/TLS encryption for all communications'}</li>
              <li className="text-sm">• {i18n.language === 'es' ? 'Almacenamiento seguro en servidores europeos' : i18n.language === 'ca' ? 'Emmagatzematge segur en servidors europeus' : 'Secure storage on European servers'}</li>
              <li className="text-sm">• {i18n.language === 'es' ? 'Acceso restringido basado en roles' : i18n.language === 'ca' ? 'Accés restringit basat en rols' : 'Role-based access restrictions'}</li>
              <li className="text-sm">• {i18n.language === 'es' ? 'Auditorías de seguridad regulares' : i18n.language === 'ca' ? 'Auditories de seguretat regulars' : 'Regular security audits'}</li>
              <li className="text-sm">• {i18n.language === 'es' ? 'Cumplimiento total con RGPD' : i18n.language === 'ca' ? 'Compliment total amb RGPD' : 'Full GDPR compliance'}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Tus Derechos'
                : i18n.language === 'ca'
                ? 'Els teus Drets'
                : 'Your Rights'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              {i18n.language === 'es' 
                ? 'Bajo el RGPD, tienes los siguientes derechos:'
                : i18n.language === 'ca'
                ? 'Sota el RGPD, tens els següents drets:'
                : 'Under GDPR, you have the following rights:'}
            </p>
            <ul className="space-y-2">
              <li className="text-sm">• {i18n.language === 'es' ? 'Derecho de acceso a tus datos' : i18n.language === 'ca' ? 'Dret d\'accés a les teves dades' : 'Right to access your data'}</li>
              <li className="text-sm">• {i18n.language === 'es' ? 'Derecho de rectificación' : i18n.language === 'ca' ? 'Dret de rectificació' : 'Right to rectification'}</li>
              <li className="text-sm">• {i18n.language === 'es' ? 'Derecho al olvido' : i18n.language === 'ca' ? 'Dret a l\'oblit' : 'Right to erasure'}</li>
              <li className="text-sm">• {i18n.language === 'es' ? 'Derecho a la portabilidad de datos' : i18n.language === 'ca' ? 'Dret a la portabilitat de dades' : 'Right to data portability'}</li>
              <li className="text-sm">• {i18n.language === 'es' ? 'Derecho a oponerse al procesamiento' : i18n.language === 'ca' ? 'Dret a oposar-se al processament' : 'Right to object to processing'}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Contacto'
                : i18n.language === 'ca'
                ? 'Contacte'
                : 'Contact'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              {i18n.language === 'es' 
                ? 'Para cualquier consulta sobre privacidad o para ejercer tus derechos, contacta con:'
                : i18n.language === 'ca'
                ? 'Per a qualsevol consulta sobre privadesa o per exercir els teus drets, contacta amb:'
                : 'For any privacy inquiries or to exercise your rights, contact:'}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Dialoom Privacy Team</p>
              <p className="text-sm text-gray-600">Email: privacy@dialoom.com</p>
              <p className="text-sm text-gray-600">
                {i18n.language === 'es' 
                  ? 'Respuesta en 72 horas'
                  : i18n.language === 'ca'
                  ? 'Resposta en 72 hores'
                  : 'Response within 72 hours'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
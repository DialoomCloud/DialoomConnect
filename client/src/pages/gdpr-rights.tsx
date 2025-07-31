import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Download, Trash2, UserX, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function GdprRights() {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-8">
          {i18n.language === 'es' 
            ? 'Tus Derechos RGPD'
            : i18n.language === 'ca'
            ? 'Els teus Drets RGPD'
            : 'Your GDPR Rights'}
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
          <CardContent>
            <p className="text-gray-600">
              {i18n.language === 'es' 
                ? 'El Reglamento General de Protección de Datos (RGPD) te otorga derechos específicos sobre tus datos personales. En Dialoom, facilitamos el ejercicio de estos derechos.'
                : i18n.language === 'ca'
                ? 'El Reglament General de Protecció de Dades (RGPD) t\'atorga drets específics sobre les teves dades personals. A Dialoom, facilitem l\'exercici d\'aquests drets.'
                : 'The General Data Protection Regulation (GDPR) grants you specific rights over your personal data. At Dialoom, we facilitate the exercise of these rights.'}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                {i18n.language === 'es' 
                  ? 'Derecho de Acceso'
                  : i18n.language === 'ca'
                  ? 'Dret d\'Accés'
                  : 'Right of Access'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {i18n.language === 'es' 
                  ? 'Puedes solicitar una copia de todos los datos personales que tenemos sobre ti.'
                  : i18n.language === 'ca'
                  ? 'Pots sol·licitar una còpia de totes les dades personals que tenim sobre tu.'
                  : 'You can request a copy of all personal data we have about you.'}
              </p>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                disabled={!isAuthenticated}
              >
                <Download className="w-4 h-4 mr-2" />
                {i18n.language === 'es' 
                  ? 'Descargar mis Datos'
                  : i18n.language === 'ca'
                  ? 'Descarregar les meves Dades'
                  : 'Download my Data'}
              </Button>
              {!isAuthenticated && (
                <p className="text-xs text-gray-500 mt-2">
                  {i18n.language === 'es' 
                    ? 'Debes iniciar sesión para solicitar tus datos'
                    : i18n.language === 'ca'
                    ? 'Has d\'iniciar sessió per sol·licitar les teves dades'
                    : 'You must log in to request your data'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-green-600" />
                {i18n.language === 'es' 
                  ? 'Derecho de Rectificación'
                  : i18n.language === 'ca'
                  ? 'Dret de Rectificació'
                  : 'Right to Rectification'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {i18n.language === 'es' 
                  ? 'Puedes actualizar o corregir cualquier información incorrecta desde tu perfil.'
                  : i18n.language === 'ca'
                  ? 'Pots actualitzar o corregir qualsevol informació incorrecta des del teu perfil.'
                  : 'You can update or correct any incorrect information from your profile.'}
              </p>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                disabled={!isAuthenticated}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {i18n.language === 'es' 
                  ? 'Ir a mi Perfil'
                  : i18n.language === 'ca'
                  ? 'Anar al meu Perfil'
                  : 'Go to my Profile'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                {i18n.language === 'es' 
                  ? 'Derecho al Olvido'
                  : i18n.language === 'ca'
                  ? 'Dret a l\'Oblit'
                  : 'Right to Erasure'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {i18n.language === 'es' 
                  ? 'Puedes solicitar la eliminación completa de tu cuenta y todos tus datos.'
                  : i18n.language === 'ca'
                  ? 'Pots sol·licitar l\'eliminació completa del teu compte i totes les teves dades.'
                  : 'You can request the complete deletion of your account and all your data.'}
              </p>
              <Button 
                variant="destructive" 
                className="w-full sm:w-auto"
                disabled={!isAuthenticated}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {i18n.language === 'es' 
                  ? 'Eliminar mi Cuenta'
                  : i18n.language === 'ca'
                  ? 'Eliminar el meu Compte'
                  : 'Delete my Account'}
              </Button>
              <p className="text-xs text-red-600 mt-2">
                {i18n.language === 'es' 
                  ? '⚠️ Esta acción es irreversible'
                  : i18n.language === 'ca'
                  ? '⚠️ Aquesta acció és irreversible'
                  : '⚠️ This action is irreversible'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-orange-600" />
                {i18n.language === 'es' 
                  ? 'Derecho de Oposición'
                  : i18n.language === 'ca'
                  ? 'Dret d\'Oposició'
                  : 'Right to Object'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {i18n.language === 'es' 
                  ? 'Puedes oponerte a ciertos tipos de procesamiento de tus datos, como marketing directo.'
                  : i18n.language === 'ca'
                  ? 'Pots oposar-te a certs tipus de processament de les teves dades, com el màrqueting directe.'
                  : 'You can object to certain types of processing of your data, such as direct marketing.'}
              </p>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                disabled={!isAuthenticated}
              >
                <UserX className="w-4 h-4 mr-2" />
                {i18n.language === 'es' 
                  ? 'Gestionar Preferencias'
                  : i18n.language === 'ca'
                  ? 'Gestionar Preferències'
                  : 'Manage Preferences'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                {i18n.language === 'es' 
                  ? 'Derecho a la Limitación'
                  : i18n.language === 'ca'
                  ? 'Dret a la Limitació'
                  : 'Right to Restriction'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {i18n.language === 'es' 
                  ? 'Puedes solicitar que limitemos el procesamiento de tus datos en ciertas circunstancias.'
                  : i18n.language === 'ca'
                  ? 'Pots sol·licitar que limitem el processament de les teves dades en certes circumstàncies.'
                  : 'You can request that we limit the processing of your data in certain circumstances.'}
              </p>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
              >
                <Lock className="w-4 h-4 mr-2" />
                {i18n.language === 'es' 
                  ? 'Contactar Soporte'
                  : i18n.language === 'ca'
                  ? 'Contactar Suport'
                  : 'Contact Support'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 text-center">
              {i18n.language === 'es' 
                ? 'Para ejercer cualquiera de estos derechos o si tienes preguntas, contacta con:'
                : i18n.language === 'ca'
                ? 'Per exercir qualsevol d\'aquests drets o si tens preguntes, contacta amb:'
                : 'To exercise any of these rights or if you have questions, contact:'}
            </p>
            <p className="text-center font-medium mt-2">privacy@dialoom.com</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
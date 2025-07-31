import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Shield, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiePolicy() {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-8">
          {i18n.language === 'es' 
            ? 'Política de Cookies'
            : i18n.language === 'ca'
            ? 'Política de Cookies'
            : 'Cookie Policy'}
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              {i18n.language === 'es' 
                ? '¿Qué son las Cookies?'
                : i18n.language === 'ca'
                ? 'Què són les Cookies?'
                : 'What are Cookies?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {i18n.language === 'es' 
                ? 'Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. Nos ayudan a mejorar tu experiencia y a entender cómo utilizas nuestros servicios.'
                : i18n.language === 'ca'
                ? 'Les cookies són petits arxius de text que s\'emmagatzemen al teu dispositiu quan visites el nostre lloc web. Ens ajuden a millorar la teva experiència i a entendre com utilitzes els nostres serveis.'
                : 'Cookies are small text files that are stored on your device when you visit our website. They help us improve your experience and understand how you use our services.'}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Tipos de Cookies que Utilizamos'
                : i18n.language === 'ca'
                ? 'Tipus de Cookies que Utilitzem'
                : 'Types of Cookies We Use'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold mb-2">
                  {i18n.language === 'es' ? 'Cookies Esenciales' : i18n.language === 'ca' ? 'Cookies Essencials' : 'Essential Cookies'}
                </h3>
                <p className="text-sm text-gray-600">
                  {i18n.language === 'es' 
                    ? 'Necesarias para el funcionamiento básico del sitio. Incluyen autenticación y preferencias de idioma.'
                    : i18n.language === 'ca'
                    ? 'Necessàries per al funcionament bàsic del lloc. Inclouen autenticació i preferències d\'idioma.'
                    : 'Necessary for the basic functioning of the site. Include authentication and language preferences.'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {i18n.language === 'es' ? 'Duración: Sesión' : i18n.language === 'ca' ? 'Durada: Sessió' : 'Duration: Session'}
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">
                  {i18n.language === 'es' ? 'Cookies de Rendimiento' : i18n.language === 'ca' ? 'Cookies de Rendiment' : 'Performance Cookies'}
                </h3>
                <p className="text-sm text-gray-600">
                  {i18n.language === 'es' 
                    ? 'Nos ayudan a entender cómo los usuarios interactúan con nuestro sitio para mejorarlo.'
                    : i18n.language === 'ca'
                    ? 'Ens ajuden a entendre com els usuaris interactuen amb el nostre lloc per millorar-lo.'
                    : 'Help us understand how users interact with our site to improve it.'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {i18n.language === 'es' ? 'Duración: 1 año' : i18n.language === 'ca' ? 'Durada: 1 any' : 'Duration: 1 year'}
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold mb-2">
                  {i18n.language === 'es' ? 'Cookies de Funcionalidad' : i18n.language === 'ca' ? 'Cookies de Funcionalitat' : 'Functionality Cookies'}
                </h3>
                <p className="text-sm text-gray-600">
                  {i18n.language === 'es' 
                    ? 'Permiten recordar tus preferencias y personalizar tu experiencia.'
                    : i18n.language === 'ca'
                    ? 'Permeten recordar les teves preferències i personalitzar la teva experiència.'
                    : 'Allow us to remember your preferences and personalize your experience.'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {i18n.language === 'es' ? 'Duración: 6 meses' : i18n.language === 'ca' ? 'Durada: 6 mesos' : 'Duration: 6 months'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Gestión de Cookies'
                : i18n.language === 'ca'
                ? 'Gestió de Cookies'
                : 'Cookie Management'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {i18n.language === 'es' 
                ? 'Puedes controlar y eliminar las cookies a través de la configuración de tu navegador. Ten en cuenta que desactivar ciertas cookies puede afectar la funcionalidad del sitio.'
                : i18n.language === 'ca'
                ? 'Pots controlar i eliminar les cookies a través de la configuració del teu navegador. Tingues en compte que desactivar certes cookies pot afectar la funcionalitat del lloc.'
                : 'You can control and delete cookies through your browser settings. Please note that disabling certain cookies may affect site functionality.'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                {i18n.language === 'es' 
                  ? 'Configurar Cookies'
                  : i18n.language === 'ca'
                  ? 'Configurar Cookies'
                  : 'Configure Cookies'}
              </Button>
              <Button variant="outline" size="sm">
                {i18n.language === 'es' 
                  ? 'Rechazar No Esenciales'
                  : i18n.language === 'ca'
                  ? 'Rebutjar No Essencials'
                  : 'Reject Non-Essential'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Más Información'
                : i18n.language === 'ca'
                ? 'Més Informació'
                : 'More Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              {i18n.language === 'es' 
                ? 'Para más información sobre cómo gestionan las cookies los navegadores más comunes:'
                : i18n.language === 'ca'
                ? 'Per a més informació sobre com gestionen les cookies els navegadors més comuns:'
                : 'For more information on how common browsers manage cookies:'}
            </p>
            <ul className="text-sm space-y-1">
              <li>• <a href="#" className="text-[hsl(244,91%,68%)] hover:underline">Chrome</a></li>
              <li>• <a href="#" className="text-[hsl(244,91%,68%)] hover:underline">Firefox</a></li>
              <li>• <a href="#" className="text-[hsl(244,91%,68%)] hover:underline">Safari</a></li>
              <li>• <a href="#" className="text-[hsl(244,91%,68%)] hover:underline">Edge</a></li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              {i18n.language === 'es' 
                ? 'Última actualización: 31 de julio de 2025'
                : i18n.language === 'ca'
                ? 'Última actualització: 31 de juliol de 2025'
                : 'Last updated: July 31, 2025'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
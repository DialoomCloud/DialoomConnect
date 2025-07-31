import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Cookie, Shield, Settings, BarChart, Globe, Info, Clock, Mail } from "lucide-react";

export default function CookiePolicy() {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-[hsl(188,100%,38%)] text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Cookie className="w-6 h-6" />
              {i18n.language === 'es' ? 'Política de Cookies' : 
               i18n.language === 'ca' ? 'Política de Cookies' : 'Cookie Policy'}
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
                <Info className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '1. ¿Qué son las Cookies?' : 
                 i18n.language === 'ca' ? '1. Què són les Cookies?' : 
                 '1. What are Cookies?'}
              </h2>
              <p>
                {i18n.language === 'es' ? 
                  'Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. Nos ayudan a mejorar tu experiencia de navegación y a proporcionar nuestros servicios de manera eficiente.' : 
                 i18n.language === 'ca' ? 
                  'Les cookies són petits arxius de text que s\'emmagatzemen al teu dispositiu quan visites el nostre lloc web. Ens ajuden a millorar la teva experiència de navegació i a proporcionar els nostres serveis de manera eficient.' : 
                  'Cookies are small text files that are stored on your device when you visit our website. They help us improve your browsing experience and provide our services efficiently.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '2. Cookies Esenciales' : 
                 i18n.language === 'ca' ? '2. Cookies Essencials' : 
                 '2. Essential Cookies'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 
                  'Estas cookies son necesarias para el funcionamiento básico de Dialoom:' : 
                 i18n.language === 'ca' ? 
                  'Aquestes cookies són necessàries per al funcionament bàsic de Dialoom:' : 
                  'These cookies are necessary for the basic functioning of Dialoom:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>{i18n.language === 'es' ? 'Autenticación:' : 
                          i18n.language === 'ca' ? 'Autenticació:' : 
                          'Authentication:'}</strong> {' '}
                  {i18n.language === 'es' ? 'Mantienen tu sesión activa' : 
                   i18n.language === 'ca' ? 'Mantenen la teva sessió activa' : 
                   'Keep your session active'}
                </li>
                <li>
                  <strong>{i18n.language === 'es' ? 'Preferencias:' : 
                          i18n.language === 'ca' ? 'Preferències:' : 
                          'Preferences:'}</strong> {' '}
                  {i18n.language === 'es' ? 'Recuerdan tu idioma y configuración' : 
                   i18n.language === 'ca' ? 'Recorden el teu idioma i configuració' : 
                   'Remember your language and settings'}
                </li>
                <li>
                  <strong>{i18n.language === 'es' ? 'Seguridad:' : 
                          i18n.language === 'ca' ? 'Seguretat:' : 
                          'Security:'}</strong> {' '}
                  {i18n.language === 'es' ? 'Protegen contra solicitudes fraudulentas' : 
                   i18n.language === 'ca' ? 'Protegeixen contra sol·licituds fraudulentes' : 
                   'Protect against fraudulent requests'}
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '3. Cookies Funcionales' : 
                 i18n.language === 'ca' ? '3. Cookies Funcionals' : 
                 '3. Functional Cookies'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 
                  'Mejoran la funcionalidad del sitio web:' : 
                 i18n.language === 'ca' ? 
                  'Milloren la funcionalitat del lloc web:' : 
                  'Enhance website functionality:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{i18n.language === 'es' ? 'Recordar tus preferencias de visualización' : 
                     i18n.language === 'ca' ? 'Recordar les teves preferències de visualització' : 
                     'Remember your viewing preferences'}</li>
                <li>{i18n.language === 'es' ? 'Mantener tu zona horaria para las reservas' : 
                     i18n.language === 'ca' ? 'Mantenir la teva zona horària per a les reserves' : 
                     'Maintain your timezone for bookings'}</li>
                <li>{i18n.language === 'es' ? 'Guardar filtros de búsqueda' : 
                     i18n.language === 'ca' ? 'Guardar filtres de cerca' : 
                     'Save search filters'}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '4. Cookies Analíticas' : 
                 i18n.language === 'ca' ? '4. Cookies Analítiques' : 
                 '4. Analytics Cookies'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 
                  'Nos ayudan a entender cómo se usa nuestro sitio:' : 
                 i18n.language === 'ca' ? 
                  'Ens ajuden a entendre com s\'utilitza el nostre lloc:' : 
                  'Help us understand how our site is used:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{i18n.language === 'es' ? 'Páginas más visitadas' : 
                     i18n.language === 'ca' ? 'Pàgines més visitades' : 
                     'Most visited pages'}</li>
                <li>{i18n.language === 'es' ? 'Tiempo de permanencia' : 
                     i18n.language === 'ca' ? 'Temps de permanència' : 
                     'Time spent on site'}</li>
                <li>{i18n.language === 'es' ? 'Errores técnicos' : 
                     i18n.language === 'ca' ? 'Errors tècnics' : 
                     'Technical errors'}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '5. Cookies de Terceros' : 
                 i18n.language === 'ca' ? '5. Cookies de Tercers' : 
                 '5. Third-party Cookies'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 
                  'Utilizamos servicios de terceros que pueden establecer sus propias cookies:' : 
                 i18n.language === 'ca' ? 
                  'Utilitzem serveis de tercers que poden establir les seves pròpies cookies:' : 
                  'We use third-party services that may set their own cookies:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Stripe:</strong> {i18n.language === 'es' ? 'Para procesar pagos de forma segura' : 
                                               i18n.language === 'ca' ? 'Per processar pagaments de forma segura' : 
                                               'For secure payment processing'}</li>
                <li><strong>Agora:</strong> {i18n.language === 'es' ? 'Para facilitar las videollamadas' : 
                                             i18n.language === 'ca' ? 'Per facilitar les videotrucades' : 
                                             'To facilitate video calls'}</li>
                <li><strong>Replit Auth:</strong> {i18n.language === 'es' ? 'Para la autenticación de usuarios' : 
                                                   i18n.language === 'ca' ? 'Per a l\'autenticació d\'usuaris' : 
                                                   'For user authentication'}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '6. Gestión de Cookies' : 
                 i18n.language === 'ca' ? '6. Gestió de Cookies' : 
                 '6. Cookie Management'}
              </h2>
              <p className="mb-4">
                {i18n.language === 'es' ? 
                  'Puedes controlar y eliminar las cookies a través de la configuración de tu navegador:' : 
                 i18n.language === 'ca' ? 
                  'Pots controlar i eliminar les cookies a través de la configuració del teu navegador:' : 
                  'You can control and delete cookies through your browser settings:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chrome: Settings → Privacy and security → Cookies</li>
                <li>Firefox: Settings → Privacy & Security → Cookies</li>
                <li>Safari: Preferences → Privacy → Cookies</li>
                <li>Edge: Settings → Privacy, search, and services → Cookies</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                {i18n.language === 'es' ? 
                  'Ten en cuenta que desactivar las cookies esenciales puede afectar la funcionalidad del sitio.' : 
                 i18n.language === 'ca' ? 
                  'Tingues en compte que desactivar les cookies essencials pot afectar la funcionalitat del lloc.' : 
                  'Please note that disabling essential cookies may affect site functionality.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '7. Duración de las Cookies' : 
                 i18n.language === 'ca' ? '7. Durada de les Cookies' : 
                 '7. Cookie Duration'}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>{i18n.language === 'es' ? 'Cookies de sesión:' : 
                          i18n.language === 'ca' ? 'Cookies de sessió:' : 
                          'Session cookies:'}</strong> {' '}
                  {i18n.language === 'es' ? 'Se eliminan al cerrar el navegador' : 
                   i18n.language === 'ca' ? 'S\'eliminen en tancar el navegador' : 
                   'Deleted when you close your browser'}
                </li>
                <li>
                  <strong>{i18n.language === 'es' ? 'Cookies persistentes:' : 
                          i18n.language === 'ca' ? 'Cookies persistents:' : 
                          'Persistent cookies:'}</strong> {' '}
                  {i18n.language === 'es' ? 'Permanecen hasta 1 año o hasta que las elimines' : 
                   i18n.language === 'ca' ? 'Romanen fins a 1 any o fins que les eliminis' : 
                   'Remain for up to 1 year or until you delete them'}
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {i18n.language === 'es' ? '8. Contacto' : 
                 i18n.language === 'ca' ? '8. Contacte' : 
                 '8. Contact'}
              </h2>
              <p>
                {i18n.language === 'es' ? 
                  'Si tienes preguntas sobre nuestra política de cookies, contáctanos en:' : 
                 i18n.language === 'ca' ? 
                  'Si tens preguntes sobre la nostra política de cookies, contacta\'ns a:' : 
                  'If you have questions about our cookie policy, contact us at:'}
              </p>
              <p className="mt-2">
                <a href="mailto:cookies@dialoom.cloud" className="text-[hsl(188,100%,38%)] hover:underline">
                  cookies@dialoom.cloud
                </a>
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                {i18n.language === 'es' ? 
                  'Al continuar navegando en Dialoom, aceptas el uso de cookies según esta política.' : 
                 i18n.language === 'ca' ? 
                  'En continuar navegant a Dialoom, acceptes l\'ús de cookies segons aquesta política.' : 
                  'By continuing to browse Dialoom, you accept the use of cookies according to this policy.'}
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
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Shield, Cookie, FileText, Heart, Copyright, HelpCircle } from "lucide-react";

export function Footer() {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[hsl(17,12%,95%)] border-t border-[hsl(220,13%,90%)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="font-semibold text-[hsl(17,12%,6%)] mb-4">Dialoom</h3>
            <p className="text-sm text-gray-600">
              {i18n.language === 'es' 
                ? 'Plataforma profesional de videollamadas y consultas online.'
                : i18n.language === 'ca'
                ? 'Plataforma professional de videotrucades i consultes en línia.'
                : 'Professional video calls and online consultations platform.'}
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-[hsl(17,12%,6%)] mb-4">
              {i18n.language === 'es' 
                ? 'Legal'
                : i18n.language === 'ca'
                ? 'Legal'
                : 'Legal'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy" className="text-sm text-gray-600 hover:text-[hsl(188,100%,38%)] flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  {i18n.language === 'es' 
                    ? 'Política de Privacidad'
                    : i18n.language === 'ca'
                    ? 'Política de Privadesa'
                    : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-sm text-gray-600 hover:text-[hsl(188,100%,38%)] flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  {i18n.language === 'es' 
                    ? 'Términos de Servicio'
                    : i18n.language === 'ca'
                    ? 'Termes de Servei'
                    : 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-sm text-gray-600 hover:text-[hsl(188,100%,38%)] flex items-center gap-2">
                  <Cookie className="w-3 h-3" />
                  {i18n.language === 'es' 
                    ? 'Política de Cookies'
                    : i18n.language === 'ca'
                    ? 'Política de Cookies'
                    : 'Cookie Policy'}
                </Link>
              </li>
              <li>
                <Link href="/legal/dmca" className="text-sm text-gray-600 hover:text-[hsl(188,100%,38%)] flex items-center gap-2">
                  <Copyright className="w-3 h-3" />
                  DMCA
                </Link>
              </li>
            </ul>
          </div>

          {/* GDPR Compliance */}
          <div>
            <h3 className="font-semibold text-[hsl(17,12%,6%)] mb-4">
              {i18n.language === 'es' 
                ? 'Protección de Datos'
                : i18n.language === 'ca'
                ? 'Protecció de Dades'
                : 'Data Protection'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/gdpr-rights" className="text-sm text-gray-600 hover:text-[hsl(188,100%,38%)]">
                  {i18n.language === 'es' 
                    ? 'Tus Derechos RGPD'
                    : i18n.language === 'ca'
                    ? 'Els teus Drets RGPD'
                    : 'Your GDPR Rights'}
                </Link>
              </li>
              <li>
                <Link href="/data-request" className="text-sm text-gray-600 hover:text-[hsl(188,100%,38%)]">
                  {i18n.language === 'es' 
                    ? 'Solicitar mis Datos'
                    : i18n.language === 'ca'
                    ? 'Sol·licitar les meves Dades'
                    : 'Request my Data'}
                </Link>
              </li>
              <li>
                <Link href="/delete-account" className="text-sm text-gray-600 hover:text-[hsl(188,100%,38%)]">
                  {i18n.language === 'es' 
                    ? 'Eliminar mi Cuenta'
                    : i18n.language === 'ca'
                    ? 'Eliminar el meu Compte'
                    : 'Delete my Account'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="font-semibold text-[hsl(17,12%,6%)] mb-4">
              {i18n.language === 'es' 
                ? 'Soporte'
                : i18n.language === 'ca'
                ? 'Suport'
                : 'Support'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-gray-600 hover:text-[hsl(188,100%,38%)] flex items-center gap-2">
                  <HelpCircle className="w-3 h-3" />
                  {i18n.language === 'es' 
                    ? 'Centro de Ayuda'
                    : i18n.language === 'ca'
                    ? 'Centre d\'Ajuda'
                    : 'Help Center'}
                </Link>
              </li>
              <li>
                <a href="mailto:support@dialoom.cloud" className="text-sm text-gray-600 hover:text-[hsl(188,100%,38%)]">
                  support@dialoom.cloud
                </a>
              </li>
              <li>
                <a href="mailto:privacy@dialoom.cloud" className="text-sm text-gray-600 hover:text-[hsl(188,100%,38%)]">
                  privacy@dialoom.cloud
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>
            © {currentYear} Dialoom. {i18n.language === 'es' 
              ? 'Todos los derechos reservados.'
              : i18n.language === 'ca'
              ? 'Tots els drets reservats.'
              : 'All rights reserved.'}
          </p>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="flex items-center gap-1">
              {i18n.language === 'es' 
                ? 'Hecho con'
                : i18n.language === 'ca'
                ? 'Fet amb'
                : 'Made with'}
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              {i18n.language === 'es' 
                ? 'en Barcelona'
                : i18n.language === 'ca'
                ? 'a Barcelona'
                : 'in Barcelona'}
            </span>
            
            <span className="text-xs">
              {i18n.language === 'es' 
                ? 'Cumplimos con RGPD'
                : i18n.language === 'ca'
                ? 'Complim amb RGPD'
                : 'GDPR Compliant'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
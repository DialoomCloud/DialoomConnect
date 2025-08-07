import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Shield, Cookie, FileText, Heart, Copyright, HelpCircle } from "lucide-react";

export function Footer() {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="font-semibold text-white mb-4">Dialoom</h3>
            <p className="text-sm text-gray-400">
              {t('footer.description')}
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
                  <Cookie className="w-3 h-3" />
                  {t('footer.cookiePolicy')}
                </Link>
              </li>
              <li>
                <Link href="/legal/dmca" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
                  <Copyright className="w-3 h-3" />
                  DMCA
                </Link>
              </li>
            </ul>
          </div>

          {/* GDPR Compliance */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              {t('footer.dataProtection')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/gdpr-rights" className="text-sm text-gray-400 hover:text-white">
                  {t('footer.gdprRights')}
                </Link>
              </li>
              <li>
                <Link href="/data-request" className="text-sm text-gray-400 hover:text-white">
                  {t('footer.requestData')}
                </Link>
              </li>
              <li>
                <Link href="/delete-account" className="text-sm text-gray-400 hover:text-white">
                  {t('footer.deleteAccount')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              {t('footer.support')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
                  <HelpCircle className="w-3 h-3" />
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <a href="mailto:support@dialoom.cloud" className="text-sm text-gray-400 hover:text-white">
                  support@dialoom.cloud
                </a>
              </li>
              <li>
                <a href="mailto:privacy@dialoom.cloud" className="text-sm text-gray-400 hover:text-white">
                  privacy@dialoom.cloud
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>
            © {currentYear} Dialoom. {t('footer.allRightsReserved')}
          </p>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="flex items-center gap-1">
              {t('footer.madeWith')}
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              {t('footer.in')}
            </span>
            
            <span className="text-xs">
              {t('footer.gdprCompliance')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
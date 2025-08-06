import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/navigation';
import NetworkingRecommendations from '@/components/NetworkingRecommendations';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';

export default function Networking() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(220,9%,98%)] to-[hsl(220,20%,95%)]">
        <Navigation />
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(220,9%,98%)] to-[hsl(220,20%,95%)]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-[hsl(220,13%,90%)] p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">{t('dashboard.restrictedAccess')}</h1>
            <p className="text-gray-600 mb-6">{t('dashboard.loginRequired')}</p>
            <Link
              to="/login"
              className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,35%)] text-white px-6 py-2 rounded-lg inline-block transition-colors"
            >
              {t('dashboard.loginButton')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(220,9%,98%)] to-[hsl(220,20%,95%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NetworkingRecommendations />
      </div>
    </div>
  );
}
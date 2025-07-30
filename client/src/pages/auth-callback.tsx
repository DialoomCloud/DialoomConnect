import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          setLocation('/login');
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to home
          setLocation('/');
        } else {
          // No session, redirect to login
          setLocation('/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        setLocation('/login');
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(244,91%,95%)] to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-[hsl(244,91%,68%)] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-[hsl(17,12%,6%)] mb-2">
          Completando autenticación...
        </h2>
        <p className="text-gray-600">
          Te redirigiremos en un momento
        </p>
      </div>
    </div>
  );
}
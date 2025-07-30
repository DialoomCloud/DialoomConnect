import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signInWithProvider } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { FaGoogle, FaApple, FaMicrosoft, FaDiscord, FaLinkedin, FaGithub, FaFacebook, FaTwitter } from 'react-icons/fa';

const providers = [
  { 
    id: 'google' as const, 
    name: 'Google', 
    icon: FaGoogle, 
    color: 'hover:bg-red-50 border-red-200 hover:border-red-300',
    iconColor: 'text-red-600'
  },
  { 
    id: 'apple' as const, 
    name: 'Apple', 
    icon: FaApple, 
    color: 'hover:bg-gray-50 border-gray-200 hover:border-gray-300',
    iconColor: 'text-gray-800'
  },
  { 
    id: 'microsoft' as const, 
    name: 'Microsoft', 
    icon: FaMicrosoft, 
    color: 'hover:bg-blue-50 border-blue-200 hover:border-blue-300',
    iconColor: 'text-blue-600'
  },
  { 
    id: 'discord' as const, 
    name: 'Discord', 
    icon: FaDiscord, 
    color: 'hover:bg-indigo-50 border-indigo-200 hover:border-indigo-300',
    iconColor: 'text-indigo-600'
  },
  { 
    id: 'linkedin' as const, 
    name: 'LinkedIn', 
    icon: FaLinkedin, 
    color: 'hover:bg-blue-50 border-blue-200 hover:border-blue-300',
    iconColor: 'text-blue-700'
  },
  { 
    id: 'github' as const, 
    name: 'GitHub', 
    icon: FaGithub, 
    color: 'hover:bg-gray-50 border-gray-200 hover:border-gray-300',
    iconColor: 'text-gray-800'
  },
  { 
    id: 'facebook' as const, 
    name: 'Facebook', 
    icon: FaFacebook, 
    color: 'hover:bg-blue-50 border-blue-200 hover:border-blue-300',
    iconColor: 'text-blue-600'
  },
  { 
    id: 'twitter' as const, 
    name: 'Twitter', 
    icon: FaTwitter, 
    color: 'hover:bg-sky-50 border-sky-200 hover:border-sky-300',
    iconColor: 'text-sky-500'
  }
];

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProviderSignIn = async (providerId: typeof providers[number]['id']) => {
    try {
      setLoadingProvider(providerId);
      await signInWithProvider(providerId);
      // Redirect will happen automatically via Supabase
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Error de autenticación",
        description: `No se pudo iniciar sesión con ${providers.find(p => p.id === providerId)?.name}. Inténtalo de nuevo.`,
        variant: "destructive"
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(244,91%,95%)] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[hsl(244,91%,68%)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-2">
            Bienvenido a Dialoom
          </h1>
          <p className="text-gray-600">
            Inicia sesión para acceder a tu perfil profesional
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Elige tu método de autenticación preferido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {providers.map((provider) => {
                const Icon = provider.icon;
                const isLoading = loadingProvider === provider.id;
                
                return (
                  <Button
                    key={provider.id}
                    variant="outline"
                    className={`w-full h-12 ${provider.color} transition-all duration-200`}
                    onClick={() => handleProviderSignIn(provider.id)}
                    disabled={!!loadingProvider}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    ) : (
                      <Icon className={`w-5 h-5 mr-3 ${provider.iconColor}`} />
                    )}
                    <span className="font-medium">
                      {isLoading ? 'Conectando...' : `Continuar con ${provider.name}`}
                    </span>
                  </Button>
                );
              })}
            </div>

            <div className="text-xs text-gray-500 text-center mt-6">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            ¿Tu primera vez aquí? Se creará automáticamente una cuenta
          </p>
        </div>
      </div>
    </div>
  );
}
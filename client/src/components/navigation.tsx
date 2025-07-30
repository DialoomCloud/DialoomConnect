import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Navigation() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-[hsl(220,13%,90%)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-[hsl(244,91%,68%)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="ml-2 text-xl font-bold text-[hsl(17,12%,6%)]">Dialoom</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/">
                <a className="text-[hsl(244,91%,68%)] font-medium px-3 py-2 rounded-md hover:bg-[hsl(244,91%,95%)] transition-colors">
                  Inicio
                </a>
              </Link>
              <Link href="/profile">
                <a className="text-gray-600 hover:text-[hsl(244,91%,68%)] px-3 py-2 rounded-md transition-colors">
                  Mi Perfil
                </a>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Hola, {user?.firstName || user?.email}
            </span>
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="border-[hsl(244,91%,68%)] text-[hsl(244,91%,68%)] hover:bg-[hsl(244,91%,95%)]"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

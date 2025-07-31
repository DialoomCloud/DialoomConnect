import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./language-selector";
import { Home, User as UserIcon, Shield, Users, LogOut, Calendar as CalendarIcon } from "lucide-react";
import type { User } from "@shared/schema";

export function Navigation() {
  const { user } = useAuth() as { user: User | undefined };
  const { t } = useTranslation();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b border-[hsl(220,13%,90%)] sticky top-0 z-50 animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/home" className="flex items-center hover-lift">
              <img 
                src="/uploads/images/dialoomblue.png"
                alt="Dialoom" 
                className="h-8 w-auto object-contain"
                style={{ maxWidth: '140px' }}
              />
            </Link>
            
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/home">
                <Button
                  variant={isActive("/home") ? "default" : "ghost"}
                  size="sm"
                  className={isActive("/home") ? "bg-[hsl(188,100%,38%)] animate-glow" : "hover-lift"}
                >
                  <Home className="w-4 h-4 mr-2" />
                  {t('navigation.home')}
                </Button>
              </Link>
              
              <Link href="/profile">
                <Button
                  variant={isActive("/profile") ? "default" : "ghost"}
                  size="sm"
                  className={isActive("/profile") ? "bg-[hsl(188,100%,38%)] animate-glow" : "hover-lift"}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  {t('navigation.profile')}
                </Button>
              </Link>

              <Link href="/hosts">
                <Button
                  variant={isActive("/hosts") ? "default" : "ghost"}
                  size="sm"
                  className={isActive("/hosts") ? "bg-[hsl(188,100%,38%)] animate-glow" : "hover-lift"}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t('home.searchHosts')}
                </Button>
              </Link>
              

              
              {(user?.isAdmin || user?.role === 'admin') && (
                <Link href="/admin-dashboard">
                  <Button
                    variant={isActive("/admin-dashboard") ? "default" : "ghost"}
                    size="sm"
                    className={isActive("/admin-dashboard") ? "bg-[hsl(188,100%,38%)] animate-glow" : "hover-lift"}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {t('navigation.admin')}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <span className="text-sm text-gray-600 hidden sm:inline animate-float">
              {user?.firstName || user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover-lift"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('navigation.logout')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

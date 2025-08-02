import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./language-selector";
import { Home, User as UserIcon, Shield, Users, LogOut, Calendar as CalendarIcon, Menu, X } from "lucide-react";
import type { User } from "@shared/schema";
import { useState } from "react";

export function Navigation() {
  const { user } = useAuth() as { user: User | undefined };
  const { t } = useTranslation();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // Clear any client-side cached data
    localStorage.clear();
    sessionStorage.clear();
    
    // Force a complete page reload to logout
    window.location.href = "/api/logout";
  };

  const isActive = (path: string) => location === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-white shadow-sm border-b border-[hsl(220,13%,90%)] sticky top-0 z-50 animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={user ? "/home" : "/"} className="flex items-center">
              <img 
                src="/uploads/images/dialoomblue.png"
                alt="Dialoom" 
                className="h-12 w-auto object-contain"
                style={{ maxWidth: '200px' }}
              />
            </Link>
          </div>
            
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href={user ? "/home" : "/"}>
              <Button
                variant={isActive("/") || isActive("/home") ? "default" : "ghost"}
                size="sm"
                className={isActive("/") || isActive("/home") ? "bg-[hsl(188,100%,38%)] animate-glow" : "hover-lift"}
              >
                <Home className="w-4 h-4 mr-2" />
                {t('navigation.home')}
              </Button>
            </Link>

            <Link href="/hosts">
              <Button
                variant={isActive("/hosts") ? "default" : "ghost"}
                size="sm"
                className={isActive("/hosts") ? "bg-[hsl(188,100%,38%)] animate-glow" : "hover-lift"}
              >
                <Users className="w-4 h-4 mr-2" />
                {t('hosts.title')}
              </Button>
            </Link>
            
            {user && (
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
            )}
            
            {user && (user.isAdmin || user.role === 'admin') && (
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

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 animate-float">
                  {user.firstName || user.email}
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
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => window.location.href = "/api/login"}
                className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] animate-glow"
              >
                {t('navigation.login')}
              </Button>
            )}
            <LanguageSelector />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
            <LanguageSelector />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[hsl(220,13%,90%)] absolute left-0 right-0 top-16 shadow-lg z-40">
            <div className="px-4 py-4 space-y-2">
              <Link href={user ? "/home" : "/"} onClick={closeMobileMenu}>
                <Button
                  variant={isActive("/") || isActive("/home") ? "default" : "ghost"}
                  size="sm"
                  className={`w-full justify-start ${isActive("/") || isActive("/home") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  {t('navigation.home')}
                </Button>
              </Link>

              <Link href="/hosts" onClick={closeMobileMenu}>
                <Button
                  variant={isActive("/hosts") ? "default" : "ghost"}
                  size="sm"
                  className={`w-full justify-start ${isActive("/hosts") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t('hosts.title')}
                </Button>
              </Link>
              
              {user && (
                <Link href="/profile" onClick={closeMobileMenu}>
                  <Button
                    variant={isActive("/profile") ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start ${isActive("/profile") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    {t('navigation.profile')}
                  </Button>
                </Link>
              )}
              
              {user && (user.isAdmin || user.role === 'admin') && (
                <Link href="/admin-dashboard" onClick={closeMobileMenu}>
                  <Button
                    variant={isActive("/admin-dashboard") ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start ${isActive("/admin-dashboard") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {t('navigation.admin')}
                  </Button>
                </Link>
              )}

              <div className="border-t border-[hsl(220,13%,90%)] pt-4 mt-4">
                {user ? (
                  <>
                    <div className="text-sm text-gray-600 mb-3 px-3">
                      {user.firstName || user.email}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('navigation.logout')}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.location.href = "/api/login"}
                    className="w-full justify-start bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] animate-glow"
                  >
                    {t('navigation.login')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

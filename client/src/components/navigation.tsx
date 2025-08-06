import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./language-selector";
import {
  Home,
  User as UserIcon,
  Shield,
  Users,
  LogOut,
  Calendar as CalendarIcon,
  Menu,
  X,
  Newspaper,
  Video,
} from "lucide-react";
import type { User } from "@shared/schema";
import { useThemeConfig } from "@/hooks/useThemeConfig";
import { signOut } from "@/lib/supabase";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Mobile logo will be loaded directly from public path

export function Navigation() {
  const { user } = useAuth() as { user: User | undefined };
  const { t } = useTranslation();
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { logoUrl } = useThemeConfig();
  const { toast } = useToast();

  const switchRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await apiRequest("/api/auth/role", {
        method: "PUT",
        body: { role },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cambiar el rol",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await signOut();

      // Clear all query cache
      queryClient.clear();

      // Show success message
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });

      // Navigate to home page
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => location === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const roleOptions = [] as { value: string; label: string }[];
  if (user?.isHost) roleOptions.push({ value: "host", label: "Host" });
  if (user?.isAdmin) roleOptions.push({ value: "admin", label: "Admin" });
  if (roleOptions.length === 0)
    roleOptions.push({ value: "registered", label: "Usuario" });

  return (
    <nav className="bg-white shadow-sm border-b border-[hsl(220,13%,90%)] sticky top-0 z-50 animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src={isMobile ? "/storage/Media/ic_app_logo_foreground.webp" : "/storage/Media/dialoomblue.png"}
                alt="Dialoom"
                className="h-12 w-auto object-contain transition-all duration-300"
                style={{ maxWidth: isMobile ? "48px" : "200px" }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/">
              <Button
                variant={
                  isActive("/") || isActive("/home") ? "default" : "ghost"
                }
                size="sm"
                className={
                  isActive("/") || isActive("/home")
                    ? "bg-[hsl(188,100%,38%)] animate-glow"
                    : "hover-lift"
                }
              >
                <Home className="w-4 h-4 mr-2" />
                {t("navigation.home")}
              </Button>
            </Link>

            <Link href="/demo">
              <Button
                variant={isActive("/demo") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/demo")
                    ? "bg-[hsl(188,100%,38%)] animate-glow"
                    : "hover-lift"
                }
              >
                <Video className="w-4 h-4 mr-2" />
                {t("navigation.demo", "Demo")}
              </Button>
            </Link>

            <Link href="/hosts">
              <Button
                variant={isActive("/hosts") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/hosts")
                    ? "bg-[hsl(188,100%,38%)] animate-glow"
                    : "hover-lift"
                }
              >
                <Users className="w-4 h-4 mr-2" />
                {t("hosts.title")}
              </Button>
            </Link>

            <Link href="/news">
              <Button
                variant={isActive("/news") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/news")
                    ? "bg-[hsl(188,100%,38%)] animate-glow"
                    : "hover-lift"
                }
              >
                <Newspaper className="w-4 h-4 mr-2" />
                {t("navigation.news", "Noticias")}
              </Button>
            </Link>

            {user && (
              <Link href="/profile">
                <Button
                  variant={isActive("/profile") ? "default" : "ghost"}
                  size="sm"
                  className={
                    isActive("/profile")
                      ? "bg-[hsl(188,100%,38%)] animate-glow"
                      : "hover-lift"
                  }
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  {t("navigation.profile")}
                </Button>
              </Link>
            )}

            {user && (
              <Link href="/networking">
                <Button
                  variant={isActive("/networking") ? "default" : "ghost"}
                  size="sm"
                  className={
                    isActive("/networking")
                      ? "bg-[hsl(188,100%,38%)] animate-glow"
                      : "hover-lift"
                  }
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t("networking.title", "Networking")}
                </Button>
              </Link>
            )}

            {user && (user.isAdmin || user.role === "admin") && (
              <Link href="/admin-dashboard">
                <Button
                  variant={isActive("/admin-dashboard") ? "default" : "ghost"}
                  size="sm"
                  className={
                    isActive("/admin-dashboard")
                      ? "bg-[hsl(188,100%,38%)] animate-glow"
                      : "hover-lift"
                  }
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t("navigation.admin")}
                </Button>
              </Link>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Select
                  value={
                    user.role ||
                    (user.isHost ? "host" : user.isAdmin ? "admin" : "guest")
                  }
                  onValueChange={(value) => switchRoleMutation.mutate(value)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 hover-lift"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("navigation.logout")}
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] animate-glow"
                >
                  {t("navigation.login")}
                </Button>
              </Link>
            )}
            <div className="ml-2">
              <LanguageSelector />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && <LanguageSelector />}
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
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[hsl(220,13%,90%)] absolute left-0 right-0 top-16 shadow-lg z-40">
            <div className="px-4 py-4 space-y-2">
              {!user ? (
                // Menu for non-authenticated users: Demo, Hosts, Cómo Funciona, Comenzar Ahora, Idioma
                <>
                  <Link href="/demo" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive("/demo") ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start ${isActive("/demo") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {t("navigation.demo")}
                    </Button>
                  </Link>

                  <Link href="/hosts" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive("/hosts") ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start ${isActive("/hosts") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {t("hosts.title")}
                    </Button>
                  </Link>

                  <Link href="/news" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive("/news") ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start ${isActive("/news") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                    >
                      <Newspaper className="w-4 h-4 mr-2" />
                      {t("navigation.howItWorks", "Cómo Funciona")}
                    </Button>
                  </Link>

                  <Link href="/login" onClick={closeMobileMenu}>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full justify-start bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] animate-glow"
                    >
                      {t("navigation.getStarted", "Comenzar Ahora")}
                    </Button>
                  </Link>

                  <div className="border-t border-[hsl(220,13%,90%)] pt-4 mt-4">
                    <div className="px-3 py-2">
                      <LanguageSelector />
                    </div>
                  </div>
                </>
              ) : (
                // Menu for authenticated users
                <>
                  <Link href="/" onClick={closeMobileMenu}>
                    <Button
                      variant={
                        isActive("/") || isActive("/home") ? "default" : "ghost"
                      }
                      size="sm"
                      className={`w-full justify-start ${isActive("/") || isActive("/home") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      {t("navigation.home")}
                    </Button>
                  </Link>

                  <Link href="/demo" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive("/demo") ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start ${isActive("/demo") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {t("navigation.demo")}
                    </Button>
                  </Link>

                  <Link href="/hosts" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive("/hosts") ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start ${isActive("/hosts") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {t("hosts.title")}
                    </Button>
                  </Link>

                  <Link href="/news" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive("/news") ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start ${isActive("/news") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                    >
                      <Newspaper className="w-4 h-4 mr-2" />
                      {t("navigation.news", "Noticias")}
                    </Button>
                  </Link>

                  <Link href="/profile" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive("/profile") ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start ${isActive("/profile") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      {t("navigation.profile")}
                    </Button>
                  </Link>

                  <Link href="/networking" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive("/networking") ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start ${isActive("/networking") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {t("networking.title", "Networking")}
                    </Button>
                  </Link>

                  {(user.isAdmin || user.role === "admin") && (
                    <Link href="/admin-dashboard" onClick={closeMobileMenu}>
                      <Button
                        variant={
                          isActive("/admin-dashboard") ? "default" : "ghost"
                        }
                        size="sm"
                        className={`w-full justify-start ${isActive("/admin-dashboard") ? "bg-[hsl(188,100%,38%)]" : ""}`}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {t("navigation.admin")}
                      </Button>
                    </Link>
                  )}

                  <div className="border-t border-[hsl(220,13%,90%)] pt-4 mt-4">
                    <div className="mb-3 px-3">
                      <Select
                        value={
                          user.role ||
                          (user.isHost
                            ? "host"
                            : user.isAdmin
                              ? "admin"
                              : "guest")
                        }
                        onValueChange={(value) =>
                          switchRoleMutation.mutate(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("navigation.logout")}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

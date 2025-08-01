import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/useAdminAuth";
import { Footer } from "@/components/footer";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import HostSearch from "@/pages/host-search";
import Dashboard from "@/pages/dashboard";

import UserProfile from "@/pages/user-profile";
import AdminPanel from "@/pages/admin-panel";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminLogin from "@/pages/admin-login";
import PrivacyPolicy from "@/pages/legal/privacy-policy";
import TermsOfService from "@/pages/legal/terms-of-service";
import CookiePolicy from "@/pages/legal/cookie-policy";
import DMCA from "@/pages/legal/dmca";
import Help from "@/pages/help";
import GdprRights from "@/pages/gdpr-rights";
import VideoCallRoom from "@/pages/video-call-room";
import "./i18n/config";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { adminUser, isLoading: isAdminLoading } = useAdminAuth();
  
  const isUserOrAdminAuthenticated = isAuthenticated || !!adminUser;
  const isAnyLoading = isLoading || isAdminLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Switch>
          {/* Public routes available to everyone */}
          <Route path="/" component={isAuthenticated && !isLoading ? Home : Landing} />
          <Route path="/hosts" component={HostSearch} />
          <Route path="/user/:id" component={UserProfile} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
          
          {/* Routes that require either user or admin authentication */}
          {isUserOrAdminAuthenticated && !isAnyLoading && (
            <>
              <Route path="/home" component={Home} />
              <Route path="/profile" component={Profile} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/admin" component={Admin} />
              <Route path="/admin-panel" component={AdminPanel} />
              <Route path="/video-call/:bookingId" component={VideoCallRoom} />
            </>
          )}
          
          {/* Legal and help pages accessible to all */}
          <Route path="/legal/privacy" component={PrivacyPolicy} />
          <Route path="/legal/terms" component={TermsOfService} />
          <Route path="/legal/cookies" component={CookiePolicy} />
          <Route path="/legal/dmca" component={DMCA} />
          <Route path="/help" component={Help} />
          <Route path="/gdpr-rights" component={GdprRights} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
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
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import CookiePolicy from "@/pages/cookie-policy";
import GdprRights from "@/pages/gdpr-rights";
import "./i18n/config";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Switch>
          {isLoading || !isAuthenticated ? (
            <>
              <Route path="/" component={Landing} />
              <Route path="/hosts" component={HostSearch} />
              <Route path="/user/:id" component={UserProfile} />
            </>
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/home" component={Home} />
              <Route path="/profile" component={Profile} />
              <Route path="/hosts" component={HostSearch} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/admin" component={Admin} />
              <Route path="/admin-panel" component={AdminPanel} />
              <Route path="/user/:id" component={UserProfile} />
            </>
          )}
          {/* Legal pages accessible to all */}
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/cookie-policy" component={CookiePolicy} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

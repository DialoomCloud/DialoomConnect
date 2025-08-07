import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoomiaChat } from "@/components/loomia-chat";

import { Footer } from "@/components/footer";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/new-landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import HostSearch from "@/pages/host-search";
import Dashboard from "@/pages/dashboard";

import UserProfile from "@/pages/user-profile";
import AdminPanel from "@/pages/admin-panel";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminLogin from "@/pages/admin-login";
import LoginPage from "@/pages/login";
import PrivacyPolicy from "@/pages/legal/privacy-policy";
import TermsOfService from "@/pages/legal/terms-of-service";
import CookiePolicy from "@/pages/legal/cookie-policy";
import DMCA from "@/pages/legal/dmca";
import Help from "@/pages/help";
import GdprRights from "@/pages/gdpr-rights";
import VideoCallRoom from "@/pages/video-call-room";
import NewsPage from "@/pages/news";
import NewsArticlePage from "@/pages/news-article";
import Experts from "@/pages/experts";
import Pricing from "@/pages/pricing";
import About from "@/pages/about";
import HowItWorks from "@/pages/how-it-works";
import TestAIFeatures from "@/pages/test-ai-features";
import PaymentDemo from "@/pages/payment-demo";
import PaymentSettings from "@/pages/payment-settings";
import Demo from "@/pages/demo";
import Networking from "@/pages/networking";
import RequestHost from "@/pages/request-host";
import TestUpload from "@/pages/test-upload";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import "./i18n/config";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Switch>
          {/* Public routes available to everyone */}
          <Route path="/" component={Home} />
          <Route path="/demo" component={Demo} />
          <Route path="/hosts" component={HostSearch} />
          <Route path="/user/:id" component={UserProfile} />
          <Route path="/host/:id" component={UserProfile} />
          <Route path="/login" component={LoginPage} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/news" component={NewsPage} />
          <Route path="/news/:slug" component={NewsArticlePage} />
          <Route path="/experts" component={Experts} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/about" component={About} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/test-ai" component={TestAIFeatures} />
          <Route path="/payment-demo" component={PaymentDemo} />
          <Route path="/request-host" component={RequestHost} />
          <Route path="/test-upload" component={TestUpload} />
          
          {/* Routes that require authentication */}
          <Route path="/landing" component={Landing} />
          <Route path="/home">
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          </Route>
          <Route path="/profile">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/networking">
            <ProtectedRoute>
              <Networking />
            </ProtectedRoute>
          </Route>
          <Route path="/payment-settings">
            <ProtectedRoute>
              <PaymentSettings />
            </ProtectedRoute>
          </Route>
          <Route path="/admin">
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          </Route>
          <Route path="/admin-panel">
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          </Route>
          <Route path="/video-call/:bookingId">
            <ProtectedRoute>
              <VideoCallRoom />
            </ProtectedRoute>
          </Route>
          
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
      <LoomiaChat />
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

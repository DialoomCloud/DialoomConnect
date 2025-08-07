import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user?.isAdmin) {
        setLocation("/");
      } else {
        // Redirect to admin dashboard
        setLocation("/admin-dashboard");
      }
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(188,100%,38%)]"></div>
      </div>
    );
  }

  return null;
}
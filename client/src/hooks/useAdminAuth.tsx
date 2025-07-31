import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { apiRequest } from "../lib/queryClient";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  role: string;
};

type AdminAuthContextType = {
  adminUser: AdminUser | null;
  isLoading: boolean;
  checkAdminSession: () => Promise<void>;
  setAdminUser: (user: AdminUser | null) => void;
};

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminSession = async () => {
    try {
      const response = await apiRequest("/api/admin/check-session", {
        method: "GET",
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminUser(data.user);
      } else {
        setAdminUser(null);
      }
    } catch (error) {
      setAdminUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAdminSession();
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isLoading,
        checkAdminSession,
        setAdminUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
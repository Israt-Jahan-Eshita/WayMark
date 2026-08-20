"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage on mount
    const authStatus = localStorage.getItem("waymark_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      const isProtected = pathname.startsWith("/audit/new");
      
      if (isProtected && !isAuthenticated) {
        router.push("/login");
      } else if (isAuthenticated && pathname === "/login") {
        router.push("/audit/new");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = () => {
    localStorage.setItem("waymark_auth", "true");
    setIsAuthenticated(true);
    router.push("/audit/new");
  };

  const logout = () => {
    localStorage.removeItem("waymark_auth");
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

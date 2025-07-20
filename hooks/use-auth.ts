"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface Admin {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore from localStorage on mount (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("auth_token");
    const storedAdmin = localStorage.getItem("admin_data");

    if (storedToken) setToken(storedToken);
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch {
        localStorage.removeItem("admin_data");
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error || "Login failed");
    }

    const { token, admin } = await response.json();
    localStorage.setItem("auth_token", token);
    localStorage.setItem("admin_data", JSON.stringify(admin));
    setToken(token);
    setAdmin(admin);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_data");
    setToken(null);
    setAdmin(null);
  };

  const contextValue: AuthContextType = {
    admin,
    token,
    login,
    logout,
    isLoading,
  };

  // No JSX — safe in .ts
  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

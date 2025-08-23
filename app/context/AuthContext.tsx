"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async (token: string) => {
      // Replace with your actual API endpoint and logic
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        console.log('[AuthContext] Validating token:', token);
        const res = await fetch(`${API_BASE_URL}/api/auth/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('[AuthContext] Validation response status:', res.status);
        if (res.ok) {
          setTokenState(token);
        } else {
          setTokenState(null);
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error('[AuthContext] Error during token validation:', error);
        setTokenState(null);
        localStorage.removeItem("authToken");
      }
    };

    try {
      const storedToken = localStorage.getItem("authToken");
      console.log('[AuthContext] Loaded token from localStorage:', storedToken);
      if (storedToken) {
        validateToken(storedToken);
      } else {
        setTokenState(null);
      }
    } catch (error) {
      console.error("[AuthContext] Could not access localStorage", error);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("authToken", newToken);
    } else {
      localStorage.removeItem("authToken");
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
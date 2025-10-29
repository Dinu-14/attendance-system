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
  isLoading: true, // Start in a loading state
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use an async IIFE to allow 'await' inside useEffect
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        console.log('[AuthContext] Loaded token from localStorage:', storedToken);

        if (storedToken) {
          // Now we properly AWAIT the validation to finish
          await validateToken(storedToken);
        } else {
          // If no token, we are done, set token to null
          setTokenState(null);
        }
      } catch (error) {
        console.error("[AuthContext] Error during auth initialization:", error);
        // Ensure state is cleared on error
        setTokenState(null);
        localStorage.removeItem("authToken");
      } finally {
        // This 'finally' block now correctly waits for the 'await' to complete
        setIsLoading(false);
        console.log('[AuthContext] Auth initialization complete.');
      }
    };

    const validateToken = async (tokenToValidate: string) => {
      // This function is mostly the same, just made it internal to the IIFE logic
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        console.log('[AuthContext] Validating token:', tokenToValidate);
        const res = await fetch(`${API_BASE_URL}/api/auth/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenToValidate}`,
          },
        });
        console.log('[AuthContext] Validation response status:', res.status);
        if (res.ok) {
          setTokenState(tokenToValidate);
        } else {
          // If validation fails, clear the token
          setTokenState(null);
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error('[AuthContext] Error during token validation:', error);
        // Also clear token on network or other errors
        setTokenState(null);
        localStorage.removeItem("authToken");
      }
    };

    initializeAuth();
  }, []); // Empty dependency array ensures this runs only once on mount

  const setToken = (newToken: string | null) => {
    console.log('[AuthContext] Setting new token:', newToken);
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
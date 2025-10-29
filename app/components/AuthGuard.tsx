// components/AuthGuard.tsx
"use client";

import { useAuth } from "..//context/AuthContext"; // Adjust path if needed
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import FullPageLoader from "./FullPageLoader"; // Make sure you have this component

const PUBLIC_ROUTES = ['/login', '/register']; // Add any other public routes

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Log state changes to see the flow in your console
    console.log(`[AuthGuard] isLoading: ${isLoading}, token: ${!!token}, pathname: ${pathname}`);

    // We do nothing until the loading is complete.
    if (isLoading) {
      return;
    }

    const isPublic = PUBLIC_ROUTES.includes(pathname);

    // If there is NO token and the route is NOT public, redirect to login.
    if (!token && !isPublic) {
      console.log("[AuthGuard] No token on protected route. Redirecting to /login.");
      router.push('/login');
    }

    // If there IS a token and the route IS public (like /login), redirect to dashboard.
    if (token && isPublic) {
      console.log("[AuthGuard] Token found on public route. Redirecting to /dashboard.");
      router.push('/dashboard');
    }
  }, [token, isLoading, router, pathname]);


  // THIS IS THE MOST IMPORTANT PART OF THE FIX
  // 1. While the auth state is loading, render the loader and nothing else.
  if (isLoading) {
    return <FullPageLoader />;
  }

  // 2. If the user is unauthenticated AND on a protected route,
  // the useEffect is already handling the redirect.
  // Returning null prevents a flash of the protected page content.
  const isPublic = PUBLIC_ROUTES.includes(pathname);
  if (!token && !isPublic) {
    return null; 
  }

  // 3. If all checks pass, render the children.
  return <>{children}</>;
}
// app/(portal)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { cn } from "@/lib/utils";

// ===== SCROLLBAR STYLES =====
const scrollbarStyles = `
  [&::-webkit-scrollbar]:w-1.5
  [&::-webkit-scrollbar]:h-1.5
  [&::-webkit-scrollbar-track]:bg-muted/20
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-muted-foreground/25
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/40
  dark:[&::-webkit-scrollbar-track]:bg-muted/15
  dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30
  dark:[&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50
  scrollbar-width:thin
  scrollbar-color:hsl(var(--muted-foreground)/0.25) transparent
`;

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, token, refreshAccessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let isRefreshing = false;

    const checkTokenExpiration = async () => {
      try {
        const payloadSegment = token.split(".")[1];
        if (!payloadSegment) return;
        const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(
          base64.length + ((4 - (base64.length % 4)) % 4),
          "=",
        );
        const decoded = JSON.parse(window.atob(padded)) as { exp?: number };

        if (decoded.exp && decoded.exp * 1000 <= Date.now() && !isRefreshing) {
          isRefreshing = true;
          await refreshAccessToken();
          isRefreshing = false;
        }
      } catch {
        if (!isRefreshing) {
          isRefreshing = true;
          await refreshAccessToken();
          isRefreshing = false;
        }
      }
    };

    checkTokenExpiration();

    const interval = setInterval(checkTokenExpiration, 5000);

    const handleFocus = () => checkTokenExpiration();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", checkTokenExpiration);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", checkTokenExpiration);
    };
  }, [isAuthenticated, token, refreshAccessToken]);

  // Deshabilitar Ctrl+B (opcional)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SocketProvider>
      <AppShell>
        <div
          className={cn(
            "h-full min-h-0 w-full min-w-0 overflow-x-hidden overflow-y-auto",
            scrollbarStyles,
          )}
        >
          {children}
        </div>
      </AppShell>
    </SocketProvider>
  );
}

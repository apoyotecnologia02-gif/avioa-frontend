"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarProvider } from "@/components/ui/sidebar";

function AppShellContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh w-full max-w-[100vw] overflow-hidden bg-background">
      {/* 
        Contenedor del Sidebar:
        - Oculto en móvil (el Sidebar de shadcn usa un Sheet para móvil automáticamente).
        - Ancho fijo en escritorio. Usamos la variable nativa de shadcn.
      */}
      <div className="relative hidden h-full w-[--sidebar-width] shrink-0 md:block">
        <Sidebar />
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  storageKey?: string;
}

export function AppShell({
  children,
  defaultOpen = true, // Forzamos que inicie abierto
  storageKey = "portal-sidebar-state",
}: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  );
}

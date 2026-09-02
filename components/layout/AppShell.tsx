"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { state, setOpen, isMobile } = useSidebar();

  const supportsHover = () =>
    !isMobile &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const handleSidebarMouseEnter = () => {
    if (supportsHover()) setOpen(true);
  };

  const handleSidebarMouseLeave = () => {
    if (supportsHover()) setOpen(false);
  };

  const isCollapsed = state === "collapsed";
  const SIDEBAR_EXPANDED = 240;
  const SIDEBAR_COLLAPSED = 56;
  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <div className="flex h-svh w-full max-w-[100vw] overflow-hidden bg-background">
      <div
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className="relative h-full w-0 shrink-0 md:w-[var(--app-sidebar-width)] md:transition-[width] md:duration-300 md:ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={
          {
            "--app-sidebar-width": `${sidebarWidth}px`,
          } as React.CSSProperties
        }
      >
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
  defaultOpen = false,
  storageKey = "portal-sidebar-state"
}: AppShellProps) {
  return (
    <SidebarProvider 
      defaultOpen={defaultOpen}
    >
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  );
}

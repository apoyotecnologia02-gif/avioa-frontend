"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    // <div className="flex h-screen bg-background">
    //   <Sidebar />
    //   <div className="flex flex-1 flex-col overflow-hidden">
    //     <Header />
    //     <main className="flex-1 overflow-y-auto p-6">{children}</main>
    //   </div>
    // </div>
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

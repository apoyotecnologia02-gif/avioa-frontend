"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Coins,
  ClipboardPen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isAdminRole, isLeaderOrManagerOrAdminRole } from "@/lib/roles";
import { ADMIN_ENTRY } from "@/lib/admin/modules";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/forms", label: "Formularios", icon: FileText },
  { href: "/points", label: "Puntos", icon: Coins }
];

const PointRequestNavItems: NavItem = { href: '/points-request', label: 'Solicitudes de puntos', icon: ClipboardPen }

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const adminNavItems = isAdminRole(user?.role)
    ? [{ href: ADMIN_ENTRY.href, label: ADMIN_ENTRY.label, icon: ADMIN_ENTRY.icon }]
    : [];
  const pointRequestsNavItems = isLeaderOrManagerOrAdminRole(user?.role)
    ? [{ href: PointRequestNavItems.href, label: PointRequestNavItems.label, icon: PointRequestNavItems.icon }]
    : [];
  const allNavItems = [...navItems, ...adminNavItems, ...pointRequestsNavItems];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="relative flex h-9 w-full max-w-[180px] items-center"
            >
              <Image
                src="/avioa-logo.png"
                alt="avioa Agencia de Viajes logo"
                width={360}
                height={180}
                className="h-9 w-auto max-w-full object-contain object-left"
                priority
              />
            </Link>
          )}
          {collapsed && (
            <Link
              href="/dashboard"
              className="mx-auto flex h-8 w-8 items-center justify-center"
            >
              <Image
                src="/avioa-logo.png"
                alt="avioa Agencia de Viajes logo"
                width={120}
                height={60}
                className="h-8 w-8 object-contain"
                priority
              />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {allNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* User info & logout */}
        <div className="border-t border-border p-2">
          {user && !collapsed && (
            <div className="mb-2 px-3 py-2">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={collapsed ? "icon" : "default"}
                onClick={logout}
                className={cn(
                  "w-full text-muted-foreground hover:text-destructive",
                  collapsed ? "justify-center" : "justify-start gap-3",
                )}
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span>Cerrar sesión</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Cerrar sesión</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Collapse toggle */}
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

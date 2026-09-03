"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Coins,
  ClipboardPen,
  Clock,
} from "lucide-react";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isAdminRole, isLeaderOrManagerOrAdminRole } from "@/lib/roles";
import {
  NAV_SECTIONS,
  type NavGroup,
  type NavLeaf,
  type NavVisibility,
} from "@/lib/navigation";
import { ADMIN_ENTRY } from "@/lib/admin/modules";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const OPEN_GROUPS_KEY = "portal_sidebar_open_groups";

function canSee(
  visibility: NavVisibility | undefined,
  user: { role?: unknown; isLeader?: boolean } | null | undefined,
): boolean {
  if (!visibility || visibility === "all") return true;
  if (visibility === "leader") return isLeaderOrManagerOrAdminRole(user);
  if (visibility === "admin") return isAdminRole(user?.role);
  return false;
}

function isLeafActive(leaf: NavLeaf, pathname: string): boolean {
  if (leaf.exact) return pathname === leaf.href;
  return pathname === leaf.href || pathname.startsWith(leaf.href + "/");
}

function isGroupActive(group: NavGroup, pathname: string): boolean {
  if (group.href) {
    return pathname === group.href || pathname.startsWith(group.href + "/");
  }
  return (group.items ?? []).some((item) => isLeafActive(item, pathname));
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/forms", label: "Formularios", icon: FileText },
  { href: "/points", label: "Puntos", icon: Coins },
  { href: "/overtime", label: "Control de Horas", icon: Clock },
];

const PointRequestNavItems: NavItem = {
  href: "/points-request",
  label: "Solicitudes de puntos",
  icon: ClipboardPen,
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { state, isMobile } = useSidebar();
  const collapsed = !isMobile && state === "collapsed";

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(OPEN_GROUPS_KEY);
      if (stored) setOpenGroups(JSON.parse(stored));
    } catch {
      /** nope */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    for (const section of NAV_SECTIONS) {
      for (const group of section.groups) {
        if (group.items && isGroupActive(group, pathname)) {
          setOpenGroups((prev) =>
            prev[group.key] ? prev : { ...prev, [group.key]: true },
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hydrated]);

  const toggleGroup = (key: string, open: boolean) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [key]: open };
      try {
        localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(next));
      } catch {
        /** nope */
      }
      return next;
    });
  };

  return (
    <SidebarPrimitive collapsible="icon">
      {/* Logo */}
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
        <Link
          href="/dashboard"
          className="flex items-center justify-center px-2 group-data-[collapsible=icon]:px-0"
        >
          <Image
            src="/avioa-logo.png"
            alt="avioa Agencia de Viajes logo"
            width={360}
            height={180}
            className="h-9 w-auto max-w-full object-contain group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
            priority
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV_SECTIONS.map((section, sectionIndex) => {
          if (!canSee(section.visibility, user)) return null;

          const visibleGroups = section.groups.filter((g) =>
            canSee(g.visibility, user),
          );

          if (visibleGroups.length === 0) return null;

          return (
            <SidebarGroup key={section.label ?? `section-${sectionIndex}`}>
              {section.label && (
                <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              )}
              <SidebarMenu>
                {visibleGroups.map((group) => {
                  const active = isGroupActive(group, pathname);
                  const Icon = group.icon;

                  // caso 1: link directo (sin submenu)
                  if (!group.items || group.items.length === 0) {
                    if (!group.href) return null;
                    return (
                      <SidebarMenuItem key={group.key}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={group.label}
                        >
                          <Link href={group.href}>
                            <Icon />
                            <span>{group.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  // caso sidebar colapsado a iconos
                  if (collapsed) {
                    const firstItem = group.items.find((i) =>
                      canSee(i.visibility, user),
                    );
                    if (!firstItem) return null;
                    return (
                      <SidebarMenuItem key={group.key}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={group.label}
                        >
                          <Link href={firstItem.href}>
                            <Icon />
                            <span>{group.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  // caso 2: grupo desplegable con submenu
                  const isOpen = openGroups[group.key] ?? active;
                  return (
                    <Collapsible
                      key={group.key}
                      asChild
                      open={isOpen}
                      onOpenChange={(open) => toggleGroup(group.key, open)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={group.label}
                            isActive={active && !isOpen}
                          >
                            <Icon />
                            <span>{group.label}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {group.items
                              .filter((item) =>
                                canSee(item.visibility, user),
                              )
                              .map((item) => (
                                <SidebarMenuSubItem key={item.href}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isLeafActive(item, pathname)}
                                  >
                                    <Link href={item.href}>
                                      <span>{item.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* usuario + cerrar sesion */}
      <SidebarFooter className="border-t border-sidebar-border">
        {user && !collapsed && (
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Cerrar sesión"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* barra lateral clickeable para colapsar/expandir */}
      <SidebarRail />
    </SidebarPrimitive>
  );
}

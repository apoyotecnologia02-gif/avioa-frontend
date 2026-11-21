"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, LogOut } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { isAdminRole, isLeaderOrManagerOrAdminRole } from "@/lib/roles";
import {
  NAV_SECTIONS,
  type NavGroup,
  type NavLeaf,
  type NavVisibility,
} from "@/lib/navigation";
import { hasModuleAccess, type UserWithModules } from "@/lib/permissions";
import type { AppModuleKey } from "@/lib/modules";

const OPEN_GROUPS_KEY = "portal_sidebar_open_groups";

function canSee(
  visibility: NavVisibility | undefined,
  user: UserWithModules | null | undefined,
): boolean {
  if (!visibility || visibility === "all") return true;
  if (visibility === "leader") return isLeaderOrManagerOrAdminRole(user);
  if (visibility === "admin") return isAdminRole(user?.role);
  return false;
}

function canSeeItem(
  item: { visibility?: NavVisibility; module?: AppModuleKey },
  user: UserWithModules | null | undefined,
): boolean {
  if (!item.module) return canSee(item.visibility, user);
  if (!hasModuleAccess(user, item.module)) return false;
  return canSee(item.visibility, user);
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

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isMobile, setOpenMobile, setOpen } = useSidebar();

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

  // Abrir automáticamente el grupo activo
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

  // En móvil: cerrar el sidebar al cambiar de ruta
  useEffect(() => {
    if (!isMobile) return;
    setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

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

  const handleLogout = () => {
    if (isMobile) setOpen(false);
    logout();
  };

  return (
    <SidebarPrimitive collapsible={isMobile ? "offcanvas" : "none"}>
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border sm:h-16">
        <Link
          href="/dashboard"
          className="flex items-center justify-center px-1 sm:px-2"
          onClick={() => isMobile && setOpenMobile(false)}
        >
          <Image
            src="/avioa-logo.png"
            alt="avioa Agencia de Viajes logo"
            width={360}
            height={180}
            className="h-8 w-auto max-w-full object-contain sm:h-9"
            priority
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 sm:px-2">
        {NAV_SECTIONS.map((section, sectionIndex) => {
          const visibleGroups = section.groups
            .map((group) => {
              if (!canSeeItem(group, user)) return null;
              if (!group.items || group.items.length === 0) {
                if (!group.href) return null;
                return canSeeItem(group, user)
                  ? { group, items: [] as NavLeaf[] }
                  : null;
              }

              const visibleItems = group.items.filter((item) =>
                canSeeItem(item, user),
              );

              if (visibleItems.length === 0) return null;
              return { group, items: visibleItems };
            })
            .filter(
              (g): g is { group: NavGroup; items: NavLeaf[] } => g !== null,
            );

          if (visibleGroups.length === 0) return null;

          return (
            <SidebarGroup key={section.label ?? `section-${sectionIndex}`}>
              {section.label && (
                <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              )}
              <SidebarMenu>
                {visibleGroups.map(({ group, items: visibleItems }) => {
                  const active = isGroupActive(group, pathname);
                  const Icon = group.icon;

                  // caso 1: link directo (sin submenu)
                  if (!group.items || group.items.length === 0) {
                    if (!group.href) return null;
                    return (
                      <SidebarMenuItem key={group.key}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link
                            href={group.href}
                            onClick={() =>
                              isMobile && setOpenMobile(false)
                            }
                          >
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
                          <SidebarMenuButton isActive={active && !isOpen}>
                            <Icon />
                            <span>{group.label}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {visibleItems.map((item) => (
                              <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isLeafActive(item, pathname)}
                                >
                                  {item.external ? (
                                    <a
                                      href={item.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <span>{item.label}</span>
                                    </a>
                                  ) : (
                                    <Link
                                      href={item.href}
                                      onClick={() =>
                                        isMobile && setOpenMobile(false)
                                      }
                                    >
                                      <span>{item.label}</span>
                                    </Link>
                                  )}
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

      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <div className="min-w-0 px-2 py-1.5">
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
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
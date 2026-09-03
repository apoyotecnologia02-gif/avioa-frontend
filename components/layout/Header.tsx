"use client";

import Link from "next/link";
import { Bell, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore } from "@/store/notificationStore";
import { useOvertimeStore } from "@/store/overtimeStore";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect } from "react";

interface Breadcrumb {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [];

  const labelMap: Record<string, string> = {
    dashboard: "Inicio",
    forms: "Formularios",
    admin: "Administración",
    users: "Usuarios",
    passwords: "Contraseñas",
    rewards: "Recompensas",
    history: "Historial",
    points: "Puntos",
    "my-requests": "Solicitudes",
    overtime: "Control de Horas",
    leaves: "Vacaciones y Ausencias",
    colaboradores: "Colaboradores",
    profile: "Perfil",
    "points-request": "Solicitudes de puntos",
    approvePost: "Aprobar Publicaciones",
    trash: "Papelera",
    cotizador: "Cotizador",
    vacations: "Saldo de vacaciones",
  };

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    const label =
      labelMap[segment] || (segment.length > 20 ? "Detalle" : segment);

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return breadcrumbs;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { triggerModal } = useOvertimeStore();
  const {
    unreadCount,
    notifications,
    markAllAsRead,
    markAsRead,
    fetchNotifications,
  } = useNotificationStore();
  const breadcrumbs = getBreadcrumbs(pathname);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 sm:h-16 sm:px-4 lg:px-6">
      {/* Left side - Breadcrumbs + Menu button */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* SidebarTrigger - controla la sidebar de shadcn */}
        <SidebarTrigger className="md:hidden" />

        <span className="truncate text-sm font-medium md:hidden">
          {breadcrumbs[breadcrumbs.length - 1]?.label ?? "Portal"}
        </span>

        {/* Breadcrumbs - Oculto en móvil */}
        <nav className="hidden min-w-0 items-center gap-1 truncate text-sm md:flex">
          {breadcrumbs.map((crumb, index) => (
            <span
              key={index}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground truncate">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative outline-none"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[min(20rem,calc(100vw-1.5rem))]"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-semibold text-sm">Notificaciones</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    markAllAsRead();
                  }}
                >
                  Marcar todas como leídas
                </Button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No tienes notificaciones
                </div>
              ) : (
                notifications.map((notification) => {
                  const targetId =
                    notification.notificationId ||
                    (notification as any).id ||
                    (notification as any)._id;

                  return (
                    <DropdownMenuItem
                      key={targetId}
                      className={`flex flex-col items-start gap-1 p-4 cursor-pointer border-b last:border-0 ${!notification.isRead ? "bg-primary/5" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();

                        if (targetId && !notification.isRead) {
                          markAsRead(targetId);
                        }

                        switch (notification.type) {
                          case "POINT_REQUEST":
                            if (pathname !== "/points-request") {
                              router.push("/points-request");
                            }
                            break;

                          case "POINT_REQUEST_APPROVED":
                          case "POINT_REQUEST_REJECTED":
                            if (pathname !== "/points/my-requests") {
                              router.push("/points/my-requests");
                            }
                            break;

                          case "OVERTIME_REQUEST":
                          case "OVERTIME_REQUEST_APPROVED":
                          case "OVERTIME_REQUEST_REJECTED":
                            const overtimeTarget = "/overtime";
                            if (pathname !== overtimeTarget) {
                              router.push(overtimeTarget);
                              setTimeout(() => {
                                triggerModal();
                              }, 300);
                            } else {
                              triggerModal();
                            }
                            break;

                          case "LEAVE_REQUEST_RECEIVED":
                          case "LEAVE_REQUEST_APPROVED":
                          case "LEAVE_REQUEST_REJECTED":
                            if (pathname !== "/leaves") {
                              router.push("/leaves");
                            }
                            break;
                        }
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-sm">
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </span>
                    </DropdownMenuItem>
                  );
                })
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 sm:pl-2 sm:pr-3">
              <Avatar className="h-8 w-8">
                {user?.avatarUrl && (
                  <AvatarImage
                    src={user.avatarUrl}
                    alt={user.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-300 text-xs">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              {user && (
                <span className="hidden text-sm font-medium md:inline-block">
                  {user.name}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

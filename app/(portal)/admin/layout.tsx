"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/roles";
import { useAuth } from "@/hooks/useAuth";
import { hasModuleAccess } from "@/lib/permissions";
import { AppModuleKey } from "@/lib/modules";
import { ADMIN_MODULES } from "@/lib/admin/modules";

const ADMIN_MODULES_NAV: AppModuleKey[] = [
  "USERS_ADMIN",
  "USERS_ADMIN_REWARDS",
  "USERS_ADMIN_VACATIONS",
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // const router = useRouter()
  // const { user, isLoading } = useAuth()

  // const isAdmin = isAdminRole(user?.role)

  // useEffect(() => {
  //   if (!isLoading && !isAdmin) {
  //     router.replace('/dashboard')
  //   }
  // }, [isAdmin, isLoading, router])

  // if (isLoading) return null

  const router = useRouter();
  const { user, isLoading } = useAuth();

  const canEnterAdmin =
    !isLoading && ADMIN_MODULES_NAV.some((m) => hasModuleAccess(user, m));

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    if (!canEnterAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, canEnterAdmin, router]);

  if (isLoading) return null;

  const visibleAdminModules = ADMIN_MODULES.filter(
    (mod) => !mod.module || hasModuleAccess(user, mod.module),
  );

  if (!canEnterAdmin) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <div className="mb-2 flex items-center gap-2 text-destructive">
          <ShieldAlert className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Acceso restringido</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Solo los usuarios autorizados pueden acceder a la sección de
          administración.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Administración
        </h1>
        <p className="text-muted-foreground">
          Módulo central para operaciones administrativas del portal.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleAdminModules.map((module) => {
          const active =
            pathname === module.href || pathname.startsWith(`${module.href}/`);

          return (
            <Button
              key={module.key}
              asChild
              variant={active ? "default" : "outline"}
              size="sm"
            >
              <Link href={module.href}>{module.title}</Link>
            </Button>
          );
        })}
      </div>

      {children}
    </div>
  );
}

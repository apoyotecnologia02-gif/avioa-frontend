"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ADMIN_MODULES } from "@/lib/admin/modules";
import { useAuth } from "@/hooks/useAuth";
import { hasModuleAccess } from "@/lib/permissions";

export default function AdminPage() {
  const { user } = useAuth();

  const visibleModules = ADMIN_MODULES.filter(
    (module) => !module.module || hasModuleAccess(user, module.module),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {visibleModules.map((module) => {
        const Icon = module.icon;
        return (
          <Card key={module.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {module.title}
              </CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={module.href}>Abrir módulo</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

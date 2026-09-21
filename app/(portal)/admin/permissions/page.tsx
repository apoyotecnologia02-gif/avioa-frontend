"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/axios";
import { APP_MODULES, AppModuleKey } from "@/lib/modules";
import { Role, User, UserStatus } from "@/types/user.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Search, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type UsersResponse = {
  userId: string;
  modules: AppModuleKey[];
};

export default function AdminsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedModules, setSelectedModules] = useState<Set<AppModuleKey>>(
    new Set(),
  );

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get<User[]>("/admin/users");
      return data;
    },
  });

  const { data: userPerms, isFetching: loadingPerms } = useQuery({
    queryKey: ["user-s", selectedUser?.userId],
    enabled: !!selectedUser?.userId,
    queryFn: async () => {
      const { data } = await api.get<UsersResponse>(
        `/admin/users/${selectedUser!.userId}/permissions`,
        { skip401Redirect: true },
      );
      return data;
    },
  });

  useEffect(() => {
    if (userPerms) {
      setSelectedModules(new Set(userPerms.modules ?? []));
    }
  }, [userPerms]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return;
      await api.put(`/admin/users/${selectedUser.userId}/permissions`, {
        modules: Array.from(selectedModules),
      });
    },

    onSuccess: () => {
      toast({ title: "Permisos actualizados" });
      queryClient.invalidateQueries({
        queryKey: ["user-s", selectedUser?.userId],
      });
    },
    onError: () => {
      toast({
        title: "Error al guardar",
        description: "No se pudieron actualizar los permisos",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q),
    );
  }, [users, search]);

  function toggleModule(key: AppModuleKey) {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAll() {
    setSelectedModules(new Set(APP_MODULES.map((m) => m.key)));
  }

  function clearAll() {
    setSelectedModules(new Set());
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Permisos por módulo</h2>
        <p className="text-sm text-muted-foreground">
          Asigna acceso a módulos específicos sin promover al usuario a ADMIN.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Usuarios</CardTitle>
          <CardDescription>
            Selecciona un usuario para editar sus módulos.
          </CardDescription>
          <div className="relative mt-2 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar por nombre, correo o rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando usuarios...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                      {user.role === Role.ADMIN && (
                        <Badge className="ml-1" variant="default">
                          acceso total
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === UserStatus.ACTIVE
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={user.role === Role.ADMIN}
                        onClick={() => setSelectedUser(user)}
                      >
                        <Shield className="mr-1.5 h-3.5 w-3.5" />
                        Permisos
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sheet de edición */}
      <Sheet
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
      >
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Permisos de módulo</SheetTitle>
            <SheetDescription>
              {selectedUser?.name} · {selectedUser?.email}
            </SheetDescription>
          </SheetHeader>

          {loadingPerms ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando permisos...
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={selectAll}
                >
                  Marcar todos
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={clearAll}
                >
                  Limpiar
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                {APP_MODULES.map((mod) => {
                  const checked = selectedModules.has(mod.key);
                  return (
                    <div
                      key={mod.key}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <Checkbox
                        id={mod.key}
                        checked={checked}
                        onCheckedChange={() => toggleModule(mod.key)}
                      />
                      <div className="grid gap-0.5">
                        <Label
                          htmlFor={mod.key}
                          className="cursor-pointer font-medium"
                        >
                          {mod.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <SheetFooter className="mt-6">
            <Button
              className="w-full"
              disabled={saveMutation.isPending || loadingPerms}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar permisos
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

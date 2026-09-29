"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  Loader2,
  Save,
  Search,
  Shield,
  ShieldAlert,
} from "lucide-react";

import { api } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import {
  APP_MODULES,
  MODULE_CATEGORIES,
  getModuleActions,
  type AppModuleAction,
  type AppModuleKey,
  type ModuleCategory,
} from "@/lib/modules";
import { cn } from "@/lib/utils";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Role, User, UserStatus } from "@/types/user.types";

// ─────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────

type UsersResponse = {
  userId: string;
  modules: AppModuleKey[];
  /** Acciones extra por módulo. Read se infiere de `modules`. */
  actions?: Partial<Record<AppModuleKey, AppModuleAction[]>>;
};

type ModulePerms = Set<AppModuleAction>;

// ─────────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────────

export default function AdminsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [userSearch, setUserSearch] = useState("");
  const [moduleSearch, setModuleSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [selectedModules, setSelectedModules] = useState<Set<AppModuleKey>>(
    new Set(),
  );
  const [selectedActions, setSelectedActions] = useState<
    Map<AppModuleKey, ModulePerms>
  >(new Map());

  // ── Usuarios ────────────────────────────────────────────────────
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get<User[]>("/admin/users");
      return data;
    },
  });

  // ── Permisos del usuario seleccionado ───────────────────────────
  const { data: userPerms, isFetching: loadingPerms } = useQuery({
    queryKey: ["user-permissions", selectedUser?.userId],
    enabled: !!selectedUser?.userId,
    queryFn: async () => {
      const { data } = await api.get<UsersResponse>(
        `/admin/users/${selectedUser!.userId}/permissions`,
        { skip401Redirect: true },
      );
      return data;
    },
  });

  // Hidratar estado local
  useEffect(() => {
    if (!userPerms) return;
    setSelectedModules(new Set(userPerms.modules ?? []));
    const map = new Map<AppModuleKey, ModulePerms>();
    for (const [k, v] of Object.entries(userPerms.actions ?? {})) {
      if (Array.isArray(v) && v.length > 0) {
        map.set(k as AppModuleKey, new Set(v));
      }
    }
    setSelectedActions(map);
  }, [userPerms]);

  // ── Guardar ─────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return;
      const actions: Record<string, AppModuleAction[]> = {};
      for (const [k, v] of selectedActions.entries()) {
        if (v.size > 0) actions[k] = Array.from(v);
      }
      await api.put(`/admin/users/${selectedUser.userId}/permissions`, {
        modules: Array.from(selectedModules),
        actions,
      });
    },
    onSuccess: () => {
      toast({ title: "Permisos actualizados" });
      queryClient.invalidateQueries({
        queryKey: ["user-permissions", selectedUser?.userId],
      });
      closeDialog();
    },
    onError: () => {
      toast({
        title: "Error al guardar",
        description: "No se pudieron actualizar los permisos",
        variant: "destructive",
      });
    },
  });

  // ── Dirty check ─────────────────────────────────────────────────
  const hasChanges = useMemo(() => {
    if (!userPerms) return false;

    const initialModules = new Set(userPerms.modules ?? []);
    if (initialModules.size !== selectedModules.size) return true;
    for (const m of initialModules) if (!selectedModules.has(m)) return true;

    const norm = (obj: Record<string, string[]>) =>
      JSON.stringify(
        Object.fromEntries(
          Object.entries(obj)
            .filter(([, v]) => v.length > 0)
            .map(([k, v]) => [k, [...v].sort()])
            .sort(([a], [b]) => String(a).localeCompare(String(b))),
        ),
      );

    const currentActions: Record<string, string[]> = {};
    for (const [k, v] of selectedActions.entries()) {
      if (v.size) currentActions[k] = Array.from(v);
    }

    const initialActions: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(userPerms.actions ?? {})) {
      if (v?.length) initialActions[k] = [...v];
    }

    return norm(currentActions) !== norm(initialActions);
  }, [userPerms, selectedModules, selectedActions]);

  // ── Handlers ────────────────────────────────────────────────────
  function closeDialog() {
    setSelectedUser(null);
    setSelectedModules(new Set());
    setSelectedActions(new Map());
    setModuleSearch("");
  }

  function handleOpenChange(open: boolean) {
    if (open) return;
    if (hasChanges) {
      const ok = window.confirm(
        "Tienes cambios sin guardar. ¿Cerrar de todas formas?",
      );
      if (!ok) return;
    }
    closeDialog();
  }

  function toggleModule(key: AppModuleKey) {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        // limpiar acciones asociadas
        setSelectedActions((a) => {
          const na = new Map(a);
          na.delete(key);
          return na;
        });
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function toggleAction(module: AppModuleKey, action: AppModuleAction) {
    setSelectedActions((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(module) ?? []);
      if (set.has(action)) set.delete(action);
      else set.add(action);
      if (set.size === 0) next.delete(module);
      else next.set(module, set);
      return next;
    });
  }

  function toggleCategory(category: ModuleCategory) {
    const catMods = APP_MODULES.filter((m) => m.category === category);
    const allSelected = catMods.every((m) => selectedModules.has(m.key));

    setSelectedModules((prev) => {
      const next = new Set(prev);
      catMods.forEach((m) => {
        if (allSelected) next.delete(m.key);
        else next.add(m.key);
      });
      return next;
    });

    if (allSelected) {
      setSelectedActions((prev) => {
        const next = new Map(prev);
        catMods.forEach((m) => next.delete(m.key));
        return next;
      });
    }
  }

  function selectAll() {
    setSelectedModules(new Set(APP_MODULES.map((m) => m.key)));
  }

  function clearAll() {
    setSelectedModules(new Set());
    setSelectedActions(new Map());
  }

  // ── Filtros ─────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q),
    );
  }, [users, userSearch]);

  const groupedModules = useMemo(() => {
    const q = moduleSearch.trim().toLowerCase();
    const source = q
      ? APP_MODULES.filter(
          (m) =>
            m.label.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.key.toLowerCase().includes(q),
        )
      : APP_MODULES;

    const groups = new Map<ModuleCategory, (typeof APP_MODULES)[number][]>();
    for (const m of source) {
      const cat = m.category as ModuleCategory;
      const arr = groups.get(cat) ?? [];
      arr.push(m);
      groups.set(cat, arr);
    }

    return Array.from(groups.entries()).sort(
      ([a], [b]) => MODULE_CATEGORIES[a].order - MODULE_CATEGORIES[b].order,
    );
  }, [moduleSearch]);

  const allSelected = selectedModules.size === APP_MODULES.length;

  // ── Render ──────────────────────────────────────────────────────
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
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
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

      {/* ── Dialog de edición ──────────────────────────────────────── */}
      <Dialog open={!!selectedUser} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Permisos de módulo</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} · {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {/* Toolbar */}
          <div className="px-6 py-3 border-b flex flex-wrap items-center gap-2 bg-muted/30">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 bg-background"
                placeholder="Buscar módulo..."
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={selectAll}
              disabled={allSelected}
            >
              Marcar todos
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={clearAll}
              disabled={selectedModules.size === 0}
            >
              Limpiar
            </Button>
          </div>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {loadingPerms ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando permisos...
              </div>
            ) : groupedModules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay módulos que coincidan con «{moduleSearch}»
              </p>
            ) : (
              groupedModules.map(([category, mods]) => (
                <CategoryBlock
                  key={category}
                  category={category}
                  modules={mods}
                  selectedModules={selectedModules}
                  selectedActions={selectedActions}
                  onToggleModule={toggleModule}
                  onToggleAction={toggleAction}
                  onToggleCategory={toggleCategory}
                />
              ))
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t flex-row justify-between sm:justify-between gap-2">
            <div className="text-xs text-muted-foreground self-center">
              {selectedModules.size} de {APP_MODULES.length} módulos
              {hasChanges && (
                <span className="ml-2 text-amber-600 font-medium">
                  • sin guardar
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || loadingPerms || !hasChanges}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar permisos
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Bloque de categoría
// ─────────────────────────────────────────────────────────────────

type ModDef = {
  key: AppModuleKey;
  label: string;
  description: string;
  kind: string;
  category: string;
  action?: readonly AppModuleAction[];
};

function CategoryBlock({
  category,
  modules,
  selectedModules,
  selectedActions,
  onToggleModule,
  onToggleAction,
  onToggleCategory,
}: {
  category: ModuleCategory;
  modules: readonly ModDef[];
  selectedModules: Set<AppModuleKey>;
  selectedActions: Map<AppModuleKey, ModulePerms>;
  onToggleModule: (key: AppModuleKey) => void;
  onToggleAction: (module: AppModuleKey, action: AppModuleAction) => void;
  onToggleCategory: (cat: ModuleCategory) => void;
}) {
  const meta = MODULE_CATEGORIES[category];
  const allSelected = modules.every((m) => selectedModules.has(m.key));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {meta?.sensitive && (
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          )}
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {meta.label}
          </h3>
          {meta?.sensitive && (
            <Badge
              variant="outline"
              className="text-[10px] border-amber-500 text-amber-700 py-0 h-4"
            >
              sensible
            </Badge>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => onToggleCategory(category)}
        >
          {allSelected ? "Quitar todos" : "Marcar todos"}
        </Button>
      </div>

      {meta?.sensitive && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
          Estas capacidades otorgan control sobre otros usuarios. Asígnalas con
          cuidado.
        </p>
      )}

      <div className="space-y-2">
        {modules.map((mod) => (
          <ModuleRow
            key={mod.key}
            mod={mod}
            checked={selectedModules.has(mod.key)}
            selectedActions={selectedActions.get(mod.key) ?? new Set()}
            onToggleModule={onToggleModule}
            onToggleAction={onToggleAction}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Fila de módulo
// ─────────────────────────────────────────────────────────────────

function ModuleRow({
  mod,
  checked,
  selectedActions,
  onToggleModule,
  onToggleAction,
}: {
  mod: ModDef;
  checked: boolean;
  selectedActions: ModulePerms;
  onToggleModule: (key: AppModuleKey) => void;
  onToggleAction: (module: AppModuleKey, action: AppModuleAction) => void;
}) {
  const actions = getModuleActions(mod.key);
  const hasActions = actions.length > 0;
  const [expanded, setExpanded] = useState(false);
  const inputId = `mod-${mod.key}`;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        checked ? "bg-primary/[0.04] border-primary/30" : "bg-background",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={inputId}
          checked={checked}
          onCheckedChange={() => onToggleModule(mod.key)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0 grid gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Label
              htmlFor={inputId}
              className="cursor-pointer font-medium text-sm"
            >
              {mod.label}
            </Label>
            <code className="text-[10px] font-mono text-muted-foreground/70">
              {mod.key}
            </code>
          </div>
          <p className="text-xs text-muted-foreground">{mod.description}</p>
        </div>

        {hasActions && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 shrink-0"
            onClick={() => setExpanded((e) => !e)}
            disabled={!checked}
            aria-label={expanded ? "Ocultar acciones" : "Mostrar acciones"}
            title={
              !checked ? "Marca el módulo para configurar acciones" : undefined
            }
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </Button>
        )}
      </div>

      {hasActions && expanded && checked && (
        <div className="mt-3 ml-7 pt-3 border-t border-dashed">
          <p className="text-[11px] text-muted-foreground mb-2">
            Acciones adicionales · lectura incluida por defecto
          </p>
          <div className="flex flex-wrap gap-1.5">
            {actions.map((action) => {
              const on = selectedActions.has(action);
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => onToggleAction(mod.key, action)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                    on
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted",
                  )}
                >
                  {on && <Check className="h-3 w-3" />}
                  {action}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

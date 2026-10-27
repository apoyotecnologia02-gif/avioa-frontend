"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  Layers,
  Loader2,
  Save,
  Search,
  Shield,
  ShieldAlert,
  UsersIcon,
  X,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────

type UsersResponse = {
  userId: string;
  modules: AppModuleKey[];
  actions?: Partial<Record<AppModuleKey, AppModuleAction[]>>;
};

type ModulePerms = Set<AppModuleAction>;

/** Respuesta del endpoint bulk del backend */
type BulkUpdateResponse = {
  updated: number;
  skippedAdmins: number;
  userIds: string[];
};

type SelectionMode =
  | { type: "none" }
  | { type: "single"; user: User }
  | { type: "multi"; users: User[] }
  | { type: "area"; area: string };

// ─────────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────────

export default function AdminsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Búsqueda y dialogs
  const [userSearch, setUserSearch] = useState("");
  const [moduleSearch, setModuleSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);

  // Selección
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [areaInput, setAreaInput] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [areas, setAreas] = useState<string[]>([]);

  // Editor de permisos
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

  // ── Poblar áreas disponibles desde los usuarios ─────────────────
  // Ajusta si tienes otra fuente (p. ej. un endpoint /admin/areas)
  useEffect(() => {
    const unique = Array.from(
      new Set(
        users
          .map((u) => (u as unknown as { area?: string }).area)
          .filter((a): a is string => Boolean(a && a.trim())),
      ),
    ).sort();
    setAreas(unique);
  }, [users]);

  // ── Modo de selección derivado ──────────────────────────────────
  const selection: SelectionMode = useMemo(() => {
    if (areaInput.trim()) return { type: "area", area: areaInput.trim() };
    const ids = Array.from(selectedUserIds);
    if (ids.length === 0) return { type: "none" };
    const selected = users.filter((u) => selectedUserIds.has(u.userId));
    if (selected.length === 1) return { type: "single", user: selected[0] };
    return { type: "multi", users: selected };
  }, [areaInput, selectedUserIds, users]);

  const isBulkMode = selection.type === "multi" || selection.type === "area";
  const singleUserId =
    selection.type === "single" ? selection.user.userId : null;

  // ── Permisos (solo modo 1 usuario) ──────────────────────────────
  const { data: userPerms, isFetching: loadingPerms } = useQuery({
    queryKey: ["user-permissions", singleUserId],
    enabled: !!singleUserId && dialogOpen,
    queryFn: async () => {
      const { data } = await api.get<UsersResponse>(
        `/admin/users/${singleUserId}/permissions`,
        { skip401Redirect: true },
      );
      return data;
    },
  });

  // Hidratar estado: single → server; bulk → reset
  useEffect(() => {
    if (!dialogOpen) return;
    if (singleUserId && userPerms) {
      setSelectedModules(new Set(userPerms.modules ?? []));
      const map = new Map<AppModuleKey, ModulePerms>();
      for (const [k, v] of Object.entries(userPerms.actions ?? {})) {
        if (Array.isArray(v) && v.length > 0) {
          map.set(k as AppModuleKey, new Set(v));
        }
      }
      setSelectedActions(map);
    } else if (isBulkMode) {
      setSelectedModules(new Set());
      setSelectedActions(new Map());
    }
  }, [dialogOpen, singleUserId, userPerms, isBulkMode]);

  // ── Mutation (siempre usa endpoint bulk) ────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (selection.type === "none") return;

      const actions: Record<string, AppModuleAction[]> = {};
      for (const [k, v] of selectedActions.entries()) {
        if (v.size > 0) actions[k] = Array.from(v);
      }

      const payload: {
        userIds?: string[];
        area?: string;
        modules: AppModuleKey[];
        actions: Record<string, AppModuleAction[]>;
      } = {
        modules: Array.from(selectedModules),
        actions,
      };

      if (selection.type === "area") {
        payload.area = selection.area;
      } else if (selection.type === "single") {
        payload.userIds = [selection.user.userId];
      } else if (selection.type === "multi") {
        payload.userIds = selection.users.map((u) => u.userId);
      }

      const { data } = await api.put<BulkUpdateResponse>(
        "/admin/users/permissions/bulk", // ← ajusta a tu @Put real
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      if (!data) return;

      if (data.updated === 0) {
        toast({
          title: "Sin cambios",
          description:
            data.skippedAdmins > 0
              ? `Los ${data.skippedAdmins} usuarios seleccionados son ADMIN y fueron omitidos.`
              : "No se actualizó ningún usuario.",
          variant: "destructive",
        });
      } else {
        const parts = [`${data.updated} actualizado(s)`];
        if (data.skippedAdmins > 0) {
          parts.push(`${data.skippedAdmins} admin(s) omitido(s)`);
        }
        toast({
          title: "Permisos actualizados",
          description: parts.join(" · "),
        });
      }

      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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

  // ── Dirty check (solo relevante en modo single) ─────────────────
  const hasChanges = useMemo(() => {
    if (!singleUserId || !userPerms) return isBulkMode;

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
  }, [singleUserId, userPerms, selectedModules, selectedActions, isBulkMode]);

  // ── Handlers ────────────────────────────────────────────────────
  function openDialogForSelection() {
    if (selection.type === "none") return;
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setSelectedModules(new Set());
    setSelectedActions(new Map());
    setModuleSearch("");
    setSelectedUserIds(new Set());
    setAreaInput("");
  }

  function handleOpenChange(open: boolean) {
    if (open) return;
    if (!isBulkMode && hasChanges) {
      const ok = window.confirm(
        "Tienes cambios sin guardar. ¿Cerrar de todas formas?",
      );
      if (!ok) return;
    }
    closeDialog();
  }

  function handleSave() {
    if (isBulkMode && selectedModules.size === 0) {
      const target =
        selection.type === "area"
          ? `todos los usuarios del área "${selection.area}"`
          : `${(selection as { users: User[] }).users.length} usuario(s)`;
      const ok = window.confirm(
        `No seleccionaste ningún módulo. Esto ELIMINARÁ todos los permisos de ${target}. ¿Continuar?`,
      );
      if (!ok) return;
    }
    saveMutation.mutate();
  }

  function toggleModule(key: AppModuleKey) {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
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

  // ── Selección de usuarios ───────────────────────────────────────
  function toggleUser(userId: string, role: Role) {
    if (role === Role.ADMIN) return;
    if (areaInput) setAreaInput("");
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function clearSelection() {
    setSelectedUserIds(new Set());
    setAreaInput("");
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

  const selectableFiltered = useMemo(
    () => filteredUsers.filter((u) => u.role !== Role.ADMIN),
    [filteredUsers],
  );

  const allFilteredSelected =
    selectableFiltered.length > 0 &&
    selectableFiltered.every((u) => selectedUserIds.has(u.userId));

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

  const selectionLabel = useMemo(() => {
    if (selection.type === "area") return `Área: ${selection.area}`;
    if (selection.type === "single")
      return `${selection.user.name} · ${selection.user.email}`;
    if (selection.type === "multi")
      return `${selection.users.length} usuarios seleccionados`;
    return "";
  }, [selection]);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header con botón "Aplicar por área" */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Permisos por módulo</h2>
          <p className="text-sm text-muted-foreground">
            Asigna acceso a módulos específicos a uno o varios usuarios, o a
            toda un área.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedArea("");
            setAreaDialogOpen(true);
          }}
        >
          <Layers className="mr-1.5 h-4 w-4" />
          Aplicar por área
        </Button>
      </div>

      {/* Card Usuarios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Usuarios</CardTitle>
          <CardDescription>
            Selecciona uno o varios usuarios, o aplica permisos a toda un área.
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
                  <TableHead className="w-8">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={(checked) => {
                        if (areaInput) setAreaInput("");
                        if (checked) {
                          setSelectedUserIds(
                            new Set(selectableFiltered.map((u) => u.userId)),
                          );
                        } else {
                          setSelectedUserIds(new Set());
                        }
                      }}
                      aria-label="Seleccionar todos"
                    />
                  </TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const isAdmin = user.role === Role.ADMIN;
                  return (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUserIds.has(user.userId)}
                          disabled={isAdmin}
                          onCheckedChange={() =>
                            toggleUser(user.userId, user.role)
                          }
                          aria-label={`Seleccionar ${user.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.role}</Badge>
                        {isAdmin && (
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
                          disabled={isAdmin}
                          onClick={() => {
                            clearSelection();
                            setSelectedUserIds(new Set([user.userId]));
                            setDialogOpen(true);
                          }}
                        >
                          <Shield className="mr-1.5 h-3.5 w-3.5" />
                          Permisos
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Barra flotante de selección múltiple */}
      {selectedUserIds.size > 0 && !dialogOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full border bg-background shadow-lg px-4 py-2">
          <span className="text-sm font-medium">
            {selectedUserIds.size} usuario(s) seleccionado(s)
          </span>
          <Button size="sm" onClick={openDialogForSelection}>
            <Shield className="mr-1.5 h-3.5 w-3.5" />
            Editar permisos
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            Limpiar
          </Button>
        </div>
      )}

      {/* ── Modal: seleccionar área ──────────────────────────────── */}
      <Dialog
        open={areaDialogOpen}
        onOpenChange={(open) => {
          setAreaDialogOpen(open);
          if (!open) setSelectedArea("");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> Aplicar permisos por área
            </DialogTitle>
            <DialogDescription>
              Reemplaza los permisos de todos los usuarios <b>activos</b> del
              área seleccionada. Se excluyen ADMIN y usuarios de prueba.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="area-select">Área</Label>
            <Select
              value={selectedArea}
              onValueChange={setSelectedArea}
              disabled={areas.length === 0}
            >
              <SelectTrigger id="area-select">
                <SelectValue
                  placeholder={
                    areas.length === 0
                      ? "No hay áreas disponibles"
                      : "Selecciona un área..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {areas.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No se encontraron áreas. Verifica que los usuarios tengan el
                campo <code className="font-mono">area</code> asignado.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAreaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!selectedArea}
              onClick={() => {
                setAreaInput(selectedArea);
                setSelectedUserIds(new Set());
                setAreaDialogOpen(false);
                setDialogOpen(true);
              }}
            >
              <Shield className="mr-1.5 h-4 w-4" />
              Editar permisos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog de permisos ───────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>
              {selection.type === "area"
                ? "Permisos por área"
                : selection.type === "multi"
                  ? "Permisos masivos"
                  : "Permisos de módulo"}
            </DialogTitle>
            <DialogDescription>{selectionLabel}</DialogDescription>
            {isBulkMode && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5 mt-2">
                ⚠️ Los módulos y acciones seleccionados <b>reemplazarán</b> los
                permisos actuales de todos los usuarios objetivo. Los ADMIN
                serán omitidos.
              </p>
            )}
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
              {!isBulkMode && hasChanges && (
                <span className="ml-2 text-amber-600 font-medium">
                  • sin guardar
                </span>
              )}
              {isBulkMode && (
                <span className="ml-2 text-amber-600 font-medium">
                  • modo masivo
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  saveMutation.isPending ||
                  loadingPerms ||
                  (!isBulkMode && !hasChanges)
                }
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isBulkMode ? "Guardar en lote" : "Guardar permisos"}
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

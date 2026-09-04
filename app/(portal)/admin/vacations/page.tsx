"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  Search,
  Check,
  RotateCcw,
  Calendar,
  Users,
  Clock,
  Briefcase,
  AlertCircle,
  Save,
} from "lucide-react";
import { api } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface EmployeeBalanceItem {
  user: {
    userId: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    department?: string | null;
    position?: string | null;
    startDate?: string | null;
  };
  balance: {
    accrued: number;
    taken: number;
    pending: number;
    available: number;
    projectedAvailable: number;
    adjustment: number;
  };
}

export default function AdminVacationsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<EmployeeBalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingAdjustments, setEditingAdjustments] = useState<
    Record<string, number | string>
  >({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const loadBalances = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<EmployeeBalanceItem[]>(
        "/leaves/admin/balances",
        { skip401Redirect: true },
      );
      setItems(response.data);

      // Initialize editing states
      const initialEdits: Record<string, number> = {};
      response.data.forEach((item) => {
        initialEdits[item.user.userId] = item.balance.adjustment ?? 0;
      });
      setEditingAdjustments(initialEdits);
    } catch (err) {
      toast({
        title: "Error al cargar saldos de vacaciones",
        description:
          err instanceof Error
            ? err.message
            : "No se pudieron obtener los saldos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, []);

  const handleAdjustmentChange = (userId: string, val: string) => {
    setEditingAdjustments((prev) => ({
      ...prev,
      [userId]: val,
    }));
  };

  const saveAdjustment = async (userId: string) => {
    const rawVal = editingAdjustments[userId];
    const numericVal = Number(rawVal);

    if (rawVal === "" || Number.isNaN(numericVal)) {
      toast({
        title: "Valor inválido",
        description: "Por favor ingresa un número válido para el ajuste.",
        variant: "destructive",
      });
      return;
    }

    setSavingUserId(userId);
    try {
      const response = await api.patch<{
        message: string;
        user: { userId: string; name: string; vacationDaysAdjustment: number };
        balance: EmployeeBalanceItem["balance"];
      }>(
        `/leaves/admin/adjustment/${userId}`,
        { vacationDaysAdjustment: numericVal },
        { skip401Redirect: true },
      );

      // Update state in table
      setItems((prev) =>
        prev.map((item) =>
          item.user.userId === userId
            ? { ...item, balance: response.data.balance }
            : item,
        ),
      );

      toast({
        title: "Ajuste actualizado",
        description: `Se actualizó el ajuste de vacaciones para ${
          items.find((i) => i.user.userId === userId)?.user.name
        }.`,
      });
    } catch (err) {
      toast({
        title: "Error al guardar ajuste",
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSavingUserId(null);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.user.name.toLowerCase().includes(q) ||
        item.user?.email?.toLowerCase().includes(q) ||
        (item.user.department &&
          item.user.department.toLowerCase().includes(q)) ||
        (item.user.position && item.user.position.toLowerCase().includes(q)),
    );
  }, [items, searchQuery]);

  const stats = useMemo(() => {
    const totalUsers = items.length;
    const totalAccrued = items.reduce((acc, i) => acc + i.balance.accrued, 0);
    const totalTaken = items.reduce((acc, i) => acc + i.balance.taken, 0);
    const totalAvailable = items.reduce(
      (acc, i) => acc + i.balance.available,
      0,
    );
    return { totalUsers, totalAccrued, totalTaken, totalAvailable };
  }, [items]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
      date,
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas de Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Colaboradores
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Colaboradores activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Días Devengados
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalAccrued} días
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Acumulado total en sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Días Tomados
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTaken} días</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vacaciones consumidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Disponible Total
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.totalAvailable < 0
                  ? "text-destructive"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {stats.totalAvailable} días
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Saldo global disponible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido Principal */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Saldos y Ajustes de Vacaciones</CardTitle>
            <CardDescription>
              Gestiona el ajuste manual (`vacationDaysAdjustment`) de días
              acumulados por colaborador.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar colaborador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={loadBalances}
              disabled={isLoading}
              title="Recargar datos"
            >
              <RotateCcw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Cargando saldos de vacaciones...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium text-foreground">
                No se encontraron colaboradores
              </p>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? "Intenta con otro término de búsqueda."
                  : "No hay datos de saldos disponibles."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Fecha Ingreso</TableHead>
                    <TableHead className="text-center">Devengados</TableHead>
                    <TableHead className="text-center">Tomados</TableHead>
                    <TableHead className="text-center">Pendientes</TableHead>
                    <TableHead className="text-center">Saldo Actual</TableHead>
                    <TableHead className="text-right min-w-[200px]">
                      Ajuste (Sumar o restar días)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map(({ user, balance }) => {
                    const currentEditVal =
                      editingAdjustments[user.userId] ??
                      balance.adjustment ??
                      0;
                    const isModified =
                      Number(currentEditVal) !== (balance.adjustment ?? 0);
                    const isSaving = savingUserId === user.userId;

                    return (
                      <TableRow key={user.userId}>
                        {/* Colaborador */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              {user.avatarUrl && (
                                <AvatarImage
                                  src={user.avatarUrl}
                                  alt={user.name}
                                />
                              )}
                              <AvatarFallback>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                              {(user.position || user.department) && (
                                <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                                  {[user.position, user.department]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Fecha Ingreso */}
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.startDate)}
                        </TableCell>

                        {/* Devengados */}
                        <TableCell className="text-center font-medium">
                          {balance.accrued} d
                        </TableCell>

                        {/* Tomados */}
                        <TableCell className="text-center text-muted-foreground">
                          {balance.taken} d
                        </TableCell>

                        {/* Pendientes */}
                        <TableCell className="text-center text-muted-foreground">
                          {balance.pending > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              {balance.pending} d
                            </span>
                          ) : (
                            "0 d"
                          )}
                        </TableCell>

                        {/* Saldo Actual */}
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              balance.available < 0
                                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold"
                            }
                          >
                            {balance.available} días
                          </Badge>
                        </TableCell>

                        {/* Ajuste de RRHH */}
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              value={currentEditVal}
                              onChange={(e) =>
                                handleAdjustmentChange(
                                  user.userId,
                                  e.target.value,
                                )
                              }
                              className="w-24 text-right h-9 text-sm"
                              placeholder="0"
                              disabled={isSaving}
                            />
                            <Button
                              size="sm"
                              variant={isModified ? "default" : "outline"}
                              onClick={() => saveAdjustment(user.userId)}
                              disabled={isSaving || !isModified}
                              className="h-9 px-3"
                              title="Guardar ajuste de días de vacaciones"
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : isModified ? (
                                <>
                                  <Save className="h-3.5 w-3.5 mr-1" />
                                  Guardar
                                </>
                              ) : (
                                <Check className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

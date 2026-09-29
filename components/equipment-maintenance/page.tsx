// components/maintenance/Maintenance.tsx
"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wrench,
  Search,
  Plus,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Ban,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { useMaintenance } from "@/hooks/useMaintenance";
import { useEquipmentLoans } from "@/hooks/useEquipmentLoans";
import {
  MaintenanceStatus,
  maintenanceStatusConfig,
} from "@/types/maintenance.types";
import { EquipmentStatus } from "@/types/equipment-loan.types";

const ITEMS_PER_PAGE = 6;

export function Maintenance() {
  const { user } = useAuth();

  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin";
  const isLeader =
    user?.isLeader === true ||
    role === "leader" ||
    role === "manager" ||
    role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("my-requests");
  const [currentPage, setCurrentPage] = useState(1);
  const [equipmentPopoverOpen, setEquipmentPopoverOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "ALL">(
    "ALL",
  );

  // Modal de crear
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  // Modal de cambiar estado
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState<MaintenanceStatus | "">("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [rejectedReason, setRejectedReason] = useState("");

  // Modal de confirmación de cancelación
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState<string | null>(null);

  const {
    useMyRequests,
    useAllRequests,
    useCreateRequest,
    useUpdateStatus,
    useCancelRequest,
  } = useMaintenance();

  const { useEquipment } = useEquipmentLoans();

  const {
    data: myRequests,
    isLoading: isLoadingMyRequests,
    refetch: refetchMyRequests,
  } = useMyRequests();

  const {
    data: allRequests,
    isLoading: isLoadingAllRequests,
    refetch: refetchAllRequests,
  } = useAllRequests(undefined, { enabled: isLeader });

  const { data: equipment, refetch: refetchEquipment } = useEquipment();

  const createRequest = useCreateRequest();
  const updateStatus = useUpdateStatus();
  const cancelRequest = useCancelRequest();

  // Refetch automático por eventos websocket
  useEffect(() => {
    const handleMaintenanceUpdate = () => {
      refetchMyRequests();
      refetchEquipment();
      if (isLeader) refetchAllRequests();
    };

    window.addEventListener("maintenance-update", handleMaintenanceUpdate);

    return () => {
      window.removeEventListener("maintenance-update", handleMaintenanceUpdate);
    };
  }, [isLeader, refetchMyRequests, refetchAllRequests, refetchEquipment]);

  // Contadores
  const pendingCount = (allRequests ?? []).filter(
    (r: any) => r.status === MaintenanceStatus.PENDING,
  ).length;

  // Filtros — Mis Solicitudes
  const filteredMyRequests = (myRequests ?? []).filter((item: any) => {
    const searchLower = searchTerm.toLowerCase();

    // Filtro por estado
    if (statusFilter !== "ALL" && item.status !== statusFilter) {
      return false;
    }

    // Filtro por búsqueda
    return (
      (item.equipment?.name ?? "").toLowerCase().includes(searchLower) ||
      item.status.toLowerCase().includes(searchLower) ||
      (item.reason && item.reason.toLowerCase().includes(searchLower))
    );
  });

  // Filtros — Todas las Solicitudes
  const filteredAllRequests = (allRequests ?? []).filter((item: any) => {
    const searchLower = searchTerm.toLowerCase();

    if (statusFilter !== "ALL" && item.status !== statusFilter) {
      return false;
    }

    return (
      (item.equipment?.name ?? "").toLowerCase().includes(searchLower) ||
      (item.user?.name ?? "").toLowerCase().includes(searchLower) ||
      item.status.toLowerCase().includes(searchLower) ||
      (item.reason && item.reason.toLowerCase().includes(searchLower))
    );
  });

  // Paginación
  const totalPages = (items: any[]) => Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginate = (items: any[]) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as MaintenanceStatus | "ALL");
    setCurrentPage(1);
  };

  const renderPagination = (items: any[]) => {
    const total = totalPages(items);
    if (total <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium min-w-[40px] text-center">
          {currentPage} / {total}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentPage((p) => Math.min(total, p + 1))}
          disabled={currentPage === total}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Handlers
  const handleCreateRequest = () => {
    if (!selectedEquipmentId || !reason.trim()) return;

    createRequest.mutate(
      {
        equipmentId: selectedEquipmentId,
        reason: reason.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          setSelectedEquipmentId("");
          setReason("");
          setDescription("");
          refetchMyRequests();
          refetchEquipment();
          if (isLeader) refetchAllRequests();
        },
      },
    );
  };

  const handleOpenStatusDialog = (id: string) => {
    setSelectedRequestId(id);
    setNewStatus("");
    setResolutionNotes("");
    setRejectedReason("");
    setShowStatusDialog(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedRequestId || !newStatus) return;

    updateStatus.mutate(
      {
        id: selectedRequestId,
        data: {
          status: newStatus as MaintenanceStatus,
          resolutionNotes: resolutionNotes.trim() || undefined,
          rejectedReason: rejectedReason.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowStatusDialog(false);
          setSelectedRequestId(null);
          setNewStatus("");
          setResolutionNotes("");
          setRejectedReason("");
          refetchAllRequests();
          refetchEquipment();
        },
      },
    );
  };

  const handleOpenCancelDialog = (id: string) => {
    setCancelRequestId(id);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelRequestId) return;

    cancelRequest.mutate(cancelRequestId, {
      onSuccess: () => {
        setShowCancelDialog(false);
        setCancelRequestId(null);
        refetchMyRequests();
        refetchEquipment();
        if (isLeader) refetchAllRequests();
      },
    });
  };

  // Helpers de formato
  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  };

  const formatDateLong = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: es });
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    const config = maintenanceStatusConfig[status];
    return (
      <Badge className={config.className} variant="secondary">
        {config.label}
      </Badge>
    );
  };

  // Estados de carga inicial
  if (isLoadingMyRequests && isLoadingAllRequests) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Equipos disponibles para solicitar mantenimiento (excluye los ya en mantenimiento)
  const availableEquipment = (equipment ?? []).filter(
    (e: any) =>
      e.status === EquipmentStatus.AVAILABLE ||
      e.status === EquipmentStatus.DAMAGED,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mantenimientos</h1>
          <p className="text-muted-foreground">
            Solicita y gestiona el mantenimiento de equipos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Solicitar Mantenimiento
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="inline-flex h-auto w-auto items-center justify-start gap-2 bg-transparent p-0">
          <TabsTrigger
            value="my-requests"
            className="rounded-md border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Mis Solicitudes
          </TabsTrigger>
          {isLeader && (
            <TabsTrigger
              value="all-requests"
              className="rounded-md border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="flex items-center gap-2">
                Todas las Solicitudes
                {pendingCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* TAB: Mis Solicitudes */}
        <TabsContent value="my-requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Mis Solicitudes de Mantenimiento
              </CardTitle>
              <CardDescription>
                Historial de tus solicitudes de mantenimiento
              </CardDescription>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por equipo o motivo..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    <SelectItem value={MaintenanceStatus.PENDING}>
                      Pendiente
                    </SelectItem>
                    <SelectItem value={MaintenanceStatus.IN_REVIEW}>
                      En revisión
                    </SelectItem>
                    <SelectItem value={MaintenanceStatus.IN_PROGRESS}>
                      En proceso
                    </SelectItem>
                    <SelectItem value={MaintenanceStatus.RESOLVED}>
                      Resuelto
                    </SelectItem>
                    <SelectItem value={MaintenanceStatus.REJECTED}>
                      Rechazado
                    </SelectItem>
                    <SelectItem value={MaintenanceStatus.CANCELLED}>
                      Cancelado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMyRequests ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredMyRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes solicitudes de mantenimiento</p>
                  <Button
                    variant="link"
                    onClick={() => setShowCreateDialog(true)}
                    className="mt-2"
                  >
                    Solicitar un mantenimiento
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginate(filteredMyRequests).map((item: any) => (
                      <Card key={item.maintenanceRequestId}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">
                                  {item.equipment?.name || "Equipo"}
                                </p>
                                {getStatusBadge(item.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Motivo: {item.reason}
                              </p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">
                                  Detalles: {item.description}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                <Calendar className="inline h-3 w-3 mr-1" />
                                Solicitado: {formatDate(item.createdAt)}
                              </p>
                              {item.assignedTo && (
                                <p className="text-sm text-muted-foreground">
                                  <User className="inline h-3 w-3 mr-1" />
                                  Atendido por: {item.assignedTo.name}
                                </p>
                              )}
                              {item.resolvedAt && (
                                <p className="text-sm text-muted-foreground">
                                  <CheckCircle className="inline h-3 w-3 mr-1 text-green-500" />
                                  Resuelto: {formatDate(item.resolvedAt)}
                                </p>
                              )}
                              {item.resolutionNotes && (
                                <p className="text-sm text-muted-foreground">
                                  Notas: {item.resolutionNotes}
                                </p>
                              )}
                              {item.rejectedReason && (
                                <p className="text-sm text-red-600">
                                  <XCircle className="inline h-3 w-3 mr-1" />
                                  Rechazado: {item.rejectedReason}
                                </p>
                              )}
                            </div>
                            {item.status === MaintenanceStatus.PENDING && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleOpenCancelDialog(
                                    item.maintenanceRequestId,
                                  )
                                }
                                disabled={cancelRequest.isPending}
                              >
                                <Ban className="mr-1 h-4 w-4" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    Mostrando {paginate(filteredMyRequests).length} de{" "}
                    {filteredMyRequests.length} solicitudes
                  </div>

                  {renderPagination(filteredMyRequests)}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Todas las Solicitudes (solo líderes/admin) */}
        {isLeader && (
          <TabsContent value="all-requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Todas las Solicitudes
                </CardTitle>
                <CardDescription>
                  Gestiona las solicitudes de mantenimiento de los colaboradores
                </CardDescription>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por equipo, usuario o motivo..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos los estados</SelectItem>
                      <SelectItem value={MaintenanceStatus.PENDING}>
                        Pendiente
                      </SelectItem>
                      <SelectItem value={MaintenanceStatus.IN_REVIEW}>
                        En revisión
                      </SelectItem>
                      <SelectItem value={MaintenanceStatus.IN_PROGRESS}>
                        En proceso
                      </SelectItem>
                      <SelectItem value={MaintenanceStatus.RESOLVED}>
                        Resuelto
                      </SelectItem>
                      <SelectItem value={MaintenanceStatus.REJECTED}>
                        Rechazado
                      </SelectItem>
                      <SelectItem value={MaintenanceStatus.CANCELLED}>
                        Cancelado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAllRequests ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : filteredAllRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay solicitudes de mantenimiento</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginate(filteredAllRequests).map((item: any) => (
                        <Card key={item.maintenanceRequestId}>
                          <CardContent className="pt-6">
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium">
                                      {item.equipment?.name || "Equipo"}
                                    </p>
                                    {getStatusBadge(item.status)}
                                    <Badge variant="outline">
                                      {item.user?.name || "Usuario"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Motivo: {item.reason}
                                  </p>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground">
                                      Detalles: {item.description}
                                    </p>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    <Calendar className="inline h-3 w-3 mr-1" />
                                    Solicitado: {formatDateLong(item.createdAt)}
                                  </p>
                                  {item.assignedTo && (
                                    <p className="text-sm text-muted-foreground">
                                      <User className="inline h-3 w-3 mr-1" />
                                      Atendido por: {item.assignedTo.name}
                                    </p>
                                  )}
                                  {item.resolvedAt && (
                                    <p className="text-sm text-muted-foreground">
                                      <CheckCircle className="inline h-3 w-3 mr-1 text-green-500" />
                                      Resuelto:{" "}
                                      {formatDateLong(item.resolvedAt)}
                                    </p>
                                  )}
                                  {item.resolutionNotes && (
                                    <p className="text-sm text-muted-foreground">
                                      Notas: {item.resolutionNotes}
                                    </p>
                                  )}
                                  {item.rejectedReason && (
                                    <p className="text-sm text-red-600">
                                      <XCircle className="inline h-3 w-3 mr-1" />
                                      Rechazado: {item.rejectedReason}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                {item.status === MaintenanceStatus.PENDING && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleOpenStatusDialog(
                                        item.maintenanceRequestId,
                                      )
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    <AlertCircle className="mr-1 h-4 w-4" />
                                    Gestionar
                                  </Button>
                                )}
                                {item.status ===
                                  MaintenanceStatus.IN_REVIEW && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleOpenStatusDialog(
                                        item.maintenanceRequestId,
                                      )
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    <Loader2 className="mr-1 h-4 w-4" />
                                    Actualizar
                                  </Button>
                                )}
                                {item.status ===
                                  MaintenanceStatus.IN_PROGRESS && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleOpenStatusDialog(
                                        item.maintenanceRequestId,
                                      )
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Marcar como resuelto
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                      Mostrando {paginate(filteredAllRequests).length} de{" "}
                      {filteredAllRequests.length} solicitudes
                    </div>

                    {renderPagination(filteredAllRequests)}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Dialog: Crear solicitud */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar Mantenimiento</DialogTitle>
            <DialogDescription>
              Completa los datos para solicitar la revisión del equipo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Equipo *</Label>
              <Popover
                open={equipmentPopoverOpen}
                onOpenChange={setEquipmentPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={equipmentPopoverOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedEquipmentId
                      ? (() => {
                          const eq = availableEquipment.find(
                            (e: any) => e.equipmentId === selectedEquipmentId,
                          );
                          return eq
                            ? `${eq.name}${eq.serialNumber ? ` (${eq.serialNumber})` : ""}`
                            : "Selecciona un equipo";
                        })()
                      : "Selecciona un equipo"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full min-w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <Command
                    filter={(value, search) => {
                      const searchLower = search.toLowerCase();
                      return value.toLowerCase().includes(searchLower) ? 1 : 0;
                    }}
                  >
                    <CommandInput placeholder="Buscar por nombre, serial o ubicación..." />
                    <CommandList className="max-h-[400px] overflow-y-auto">
                      <CommandEmpty>No se encontraron equipos.</CommandEmpty>
                      <CommandGroup>
                        {availableEquipment.map((item: any) => {
                          const label = `${item.name}${item.serialNumber ? ` (${item.serialNumber})` : ""}${item.location?.name ? ` - ${item.location.name}` : ""}`;
                          return (
                            <CommandItem
                              key={item.equipmentId}
                              value={label}
                              onSelect={() => {
                                setSelectedEquipmentId(item.equipmentId);
                                setEquipmentPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedEquipmentId === item.equipmentId
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {item.serialNumber &&
                                    `Serial: ${item.serialNumber}`}
                                  {item.serialNumber &&
                                    item.location?.name &&
                                    " · "}
                                  {item.location?.name}
                                </span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo *</Label>
              <Input
                id="reason"
                placeholder="Ej: El mouse no responde bien"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción adicional</Label>
              <Textarea
                id="description"
                placeholder="Detalles adicionales sobre el problema"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateRequest}
              disabled={
                createRequest.isPending ||
                !selectedEquipmentId ||
                !reason.trim()
              }
            >
              {createRequest.isPending ? "Enviando..." : "Solicitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cambiar estado */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestionar Solicitud</DialogTitle>
            <DialogDescription>
              Actualiza el estado de la solicitud de mantenimiento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nuevo estado</Label>
              <Select
                onValueChange={(v) => setNewStatus(v as MaintenanceStatus)}
                value={newStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MaintenanceStatus.IN_REVIEW}>
                    En revisión
                  </SelectItem>
                  <SelectItem value={MaintenanceStatus.IN_PROGRESS}>
                    En proceso
                  </SelectItem>
                  <SelectItem value={MaintenanceStatus.RESOLVED}>
                    Resuelto
                  </SelectItem>
                  <SelectItem value={MaintenanceStatus.REJECTED}>
                    Rechazado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === MaintenanceStatus.RESOLVED && (
              <div className="space-y-2">
                <Label>Notas de resolución</Label>
                <Textarea
                  placeholder="¿Cómo se resolvió el problema?"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            )}

            {newStatus === MaintenanceStatus.REJECTED && (
              <div className="space-y-2">
                <Label>Motivo del rechazo *</Label>
                <Textarea
                  placeholder="Explica por qué se rechaza la solicitud"
                  value={rejectedReason}
                  onChange={(e) => setRejectedReason(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={
                updateStatus.isPending ||
                !newStatus ||
                (newStatus === MaintenanceStatus.REJECTED &&
                  !rejectedReason.trim())
              }
            >
              {updateStatus.isPending ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar cancelación */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Solicitud</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta solicitud de
              mantenimiento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelRequest.isPending}
            >
              {cancelRequest.isPending ? "Cancelando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
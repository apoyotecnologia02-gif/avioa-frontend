"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Filter,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { useMaintenance } from "@/hooks/useMaintenance";
import { useEquipmentLoans } from "@/hooks/useEquipmentLoans";
import {
  MaintenanceStatus,
  MaintenanceRequestType,
  maintenanceStatusConfig,
  maintenanceRequestTypeConfig,
} from "@/types/maintenance.types";
import { EquipmentStatus } from "@/types/equipment-loan.types";

const ITEMS_PER_PAGE = 8;

const AVATAR_COLORS = [
  "bg-red-500/15 text-red-700 dark:text-red-300",
  "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "bg-green-500/15 text-green-700 dark:text-green-300",
  "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-pink-500/15 text-pink-700 dark:text-pink-300",
  "bg-teal-500/15 text-teal-700 dark:text-teal-300",
];

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function UserAvatar({ name }: { name: string }) {
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  return (
    <div
      className={`h-7 w-7 ${color} shrink-0 rounded-full flex items-center justify-center font-semibold text-[10px]`}
      title={name}
    >
      {initials}
    </div>
  );
}

export function Maintenance() {
  const { user } = useAuth();

  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin";
  const isLeader =
    user?.isLeader === true ||
    role === "leader" ||
    role === "manager" ||
    role === "admin";
  const isSupport = user?.isSupport === true;

  const canManageRequests = isLeader || isSupport;

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("my-requests");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "ALL">(
    "ALL",
  );

  const { useEquipment, useMyLoanedEquipment, useLocations } =
    useEquipmentLoans();

  const { refetch: refetchEquipment } = useEquipment();
  const {
    data: myLoanedEquipment,
    refetch: refetchMyLoaned,
  } = useMyLoanedEquipment();
  const { data: locations } = useLocations();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const [showGeneralDialog, setShowGeneralDialog] = useState(false);
  const [generalLocationId, setGeneralLocationId] = useState("");
  const [generalDescription, setGeneralDescription] = useState("");

  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState<MaintenanceStatus | "">("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [rejectedReason, setRejectedReason] = useState("");

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState<string | null>(null);

  const {
    useMyRequests,
    useAllRequests,
    useCreateRequest,
    useUpdateStatus,
    useCancelRequest,
  } = useMaintenance();

  const {
    data: myRequests,
    isLoading: isLoadingMyRequests,
    refetch: refetchMyRequests,
  } = useMyRequests();

  const {
    data: allRequests,
    isLoading: isLoadingAllRequests,
    refetch: refetchAllRequests,
  } = useAllRequests(undefined, { enabled: canManageRequests });

  const createRequest = useCreateRequest();
  const updateStatus = useUpdateStatus();
  const cancelRequest = useCancelRequest();

  useEffect(() => {
    const handleMaintenanceUpdate = () => {
      refetchMyRequests();
      refetchEquipment();
      if (canManageRequests) refetchAllRequests();
    };

    window.addEventListener("maintenance-update", handleMaintenanceUpdate);

    return () => {
      window.removeEventListener("maintenance-update", handleMaintenanceUpdate);
    };
  }, [
    canManageRequests,
    refetchMyRequests,
    refetchAllRequests,
    refetchEquipment,
    refetchMyLoaned,
  ]);

  const pendingCount = (allRequests ?? []).filter(
    (r: any) => r.status === MaintenanceStatus.PENDING,
  ).length;

  const getRequestName = (item: any) => {
    if (item.requestType === MaintenanceRequestType.EQUIPMENT) {
      return item.equipment?.name || "Equipo";
    }
    return item.location?.name || "Ubicación";
  };

  const getRequestSubtitle = (item: any) => {
    if (item.requestType === MaintenanceRequestType.EQUIPMENT) {
      return item.equipment?.serialNumber
        ? `Serial: ${item.equipment.serialNumber}`
        : null;
    }
    return null;
  };

  const filteredMyRequests = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return (myRequests ?? []).filter((item: any) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      return (
        (item.equipment?.name ?? "").toLowerCase().includes(searchLower) ||
        (item.location?.name ?? "").toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower) ||
        (item.reason && item.reason.toLowerCase().includes(searchLower))
      );
    });
  }, [myRequests, searchTerm, statusFilter]);

  const filteredAllRequests = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return (allRequests ?? []).filter((item: any) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      return (
        (item.equipment?.name ?? "").toLowerCase().includes(searchLower) ||
        (item.location?.name ?? "").toLowerCase().includes(searchLower) ||
        (item.user?.name ?? "").toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower) ||
        (item.reason && item.reason.toLowerCase().includes(searchLower))
      );
    });
  }, [allRequests, searchTerm, statusFilter]);

  const totalPages = (items: any[]) => Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginate = (items: any[]) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    setStatusFilter("ALL");
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
      <div className="flex items-center justify-between gap-2 mt-4">
        <p className="text-xs text-muted-foreground">
          Página {currentPage} de {total}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() => setCurrentPage((p) => Math.min(total, p + 1))}
            disabled={currentPage === total}
          >
            Siguiente
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  const handleCreateRequest = () => {
    if (!selectedEquipmentId || !reason.trim()) return;

    createRequest.mutate(
      {
        requestType: MaintenanceRequestType.EQUIPMENT,
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
          if (canManageRequests) refetchAllRequests();
        },
      },
    );
  };

  const handleCreateGeneralRequest = () => {
    if (!generalLocationId || !generalDescription.trim()) return;

    createRequest.mutate(
      {
        requestType: MaintenanceRequestType.GENERAL,
        locationId: generalLocationId,
        description: generalDescription.trim(),
      },
      {
        onSuccess: () => {
          setShowGeneralDialog(false);
          setGeneralLocationId("");
          setGeneralDescription("");
          refetchMyRequests();
          if (canManageRequests) refetchAllRequests();
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
        if (canManageRequests) refetchAllRequests();
      },
    });
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  };

  const formatDateLong = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: es });
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    const config = maintenanceStatusConfig[status];
    if (!config) return null;
    return (
      <Badge className={config.className} variant="secondary">
        {config.label}
      </Badge>
    );
  };

  const getRequestTypeBadge = (type: MaintenanceRequestType) => {
    const config = maintenanceRequestTypeConfig[type];
    if (!config) return null;
    return (
      <Badge className={config.className} variant="secondary">
        {config.label}
      </Badge>
    );
  };

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
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableEquipment = myLoanedEquipment ?? [];

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
            Mantenimiento Equipos
          </Button>

          <Button onClick={() => setShowGeneralDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Mantenimiento General
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
          {canManageRequests && (
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

        <TabsContent value="my-requests" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Mis Solicitudes
                <Badge variant="secondary" className="ml-1">
                  {filteredMyRequests.length}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Historial de tus solicitudes de mantenimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por equipo, ubicación o motivo..."
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
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    <SelectValue placeholder="Estado" />
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

              {isLoadingMyRequests ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : filteredMyRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No tienes solicitudes</p>
                  <p className="text-sm mt-1">
                    Cuando solicites un mantenimiento aparecerá aquí
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Solicitar mantenimiento
                  </Button>
                </div>
              ) : (
                <>
                  <div className="hidden md:block rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead className="w-[35%]">
                            Equipo / Ubicación
                          </TableHead>
                          <TableHead className="w-[25%]">Motivo</TableHead>
                          <TableHead className="w-[15%]">Solicitado</TableHead>
                          <TableHead className="w-[15%]">Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginate(filteredMyRequests).map((item: any) => {
                          const subtitle = getRequestSubtitle(item);
                          return (
                            <TableRow
                              key={item.maintenanceRequestId}
                              className="h-14"
                            >
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium leading-tight">
                                    {getRequestName(item)}
                                  </span>
                                  <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                    {item.requestType &&
                                      getRequestTypeBadge(item.requestType)}
                                    {subtitle && <span>· {subtitle}</span>}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate">
                                {item.reason || "—"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(item.createdAt)}
                                </span>
                              </TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                              <TableCell className="text-right">
                                {item.status ===
                                  MaintenanceStatus.PENDING && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() =>
                                      handleOpenCancelDialog(
                                        item.maintenanceRequestId,
                                      )
                                    }
                                    disabled={cancelRequest.isPending}
                                  >
                                    <Ban className="mr-1 h-3 w-3" />
                                    Cancelar
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {paginate(filteredMyRequests).map((item: any) => (
                      <Card key={item.maintenanceRequestId}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">
                                {getRequestName(item)}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {item.requestType &&
                                  getRequestTypeBadge(item.requestType)}
                                {getStatusBadge(item.status)}
                              </div>
                              {item.reason && (
                                <p className="text-xs text-muted-foreground mt-2 truncate">
                                  Motivo: {item.reason}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                <Calendar className="inline h-3 w-3 mr-1" />
                                {formatDate(item.createdAt)}
                              </p>
                            </div>
                            {item.status === MaintenanceStatus.PENDING && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs shrink-0"
                                onClick={() =>
                                  handleOpenCancelDialog(
                                    item.maintenanceRequestId,
                                  )
                                }
                                disabled={cancelRequest.isPending}
                              >
                                <Ban className="mr-1 h-3 w-3" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {renderPagination(filteredMyRequests)}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canManageRequests && (
          <TabsContent value="all-requests" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Todas las Solicitudes
                  <Badge variant="secondary" className="ml-1">
                    {filteredAllRequests.length}
                  </Badge>
                  {pendingCount > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      {pendingCount} pendientes
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  Gestiona las solicitudes de mantenimiento de los
                  colaboradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col sm:flex-row gap-2">
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
                      <Filter className="mr-2 h-3.5 w-3.5" />
                      <SelectValue placeholder="Estado" />
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

                {isLoadingAllRequests ? (
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : filteredAllRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No hay solicitudes</p>
                    <p className="text-sm mt-1">
                      Cuando los colaboradores soliciten mantenimientos
                      aparecerán aquí
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-[30%]">
                              Equipo / Ubicación
                            </TableHead>
                            <TableHead className="w-[16%]">
                              Solicitante
                            </TableHead>
                            <TableHead className="w-[18%]">Motivo</TableHead>
                            <TableHead className="w-[14%]">Estado</TableHead>
                            <TableHead className="w-[22%] text-right">
                              Acciones
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginate(filteredAllRequests).map((item: any) => {
                            const subtitle = getRequestSubtitle(item);
                            return (
                              <TableRow
                                key={item.maintenanceRequestId}
                                className="h-14"
                              >
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium leading-tight">
                                      {getRequestName(item)}
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                                      {item.requestType &&
                                        getRequestTypeBadge(item.requestType)}
                                      {subtitle && <span>· {subtitle}</span>}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {item.user?.name ? (
                                    <div className="flex items-center gap-2">
                                      <UserAvatar name={item.user.name} />
                                      <span className="text-sm truncate">
                                        {item.user.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate">
                                  {item.reason || "—"}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(item.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1.5 flex-wrap">
                                    {item.status ===
                                      MaintenanceStatus.PENDING && (
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() =>
                                          handleOpenStatusDialog(
                                            item.maintenanceRequestId,
                                          )
                                        }
                                        disabled={updateStatus.isPending}
                                      >
                                        <AlertCircle className="mr-1 h-3 w-3" />
                                        Gestionar
                                      </Button>
                                    )}
                                    {item.status ===
                                      MaintenanceStatus.IN_REVIEW && (
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() =>
                                          handleOpenStatusDialog(
                                            item.maintenanceRequestId,
                                          )
                                        }
                                        disabled={updateStatus.isPending}
                                      >
                                        <Loader2 className="mr-1 h-3 w-3" />
                                        Actualizar
                                      </Button>
                                    )}
                                    {item.status ===
                                      MaintenanceStatus.IN_PROGRESS && (
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() =>
                                          handleOpenStatusDialog(
                                            item.maintenanceRequestId,
                                          )
                                        }
                                        disabled={updateStatus.isPending}
                                      >
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Resolver
                                      </Button>
                                    )}
                                    {(item.status ===
                                      MaintenanceStatus.RESOLVED ||
                                      item.status ===
                                        MaintenanceStatus.REJECTED ||
                                      item.status ===
                                        MaintenanceStatus.CANCELLED) && (
                                      <span className="text-xs text-muted-foreground self-center">
                                        —
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="md:hidden space-y-3">
                      {paginate(filteredAllRequests).map((item: any) => (
                        <Card key={item.maintenanceRequestId}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">
                                  {getRequestName(item)}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {item.requestType &&
                                    getRequestTypeBadge(item.requestType)}
                                  {getStatusBadge(item.status)}
                                </div>
                                {item.user?.name && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <UserAvatar name={item.user.name} />
                                    <span className="text-xs text-muted-foreground truncate">
                                      {item.user.name}
                                    </span>
                                  </div>
                                )}
                                {item.reason && (
                                  <p className="text-xs text-muted-foreground mt-2 truncate">
                                    Motivo: {item.reason}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  <Calendar className="inline h-3 w-3 mr-1" />
                                  {formatDate(item.createdAt)}
                                </p>
                              </div>
                            </div>

                            {(item.status === MaintenanceStatus.PENDING ||
                              item.status ===
                                MaintenanceStatus.IN_REVIEW ||
                              item.status ===
                                MaintenanceStatus.IN_PROGRESS) && (
                              <div className="flex gap-2 mt-3 pt-3 border-t">
                                {item.status ===
                                  MaintenanceStatus.PENDING && (
                                  <Button
                                    size="sm"
                                    className="flex-1 h-8 text-xs"
                                    onClick={() =>
                                      handleOpenStatusDialog(
                                        item.maintenanceRequestId,
                                      )
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    Gestionar
                                  </Button>
                                )}
                                {item.status ===
                                  MaintenanceStatus.IN_REVIEW && (
                                  <Button
                                    size="sm"
                                    className="flex-1 h-8 text-xs"
                                    onClick={() =>
                                      handleOpenStatusDialog(
                                        item.maintenanceRequestId,
                                      )
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    <Loader2 className="mr-1 h-3 w-3" />
                                    Actualizar
                                  </Button>
                                )}
                                {item.status ===
                                  MaintenanceStatus.IN_PROGRESS && (
                                  <Button
                                    size="sm"
                                    className="flex-1 h-8 text-xs"
                                    onClick={() =>
                                      handleOpenStatusDialog(
                                        item.maintenanceRequestId,
                                      )
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Marcar como resuelto
                                  </Button>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {renderPagination(filteredAllRequests)}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg overflow-hidden">
          <DialogHeader>
            <DialogTitle>Solicitar Mantenimiento</DialogTitle>
            <DialogDescription>
              Completa los datos para solicitar la revisión del equipo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 min-w-0">
              <Label>Equipo *</Label>
              <Select
                value={selectedEquipmentId}
                onValueChange={setSelectedEquipmentId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {availableEquipment.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No tienes equipos asignados para generar el reporte de
                      mantenimiento.
                    </div>
                  ) : (
                    availableEquipment.map((item: any) => (
                      <SelectItem
                        key={item.equipmentId}
                        value={item.equipmentId}
                      >
                        {item.name}
                        {item.serialNumber && ` (${item.serialNumber})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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

      <Dialog open={showGeneralDialog} onOpenChange={setShowGeneralDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg overflow-hidden">
          <DialogHeader>
            <DialogTitle>Mantenimiento General</DialogTitle>
            <DialogDescription>
              Reporta problemas de internet, impresoras, cafetera u otras
              instalaciones
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 min-w-0">
              <Label>Ubicación *</Label>
              <Select
                value={generalLocationId}
                onValueChange={setGeneralLocationId}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una ubicación" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {locations?.map((loc: any) => (
                    <SelectItem key={loc.locationId} value={loc.locationId}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="generalDescription">
                Descripción del problema *
              </Label>
              <Textarea
                id="generalDescription"
                placeholder="Ej: El internet está muy lento desde ayer. No se puede trabajar en reuniones virtuales."
                value={generalDescription}
                onChange={(e) => setGeneralDescription(e.target.value)}
                rows={5}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGeneralDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateGeneralRequest}
              disabled={
                createRequest.isPending ||
                !generalLocationId ||
                !generalDescription.trim()
              }
            >
              {createRequest.isPending ? "Enviando..." : "Enviar reporte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle>Gestionar Solicitud</DialogTitle>
            <DialogDescription>
              Actualiza el estado de la solicitud de mantenimiento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 min-w-0">
              <Label>Nuevo estado</Label>
              <Select
                onValueChange={(v) => setNewStatus(v as MaintenanceStatus)}
                value={newStatus}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
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

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md overflow-hidden">
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
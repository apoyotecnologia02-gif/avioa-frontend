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
  Package,
  Search,
  Plus,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { useEquipmentLoans } from "@/hooks/useEquipmentLoans";
import {
  EquipmentStatus,
  LoanStatus,
  EquipmentCategory,
} from "@/types/equipment-loan.types";

const statusConfig = {
  [EquipmentStatus.AVAILABLE]: {
    label: "Disponible",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  [EquipmentStatus.LOANED]: {
    label: "En préstamo",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  [EquipmentStatus.MAINTENANCE]: {
    label: "Mantenimiento",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  [EquipmentStatus.DAMAGED]: {
    label: "Dañado",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

const loanStatusConfig = {
  [LoanStatus.PENDING]: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  [LoanStatus.APPROVED]: {
    label: "Aprobado",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  [LoanStatus.LOANED]: {
    label: "En préstamo",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  [LoanStatus.RETURNED]: {
    label: "Devuelto",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  [LoanStatus.REJECTED]: {
    label: "Rechazado",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  [LoanStatus.CANCELLED]: {
    label: "Cancelado",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
};

const categoryLabels: Record<EquipmentCategory, string> = {
  [EquipmentCategory.LAPTOP]: "Laptop",
  [EquipmentCategory.CELLPHONE]: "Teléfono",
  [EquipmentCategory.KEYBOARD]: "Teclado",
  [EquipmentCategory.MOUSE]: "Mouse",
  [EquipmentCategory.HEADPHONES]: "Audífonos",
  [EquipmentCategory.MONITOR]: "Monitor",
  [EquipmentCategory.PRINTER]: "Impresora",
  [EquipmentCategory.PROJECTOR]: "Proyector",
  [EquipmentCategory.OTHER]: "Otro",
};

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

function UserAvatar({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  const dim = size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <div
      className={`${dim} ${color} shrink-0 rounded-full flex items-center justify-center font-semibold`}
      title={name}
    >
      {initials}
    </div>
  );
}

const ITEMS_PER_PAGE = 8;

type LoanFilterStatus = LoanStatus | "ALL";

export function EquipmentLoans() {
  const { user } = useAuth();

  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin";
  const isLeader =
    user?.isLeader === true || role === "leader" || role === "admin";
  const isSupport = user?.isSupport === true;

  const canManageLoans = isLeader || isSupport;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LoanFilterStatus>("ALL");
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState<
    EquipmentStatus | "ALL"
  >("ALL");

  const [activeTab, setActiveTab] = useState("equipment");
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [showEquipmentDialog, setShowEquipmentDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [loanReason, setLoanReason] = useState("");
  const [loanObservation, setLoanObservation] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const {
    useEquipment,
    useMyLoans,
    useAllLoans,
    useLocations,
    useCreateLoan,
    useUpdateLoanStatus,
    useCancelLoan,
    useCreateEquipment,
  } = useEquipmentLoans();

  const {
    data: equipment,
    isLoading: isLoadingEquipment,
    refetch: refetchEquipment,
  } = useEquipment();

  const {
    data: myLoans,
    isLoading: isLoadingMyLoans,
    refetch: refetchMyLoans,
  } = useMyLoans();

  const {
    data: allLoans,
    isLoading: isLoadingAllLoans,
    refetch: refetchAllLoans,
  } = useAllLoans(undefined, { enabled: canManageLoans });

  const { data: locations } = useLocations();

  const createLoan = useCreateLoan();
  const createEquipment = useCreateEquipment();
  const updateStatus = useUpdateLoanStatus();
  const cancelLoan = useCancelLoan();

  useEffect(() => {
    const handleEquipmentLoanUpdate = () => {
      refetchEquipment();
      refetchMyLoans();
      if (canManageLoans) refetchAllLoans();
    };

    window.addEventListener("equipment-loan-update", handleEquipmentLoanUpdate);

    return () => {
      window.removeEventListener(
        "equipment-loan-update",
        handleEquipmentLoanUpdate,
      );
    };
  }, [canManageLoans, refetchEquipment, refetchMyLoans, refetchAllLoans]);

  const pendingCount = (allLoans ?? []).filter(
    (l: any) => l.status === LoanStatus.PENDING,
  ).length;

  const filteredEquipment = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return (equipment ?? []).filter((item: any) => {
      if (
        equipmentStatusFilter !== "ALL" &&
        item.status !== equipmentStatusFilter
      ) {
        return false;
      }
      const activeLoan = item.loans?.find((l: any) => l.status === "APPROVED");
      const holderName = (activeLoan?.user?.name ?? "").toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        (item.serialNumber &&
          item.serialNumber.toLowerCase().includes(searchLower)) ||
        (item.location?.name &&
          item.location.name.toLowerCase().includes(searchLower)) ||
        holderName.includes(searchLower)
      );
    });
  }, [equipment, searchTerm, equipmentStatusFilter]);

  const filteredMyLoans = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return (myLoans ?? []).filter((loan: any) => {
      if (statusFilter !== "ALL" && loan.status !== statusFilter) return false;
      return (
        (loan.equipment?.name ?? "").toLowerCase().includes(searchLower) ||
        loan.status.toLowerCase().includes(searchLower) ||
        (loan.reason && loan.reason.toLowerCase().includes(searchLower))
      );
    });
  }, [myLoans, searchTerm, statusFilter]);

  const filteredAllLoans = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return (allLoans ?? []).filter((loan: any) => {
      if (statusFilter !== "ALL" && loan.status !== statusFilter) return false;
      return (
        (loan.equipment?.name ?? "").toLowerCase().includes(searchLower) ||
        (loan.user?.name ?? "").toLowerCase().includes(searchLower) ||
        loan.status.toLowerCase().includes(searchLower)
      );
    });
  }, [allLoans, searchTerm, statusFilter]);

  const totalPages = (items: any[]) => Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginate = (items: any[]) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    setStatusFilter("ALL");
    setEquipmentStatusFilter("ALL");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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

  const handleCreateLoan = () => {
    if (!selectedEquipmentId) return;

    createLoan.mutate(
      {
        equipmentId: selectedEquipmentId,
        reason: loanReason,
        observation: loanObservation,
      },
      {
        onSuccess: () => {
          setShowLoanDialog(false);
          setSelectedEquipmentId("");
          setLoanReason("");
          setLoanObservation("");
          refetchMyLoans();
          refetchEquipment();
          if (canManageLoans) refetchAllLoans();
        },
      },
    );
  };

  const handleApproveLoan = (id: string) => {
    updateStatus.mutate(
      { id, status: LoanStatus.APPROVED },
      {
        onSuccess: () => {
          refetchAllLoans();
          refetchEquipment();
        },
      },
    );
  };

  const handleRejectLoan = (id: string) => {
    updateStatus.mutate(
      { id, status: LoanStatus.REJECTED },
      {
        onSuccess: () => {
          refetchAllLoans();
        },
      },
    );
  };

  const handleRequestLoanFor = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    setShowLoanDialog(true);
  };

  const handleReturnLoan = (id: string) => {
    setSelectedLoanId(id);
    setShowReturnDialog(true);
  };

  const confirmReturn = () => {
    if (selectedLoanId) {
      updateStatus.mutate(
        { id: selectedLoanId, status: LoanStatus.RETURNED },
        {
          onSuccess: () => {
            setShowReturnDialog(false);
            setSelectedLoanId(null);
            refetchAllLoans();
            refetchEquipment();
          },
        },
      );
    }
  };

  const handleCancelLoan = (id: string) => {
    cancelLoan.mutate(id, {
      onSuccess: () => {
        refetchMyLoans();
        refetchEquipment();
        if (canManageLoans) refetchAllLoans();
      },
    });
  };

  const handleCreateEquipment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createEquipment.mutate(
      {
        name: formData.get("name") as string,
        serialNumber: formData.get("serialNumber") as string,
        category: formData.get("category") as EquipmentCategory,
        locationId: formData.get("locationId") as string,
        description: formData.get("description") as string,
        status: EquipmentStatus.AVAILABLE,
      },
      {
        onSuccess: () => {
          setShowEquipmentDialog(false);
          refetchEquipment();
        },
      },
    );
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  };

  const formatDateLong = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: es });
  };

  const getEquipmentStatusBadge = (status: EquipmentStatus) => {
    const config = statusConfig[status];
    if (!config) return null;
    return (
      <Badge className={config.className} variant="secondary">
        {config.label}
      </Badge>
    );
  };

  const getLoanStatusBadge = (status: LoanStatus) => {
    const config = loanStatusConfig[status];
    if (!config) return null;
    return (
      <Badge className={config.className} variant="secondary">
        {config.label}
      </Badge>
    );
  };

  if (isLoadingEquipment && isLoadingMyLoans) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Préstamos de Equipos
          </h1>
          <p className="text-muted-foreground">
            Gestiona los préstamos de equipos y dispositivos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowLoanDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Solicitar Préstamo
          </Button>
          {(isAdmin || isLeader) && (
            <Button
              variant="outline"
              onClick={() => setShowEquipmentDialog(true)}
            >
              <Package className="mr-2 h-4 w-4" />
              Registrar Equipo
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="inline-flex h-auto w-auto items-center justify-start gap-2 bg-transparent p-0">
          <TabsTrigger
            value="equipment"
            className="rounded-md border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Equipos
          </TabsTrigger>
          <TabsTrigger
            value="my-loans"
            className="rounded-md border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Mis Préstamos
          </TabsTrigger>
          {canManageLoans && (
            <TabsTrigger
              value="all-loans"
              className="rounded-md border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="flex items-center gap-2">
                Todos los Préstamos
                {pendingCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="equipment" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Inventario de Equipos
                    <Badge variant="secondary" className="ml-1">
                      {filteredEquipment.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Lista de todos los equipos registrados
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, categoría, serial o ubicación..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={equipmentStatusFilter}
                  onValueChange={(v) => {
                    setEquipmentStatusFilter(v as EquipmentStatus | "ALL");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    <SelectItem value={EquipmentStatus.AVAILABLE}>
                      Disponible
                    </SelectItem>
                    <SelectItem value={EquipmentStatus.LOANED}>
                      En préstamo
                    </SelectItem>
                    <SelectItem value={EquipmentStatus.MAINTENANCE}>
                      Mantenimiento
                    </SelectItem>
                    <SelectItem value={EquipmentStatus.DAMAGED}>
                      Dañado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoadingEquipment ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : filteredEquipment.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No se encontraron equipos</p>
                  <p className="text-sm mt-1">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead className="w-[35%]">Equipo</TableHead>
                          <TableHead className="w-[20%]">Ubicación</TableHead>
                          <TableHead className="w-[25%]">
                            En posesión de
                          </TableHead>
                          <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginate(filteredEquipment).map((item: any) => {
                          const activeLoan = item.loans?.find(
                            (l: any) => l.status === "APPROVED",
                          );
                          const holderName = activeLoan?.user?.name;
                          return (
                            <TableRow key={item.equipmentId} className="h-14">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium leading-tight">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground mt-0.5">
                                    {
                                      categoryLabels[
                                        item.category as EquipmentCategory
                                      ]
                                    }
                                    {item.serialNumber &&
                                      ` · ${item.serialNumber}`}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {item.location?.name || "—"}
                              </TableCell>
                              <TableCell>
                                {holderName ? (
                                  <div className="flex items-center gap-2">
                                    <UserAvatar name={holderName} />
                                    <span className="text-sm truncate">
                                      {holderName}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  {item.status ===
                                    EquipmentStatus.AVAILABLE && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-full hover:bg-primary/10"
                                      title="Solicitar este equipo"
                                      onClick={() =>
                                        handleRequestLoanFor(item.equipmentId)
                                      }
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {getEquipmentStatusBadge(item.status)}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {paginate(filteredEquipment).map((item: any) => {
                      const activeLoan = item.loans?.find(
                        (l: any) => l.status === "APPROVED",
                      );
                      const holderName = activeLoan?.user?.name;
                      return (
                        <Card key={item.equipmentId}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {
                                    categoryLabels[
                                      item.category as EquipmentCategory
                                    ]
                                  }
                                  {item.serialNumber &&
                                    ` · ${item.serialNumber}`}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.location?.name || "Sin ubicación"}
                                </p>
                                {holderName && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <UserAvatar name={holderName} />
                                    <span className="text-xs text-muted-foreground truncate">
                                      {holderName}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                {getEquipmentStatusBadge(item.status)}
                                {item.status === EquipmentStatus.AVAILABLE && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full hover:bg-primary/10"
                                    title="Solicitar este equipo"
                                    onClick={() =>
                                      handleRequestLoanFor(item.equipmentId)
                                    }
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {renderPagination(filteredEquipment)}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-loans" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Mis Préstamos
                <Badge variant="secondary" className="ml-1">
                  {filteredMyLoans.length}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Historial de tus solicitudes de préstamo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por equipo o estado..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v as LoanFilterStatus);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    <SelectItem value={LoanStatus.PENDING}>
                      Pendiente
                    </SelectItem>
                    <SelectItem value={LoanStatus.APPROVED}>
                      Aprobado
                    </SelectItem>
                    <SelectItem value={LoanStatus.RETURNED}>
                      Devuelto
                    </SelectItem>
                    <SelectItem value={LoanStatus.REJECTED}>
                      Rechazado
                    </SelectItem>
                    <SelectItem value={LoanStatus.CANCELLED}>
                      Cancelado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoadingMyLoans ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : filteredMyLoans.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No tienes solicitudes</p>
                  <p className="text-sm mt-1">
                    Cuando solicites un préstamo aparecerá aquí
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowLoanDialog(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Solicitar un préstamo
                  </Button>
                </div>
              ) : (
                <>
                  <div className="hidden md:block rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead className="w-[35%]">Equipo</TableHead>
                          <TableHead className="w-[25%]">Motivo</TableHead>
                          <TableHead className="w-[15%]">Devolución</TableHead>
                          <TableHead className="w-[15%]">Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginate(filteredMyLoans).map((loan: any) => (
                          <TableRow key={loan.equipmentLoanId} className="h-14">
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium leading-tight">
                                  {loan.equipment?.name || "Equipo"}
                                </span>
                                {loan.equipment?.category && (
                                  <span className="text-xs text-muted-foreground mt-0.5">
                                    {
                                      categoryLabels[
                                        loan.equipment
                                          .category as EquipmentCategory
                                      ]
                                    }
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {loan.reason || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {loan.expectedReturnDate ? (
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(loan.expectedReturnDate)}
                                </span>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              <div
                                title={
                                  loan.approvedBy
                                    ? loan.status === LoanStatus.REJECTED
                                      ? `Rechazado por ${loan.approvedBy.name}`
                                      : `Aprobado por ${loan.approvedBy.name}`
                                    : undefined
                                }
                              >
                                {getLoanStatusBadge(loan.status)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {loan.status === LoanStatus.PENDING && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleCancelLoan(loan.equipmentLoanId)
                                  }
                                  disabled={cancelLoan.isPending}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {paginate(filteredMyLoans).map((loan: any) => (
                      <Card key={loan.equipmentLoanId}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">
                                {loan.equipment?.name || "Equipo"}
                              </p>
                              {loan.equipment?.category && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {
                                    categoryLabels[
                                      loan.equipment
                                        .category as EquipmentCategory
                                    ]
                                  }
                                </p>
                              )}
                              {loan.reason && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  Motivo: {loan.reason}
                                </p>
                              )}
                              {loan.expectedReturnDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  <Calendar className="inline h-3 w-3 mr-1" />
                                  {formatDate(loan.expectedReturnDate)}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {getLoanStatusBadge(loan.status)}
                              {loan.status === LoanStatus.PENDING && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() =>
                                    handleCancelLoan(loan.equipmentLoanId)
                                  }
                                  disabled={cancelLoan.isPending}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {renderPagination(filteredMyLoans)}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canManageLoans && (
          <TabsContent value="all-loans" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Todas las Solicitudes
                  <Badge variant="secondary" className="ml-1">
                    {filteredAllLoans.length}
                  </Badge>
                  {pendingCount > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      {pendingCount} pendientes
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  Gestiona las solicitudes de préstamo de los colaboradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por equipo, usuario o estado..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => {
                      setStatusFilter(v as LoanFilterStatus);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="mr-2 h-3.5 w-3.5" />
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos los estados</SelectItem>
                      <SelectItem value={LoanStatus.PENDING}>
                        Pendiente
                      </SelectItem>
                      <SelectItem value={LoanStatus.APPROVED}>
                        Aprobado
                      </SelectItem>
                      <SelectItem value={LoanStatus.RETURNED}>
                        Devuelto
                      </SelectItem>
                      <SelectItem value={LoanStatus.REJECTED}>
                        Rechazado
                      </SelectItem>
                      <SelectItem value={LoanStatus.CANCELLED}>
                        Cancelado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingAllLoans ? (
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : filteredAllLoans.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No hay solicitudes</p>
                    <p className="text-sm mt-1">
                      Cuando los colaboradores soliciten préstamos aparecerán
                      aquí
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-[28%]">Equipo</TableHead>
                            <TableHead className="w-[18%]">
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
                          {paginate(filteredAllLoans).map((loan: any) => (
                            <TableRow
                              key={loan.equipmentLoanId}
                              className="h-14"
                            >
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium leading-tight">
                                    {loan.equipment?.name || "Equipo"}
                                  </span>
                                  {loan.equipment?.category && (
                                    <span className="text-xs text-muted-foreground mt-0.5">
                                      {
                                        categoryLabels[
                                          loan.equipment
                                            .category as EquipmentCategory
                                        ]
                                      }
                                      {loan.expectedReturnDate &&
                                        ` · Dev. ${formatDate(loan.expectedReturnDate)}`}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {loan.user?.name ? (
                                  <div className="flex items-center gap-2">
                                    <UserAvatar name={loan.user.name} />
                                    <span className="text-sm truncate">
                                      {loan.user.name}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                {loan.reason || "—"}
                              </TableCell>
                              <TableCell>
                                {getLoanStatusBadge(loan.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1.5 flex-wrap">
                                  {loan.status === LoanStatus.PENDING && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() =>
                                          handleApproveLoan(
                                            loan.equipmentLoanId,
                                          )
                                        }
                                        disabled={updateStatus.isPending}
                                      >
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Aprobar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-7 text-xs"
                                        onClick={() =>
                                          handleRejectLoan(loan.equipmentLoanId)
                                        }
                                        disabled={updateStatus.isPending}
                                      >
                                        <XCircle className="mr-1 h-3 w-3" />
                                        Rechazar
                                      </Button>
                                    </>
                                  )}
                                  {loan.status === LoanStatus.APPROVED && (
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={() =>
                                        handleReturnLoan(loan.equipmentLoanId)
                                      }
                                      disabled={updateStatus.isPending}
                                    >
                                      <RotateCcw className="mr-1 h-3 w-3" />
                                      Devolución
                                    </Button>
                                  )}
                                  {(loan.status === LoanStatus.RETURNED ||
                                    loan.status === LoanStatus.REJECTED ||
                                    loan.status === LoanStatus.CANCELLED) && (
                                    <span className="text-xs text-muted-foreground self-center">
                                      —
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="md:hidden space-y-3">
                      {paginate(filteredAllLoans).map((loan: any) => (
                        <Card key={loan.equipmentLoanId}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">
                                  {loan.equipment?.name || "Equipo"}
                                </p>
                                {loan.equipment?.category && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {
                                      categoryLabels[
                                        loan.equipment
                                          .category as EquipmentCategory
                                      ]
                                    }
                                  </p>
                                )}
                                {loan.user?.name && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <UserAvatar name={loan.user.name} />
                                    <span className="text-xs text-muted-foreground truncate">
                                      {loan.user.name}
                                    </span>
                                  </div>
                                )}
                                {loan.reason && (
                                  <p className="text-xs text-muted-foreground mt-1 truncate">
                                    Motivo: {loan.reason}
                                  </p>
                                )}
                              </div>
                              <div className="shrink-0">
                                {getLoanStatusBadge(loan.status)}
                              </div>
                            </div>

                            {(loan.status === LoanStatus.PENDING ||
                              loan.status === LoanStatus.APPROVED) && (
                              <div className="flex gap-2 mt-3 pt-3 border-t">
                                {loan.status === LoanStatus.PENDING && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="flex-1 h-8 text-xs"
                                      onClick={() =>
                                        handleApproveLoan(loan.equipmentLoanId)
                                      }
                                      disabled={updateStatus.isPending}
                                    >
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Aprobar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="flex-1 h-8 text-xs"
                                      onClick={() =>
                                        handleRejectLoan(loan.equipmentLoanId)
                                      }
                                      disabled={updateStatus.isPending}
                                    >
                                      <XCircle className="mr-1 h-3 w-3" />
                                      Rechazar
                                    </Button>
                                  </>
                                )}
                                {loan.status === LoanStatus.APPROVED && (
                                  <Button
                                    size="sm"
                                    className="flex-1 h-8 text-xs"
                                    onClick={() =>
                                      handleReturnLoan(loan.equipmentLoanId)
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    <RotateCcw className="mr-1 h-3 w-3" />
                                    Registrar devolución
                                  </Button>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {renderPagination(filteredAllLoans)}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={showLoanDialog} onOpenChange={setShowLoanDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle>Solicitar Préstamo</DialogTitle>
            <DialogDescription>
              Completa los datos para solicitar el equipo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="equipment">Equipo</Label>
              <Select
                value={selectedEquipmentId}
                onValueChange={setSelectedEquipmentId}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {equipment
                    ?.filter((e: any) => e.status === EquipmentStatus.AVAILABLE)
                    .map((item: any) => (
                      <SelectItem
                        key={item.equipmentId}
                        value={item.equipmentId}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm">{item.name}</span>
                          
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {selectedEquipmentId &&
                (() => {
                  const selectedEquipment = equipment?.find(
                    (e: any) => e.equipmentId === selectedEquipmentId,
                  );
                  return selectedEquipment?.serialNumber ? (
                    <p className="text-xs text-muted-foreground">
                      Serial: {selectedEquipment.serialNumber}
                    </p>
                  ) : null;
                })()}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                placeholder="¿Para qué necesitas el equipo?"
                value={loanReason}
                onChange={(e) => setLoanReason(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observation">Observaciones</Label>
              <Textarea
                id="observation"
                placeholder="Observaciones adicionales"
                value={loanObservation}
                onChange={(e) => setLoanObservation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoanDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateLoan}
              disabled={createLoan.isPending || !selectedEquipmentId}
            >
              {createLoan.isPending ? "Enviando..." : "Solicitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {(isAdmin || isLeader) && (
        <Dialog
          open={showEquipmentDialog}
          onOpenChange={setShowEquipmentDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Equipo</DialogTitle>
              <DialogDescription>
                Ingresa los datos del equipo a registrar
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEquipment}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Equipo *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Laptop HP"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Número de Serie</Label>
                  <Input
                    id="serialNumber"
                    name="serialNumber"
                    placeholder="Número de serie del equipo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationId">Ubicación</Label>
                  <Select name="locationId">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.map((location: any) => (
                        <SelectItem
                          key={location.locationId}
                          value={location.locationId}
                        >
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descripción adicional del equipo"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEquipmentDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEquipment.isPending}>
                  {createEquipment.isPending ? "Registrando..." : "Registrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Devolución</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas registrar la devolución de este
              equipo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReturnDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmReturn} disabled={updateStatus.isPending}>
              {updateStatus.isPending
                ? "Procesando..."
                : "Confirmar Devolución"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

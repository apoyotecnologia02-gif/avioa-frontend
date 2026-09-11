// components/equipment-loans/EquipmentLoans.tsx
"use client";

import { useState, useEffect } from "react";
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

const categoryLabels = {
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

const ITEMS_PER_PAGE = 6;

export function EquipmentLoans() {
  const { user } = useAuth();

  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin";
  const isLeader =
    user?.isLeader === true || role === "manager" || role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("equipment");
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [showEquipmentDialog, setShowEquipmentDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [loanReason, setLoanReason] = useState("");
  const [loanObservation, setLoanObservation] = useState("");
  const [loanReturnDate, setLoanReturnDate] = useState("");

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
  } = useAllLoans(undefined, { enabled: isLeader });

  const { data: locations } = useLocations();

  const createLoan = useCreateLoan();
  const createEquipment = useCreateEquipment();
  const updateStatus = useUpdateLoanStatus();
  const cancelLoan = useCancelLoan();

  // Refetch automático cuando lleguen eventos de equipment loans por websocket
  useEffect(() => {
    const handleEquipmentLoanUpdate = () => {
      refetchEquipment();
      refetchMyLoans();
      if (isLeader) refetchAllLoans();
    };

    window.addEventListener("equipment-loan-update", handleEquipmentLoanUpdate);

    return () => {
      window.removeEventListener(
        "equipment-loan-update",
        handleEquipmentLoanUpdate,
      );
    };
  }, [isLeader, refetchEquipment, refetchMyLoans, refetchAllLoans]);

  const pendingCount = (allLoans ?? []).filter(
    (l: any) => l.status === LoanStatus.PENDING,
  ).length;

  const filteredEquipment = (equipment ?? []).filter((item: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      (item.serialNumber &&
        item.serialNumber.toLowerCase().includes(searchLower)) ||
      (item.location?.name &&
        item.location.name.toLowerCase().includes(searchLower))
    );
  });

  const filteredMyLoans = (myLoans ?? []).filter((loan: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (loan.equipment?.name ?? "").toLowerCase().includes(searchLower) ||
      loan.status.toLowerCase().includes(searchLower) ||
      (loan.reason && loan.reason.toLowerCase().includes(searchLower))
    );
  });

  const filteredAllLoans = (allLoans ?? []).filter((loan: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (loan.equipment?.name ?? "").toLowerCase().includes(searchLower) ||
      (loan.user?.name ?? "").toLowerCase().includes(searchLower) ||
      loan.status.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = (items: any[]) => Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginate = (items: any[]) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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
          {currentPage}
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

  const handleCreateLoan = () => {
    if (!selectedEquipmentId || !loanReturnDate) return;

    createLoan.mutate(
      {
        equipmentId: selectedEquipmentId,
        reason: loanReason,
        observation: loanObservation,
        expectedReturnDate: loanReturnDate,
      },
      {
        onSuccess: () => {
          setShowLoanDialog(false);
          setSelectedEquipmentId("");
          setLoanReason("");
          setLoanObservation("");
          setLoanReturnDate("");
          refetchMyLoans();
          refetchEquipment();
          if (isLeader) refetchAllLoans();
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
        if (isLeader) refetchAllLoans();
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
    return (
      <Badge className={config.className} variant="secondary">
        {config.label}
      </Badge>
    );
  };

  const getLoanStatusBadge = (status: LoanStatus) => {
    const config = loanStatusConfig[status];
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
          {isAdmin && (
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
          {isLeader && (
            <TabsTrigger
              value="all-loans"
              className="relative rounded-md border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Todos los Préstamos
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="equipment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventario de Equipos
              </CardTitle>
              <CardDescription>
                Lista de todos los equipos disponibles en la organización
              </CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, categoría, serial o ubicación..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingEquipment ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredEquipment.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron equipos</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Equipo</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Serial</TableHead>
                          <TableHead>Ubicación</TableHead>
                          <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginate(filteredEquipment).map((item: any) => (
                          <TableRow key={item.equipmentId}>
                            <TableCell className="font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell>
                              {categoryLabels[item.category as EquipmentCategory]}
                            </TableCell>
                            <TableCell>{item.serialNumber || "—"}</TableCell>
                            <TableCell>
                              {item.location?.name || "Sin ubicación"}
                            </TableCell>
                            <TableCell className="text-right">
                              {getEquipmentStatusBadge(item.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {paginate(filteredEquipment).map((item: any) => (
                      <Card key={item.equipmentId}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {categoryLabels[item.category as EquipmentCategory]}
                              </p>
                              {item.serialNumber && (
                                <p className="text-sm text-muted-foreground">
                                  Serial: {item.serialNumber}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {item.location?.name || "Sin ubicación"}
                              </p>
                            </div>
                            {getEquipmentStatusBadge(item.status)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <p>
                      Mostrando {paginate(filteredEquipment).length} de{" "}
                      {filteredEquipment.length} equipos
                    </p>
                  </div>

                  {renderPagination(filteredEquipment)}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-loans" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Mis Préstamos
              </CardTitle>
              <CardDescription>
                Historial de tus solicitudes de préstamo
              </CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por equipo o estado..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMyLoans ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredMyLoans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes solicitudes de préstamo</p>
                  <Button
                    variant="link"
                    onClick={() => setShowLoanDialog(true)}
                    className="mt-2"
                  >
                    Solicitar un préstamo
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginate(filteredMyLoans).map((loan: any) => (
                      <Card key={loan.equipmentLoanId}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {loan.equipment?.name || "Equipo"}
                                </p>
                                {getLoanStatusBadge(loan.status)}
                              </div>
                              {loan.reason && (
                                <p className="text-sm text-muted-foreground">
                                  Motivo: {loan.reason}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                <Calendar className="inline h-3 w-3 mr-1" />
                                Devolución esperada:{" "}
                                {formatDate(loan.expectedReturnDate)}
                              </p>
                              {loan.actualReturnDate && (
                                <p className="text-sm text-muted-foreground">
                                  <RotateCcw className="inline h-3 w-3 mr-1" />
                                  Devuelto: {formatDate(loan.actualReturnDate)}
                                </p>
                              )}
                              {loan.approvedBy && (
                                <p className="text-sm text-muted-foreground">
                                  <User className="inline h-3 w-3 mr-1" />
                                  Aprobado por: {loan.approvedBy.name}
                                </p>
                              )}
                            </div>
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
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <p>
                      Mostrando {paginate(filteredMyLoans).length} de{" "}
                      {filteredMyLoans.length} solicitudes
                    </p>
                  </div>

                  {renderPagination(filteredMyLoans)}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isLeader && (
          <TabsContent value="all-loans" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Todas las Solicitudes
                </CardTitle>
                <CardDescription>
                  Gestiona las solicitudes de préstamo de los colaboradores
                </CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por equipo, usuario o estado..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAllLoans ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : filteredAllLoans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay solicitudes de préstamo</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginate(filteredAllLoans).map((loan: any) => (
                        <Card key={loan.equipmentLoanId}>
                          <CardContent className="pt-6">
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium">
                                      {loan.equipment?.name || "Equipo"}
                                    </p>
                                    {getLoanStatusBadge(loan.status)}
                                    <Badge variant="outline">
                                      {loan.user?.name || "Usuario"}
                                    </Badge>
                                  </div>
                                  {loan.reason && (
                                    <p className="text-sm text-muted-foreground">
                                      Motivo: {loan.reason}
                                    </p>
                                  )}
                                  {loan.observation && (
                                    <p className="text-sm text-muted-foreground">
                                      Observación: {loan.observation}
                                    </p>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    <Calendar className="inline h-3 w-3 mr-1" />
                                    Devolución esperada:{" "}
                                    {formatDateLong(loan.expectedReturnDate)}
                                  </p>
                                  {loan.approvedBy && (
                                    <p className="text-sm text-muted-foreground">
                                      <CheckCircle className="inline h-3 w-3 mr-1 text-green-500" />
                                      Aprobado por: {loan.approvedBy.name}
                                    </p>
                                  )}
                                  {loan.actualReturnDate && (
                                    <p className="text-sm text-muted-foreground">
                                      <RotateCcw className="inline h-3 w-3 mr-1" />
                                      Devuelto:{" "}
                                      {formatDateLong(loan.actualReturnDate)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                {loan.status === LoanStatus.PENDING && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleApproveLoan(loan.equipmentLoanId)
                                      }
                                      disabled={updateStatus.isPending}
                                    >
                                      <CheckCircle className="mr-1 h-4 w-4" />
                                      Aprobar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleRejectLoan(loan.equipmentLoanId)
                                      }
                                      disabled={updateStatus.isPending}
                                    >
                                      <XCircle className="mr-1 h-4 w-4" />
                                      Rechazar
                                    </Button>
                                  </>
                                )}
                                {loan.status === LoanStatus.APPROVED && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleReturnLoan(loan.equipmentLoanId)
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    <RotateCcw className="mr-1 h-4 w-4" />
                                    Registrar Devolución
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <p>
                        Mostrando {paginate(filteredAllLoans).length} de{" "}
                        {filteredAllLoans.length} solicitudes
                      </p>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Préstamo</DialogTitle>
            <DialogDescription>
              Completa los datos para solicitar el equipo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipo</Label>
              <Select onValueChange={setSelectedEquipmentId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent>
                  {equipment
                    ?.filter(
                      (e: any) => e.status === EquipmentStatus.AVAILABLE,
                    )
                    .map((item: any) => (
                      <SelectItem
                        key={item.equipmentId}
                        value={item.equipmentId}
                      >
                        {item.name}{" "}
                        {item.serialNumber && `(${item.serialNumber})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <Label htmlFor="returnDate">Fecha esperada de devolución</Label>
              <Input
                id="returnDate"
                type="date"
                value={loanReturnDate}
                onChange={(e) => setLoanReturnDate(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoanDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateLoan}
              disabled={
                createLoan.isPending || !selectedEquipmentId || !loanReturnDate
              }
            >
              {createLoan.isPending ? "Enviando..." : "Solicitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <Dialog open={showEquipmentDialog} onOpenChange={setShowEquipmentDialog}>
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
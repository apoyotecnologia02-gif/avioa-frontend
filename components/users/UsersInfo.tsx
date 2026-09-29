// components/users/UsersInfo.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Users,
  Mail,
  Phone,
  AlertCircle,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
  Heart,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetUsers } from "@/hooks/useGetUsers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ITEMS_PER_PAGE = 10;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  area?: string;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
  office?: string;
  position?: string;
  department?: string;
  startDate?: string;
  contractType?: string;
  // documentType?: string;
  // documentNumber?: string;
  birthDate?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRel?: string;
  leaderName?: string;    
  managerName?: string;     
}

// Traducción de roles para mostrar
const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  LEADER: "Líder",
  EMPLOYEE: "Empleado",
  HR: "Recursos Humanos",
  RRHH: "Recursos Humanos",
};

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  INDEFINITE: "Indefinido",
  FIXED_TERM: "Término fijo",
  WORK_OR_LABOR: "Obra o labor",
  APPRENTICESHIP: "Aprendizaje",
  TEMPORARY: "Temporal",
  INTERNSHIP: "Pasantía",
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CC: "Cédula de ciudadanía",
  CE: "Cédula de extranjería",
  PASSPORT: "Pasaporte",
  NIT: "NIT",
  TI: "Tarjeta de identidad",
};

// ===== HELPERS =====
const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
};

const formatDate = (date?: string) => {
  if (!date) return null;
  try {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return date;
  }
};

// ===== SUBCOMPONENT: Campo del modal =====
function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

// ===== SUBCOMPONENT: Modal de colaborador =====
function UserDetailModal({
  user,
  open,
  onOpenChange,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!user) return null;

  const contractLabel = user.contractType
    ? CONTRACT_TYPE_LABELS[user.contractType] || user.contractType
    : null;

  // const documentLabel = user.documentType
  //   ? DOCUMENT_TYPE_LABELS[user.documentType] || user.documentType
  //   : null;

  const hasEmergencyContact =
    user.emergencyContactName ||
    user.emergencyContactPhone ||
    user.emergencyContactRel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Información de {user.name}
          </DialogTitle>
        </DialogHeader>

        {/* Cabecera con avatar grande */}
        <div className="flex flex-col items-center pt-2 pb-4">
          <Avatar className="h-24 w-24 mb-3">
            <AvatarImage
              src={user.avatarUrl || user.avatar}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <h3 className="text-xl font-bold text-center">{user.name}</h3>

          {user.position && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.position}
            </p>
          )}

          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <Badge variant="secondary">
              {ROLE_LABELS[user.role] || user.role}
            </Badge>
            {user.area && (
              <Badge variant="outline" className="gap-1">
                <Building className="h-3 w-3" />
                {user.area}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Información de contacto y laboral */}
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Información de contacto
          </h4>
          <InfoField icon={Mail} label="Correo electrónico" value={user.email} />
          <InfoField icon={Phone} label="Teléfono" value={user.phone} />
          <InfoField icon={MapPin} label="Dirección" value={user.address} />
        </div>

        <Separator />

        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Información laboral
          </h4>
          <InfoField icon={Briefcase} label="Cargo" value={user.position} />
          <InfoField icon={Building} label="Área" value={user.area} />
          <InfoField
            icon={Building}
            label="Departamento"
            value={user.department}
          />
          <InfoField icon={MapPin} label="Oficina" value={user.office} />
          <InfoField
            icon={Calendar}
            label="Fecha de ingreso"
            value={formatDate(user.startDate)}
          />
          <InfoField
            icon={FileText}
            label="Tipo de contrato"
            value={contractLabel}
          />
          <InfoField icon={User} label="Líder" value={user.leaderName} />
          <InfoField icon={User} label="Gerente" value={user.managerName} />
        </div>

        {/* Información personal */}
        {(
          // user.birthDate ||
          // user.documentType) && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Información personal
              </h4>
              {/* <InfoField
                icon={FileText}
                label="Tipo de documento"
                value={documentLabel}
              />
              <InfoField
                icon={FileText}
                label="Número de documento"
                value={user.documentNumber}
              /> */}
              <InfoField
                icon={Calendar}
                label="Fecha de nacimiento"
                value={formatDate(user.birthDate)}
              />
            </div>
          </>
        )}

        {/* Contacto de emergencia */}
        {hasEmergencyContact && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Contacto de emergencia
              </h4>
              <InfoField
                icon={Heart}
                label="Nombre"
                value={user.emergencyContactName}
              />
              <InfoField
                icon={Phone}
                label="Teléfono"
                value={user.emergencyContactPhone}
              />
              <InfoField
                icon={User}
                label="Parentesco"
                value={user.emergencyContactRel}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export function UsersInfo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: users, isLoading, isError, error } = useGetUsers();

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const searchLower = searchTerm.toLowerCase();
    return users.filter((user: User) => {
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower) ||
        user.area?.toLowerCase().includes(searchLower) ||
        user.office?.toLowerCase().includes(searchLower) ||
        user.position?.toLowerCase().includes(searchLower) ||
        user.department?.toLowerCase().includes(searchLower) ||
        false
      );
    });
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleOpenUser = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

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
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // ===== ESTADO DE CARGA =====
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                Directorio de Colaboradores
              </CardTitle>
              <CardDescription>Cargando colaboradores...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===== ESTADO DE ERROR =====
  if (isError) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5" />
            Directorio de Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudieron cargar los colaboradores.
              {error instanceof Error && ` Error: ${error.message}`}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // ===== SIN USUARIOS =====
  if (!users || users.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                Directorio de Colaboradores
              </CardTitle>
              <CardDescription>
                No hay colaboradores registrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron colaboradores en el sistema</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===== VISTA PRINCIPAL =====
  return (
    <>
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                Directorio de Colaboradores
              </CardTitle>
              <CardDescription>
                Consulta el perfil de cada colaborador de la organización
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="whitespace-nowrap">
                {users.length} colaboradores
              </Badge>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, cargo, área, email u oficina..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* ===== Versión Desktop - Tabla ===== */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Colaborador</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead className="hidden lg:table-cell">Email</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Teléfono
                  </TableHead>
                  <TableHead className="text-right">Oficina</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No se encontraron colaboradores que coincidan con la
                      búsqueda
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user: User) => (
                    <TableRow
                      key={user.id || user.name}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleOpenUser(user)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={user.avatarUrl || user.avatar}
                              alt={user.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {user.role}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.area || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{user.phone || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="font-normal">
                          {user.office || "—"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ===== Versión Mobile - Cards ===== */}
          <div className="md:hidden space-y-4">
            {paginatedUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron colaboradores
              </div>
            ) : (
              paginatedUsers.map((user: User) => (
                <Card
                  key={user.id || user.name}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleOpenUser(user)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={user.avatarUrl || user.avatar}
                          alt={user.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{user.name}</p>
                        <Badge
                          variant="secondary"
                          className="font-normal mt-1"
                        >
                          {ROLE_LABELS[user.role] || user.role}
                        </Badge>
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{user.area || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{user.phone || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* ===== Contador + Paginación ===== */}
          {filteredUsers.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <p>
                Mostrando {paginatedUsers.length} de {filteredUsers.length}{" "}
                colaboradores
              </p>
            </div>
          )}

          {renderPagination()}
        </CardContent>
      </Card>

      {/* ===== Modal de detalle ===== */}
      <UserDetailModal
        user={selectedUser}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
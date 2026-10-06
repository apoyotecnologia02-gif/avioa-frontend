"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Search,
  UserCog,
  UserX,
  X,
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
import { FieldError } from "@/components/ui/field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Role,
  DocumentType,
  ContractType,
  type CreateUserDto,
  type User,
  UserStatus,
  Area,
  Office,
  LegalEntity,
  UserDetail,
} from "@/types/user.types";
import { NumericFormat } from "react-number-format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const createUserSchema = z
  .object({
    name: z.string().min(2, "El nombre es requerido"),
    email: z
      .string()
      .email("Ingresa un correo electrónico válido")
      .optional()
      .or(z.literal("")),
    role: z.nativeEnum(Role),
    department: z.string().optional().or(z.literal("")),
    area: z.string().optional().or(z.literal("")),
    position: z.string().optional().or(z.literal("")),
    birthDate: z.coerce.date({ message: "Fecha invalida" }).optional(),
    startDate: z.coerce.date().optional(),
    documentType: z.nativeEnum(DocumentType).optional(),
    documentNumber: z.string().optional(),
    office: z.string(),
    contractType: z.nativeEnum(ContractType).optional(),
    eps: z.string().optional(),
    afp: z.string().optional(),
    arl: z.string().optional(),
    salary: z.coerce.number().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactRel: z.string().optional(),
    leaderId: z.string().optional(),
    managerId: z.string().optional(),
    legalEntity: z.nativeEnum(LegalEntity).optional(),
    // vacationDaysAdjustment: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.documentType && !data.documentNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentNumber"],
        message: "Se debe enviar el número de documento si se envía el tipo.",
      });
    }

    if (data.documentNumber && !data.documentType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentType"],
        message: "Se debe enviar el tipo de documento si se envía el número.",
      });
    }

    if (
      data.emergencyContactName &&
      !data.emergencyContactPhone &&
      !data.emergencyContactRel
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["emergencyContactPhone", "emergencyContactRel"],
        message:
          "Se deben enviar los datos del contacto de emergencia si se envía el nombre.",
      });
    }

    if (
      data.emergencyContactPhone &&
      !data.emergencyContactName &&
      !data.emergencyContactRel
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["emergencyContactName", "emergencyContactRel"],
        message:
          "Se deben enviar los datos del contacto de emergencia si se envía el telefono.",
      });
    }

    if (
      data.emergencyContactRel &&
      !data.emergencyContactName &&
      !data.emergencyContactPhone
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["emergencyContactName", "emergencyContactPhone"],
        message:
          "Se deben enviar los datos del contacto de emergencia si se envía la relacion.",
      });
    }
  });

type CreateUserFormData = z.infer<typeof createUserSchema>;

/** Convierte un ISO string a "YYYY-MM-DD" sin desfase por zona horaria. */
const toInputDate = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  return value.slice(0, 10);
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [rowActionLoadingId, setRowActionLoadingId] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const isEditMode = editingUser !== null;

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.area?.toLowerCase().includes(q) ||
        u.status?.toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: Role.EMPLOYEE,
      department: "",
      position: "",
      area: "",
      leaderId: undefined,
      managerId: undefined,
      birthDate: undefined,
      startDate: undefined,
      documentType: undefined,
      documentNumber: undefined,
      office: "",
      contractType: undefined,
      eps: undefined,
      afp: undefined,
      arl: undefined,
      salary: undefined,
      emergencyContactName: undefined,
      emergencyContactPhone: undefined,
      emergencyContactRel: undefined,
      // vacationDaysAdjustment: undefined,
      email: undefined,
    },
  });

  const selectedRole = watch("role");
  const selectedArea = watch("area");
  const selectedDocumentType = watch("documentType");
  const selectedOffice = watch("office");
  const selectedContractType = watch("contractType");
  const selectedEmergencyContact = watch("emergencyContactPhone");
  const selectedLegalEntity = watch("legalEntity");

  const leaders = users.filter(
    (user) =>
      (user.role === Role.LEADER || user.isLeader === true) &&
      user.status === UserStatus.ACTIVE,
  );
  const managers = users.filter(
    (user) => user.role === Role.MANAGER && user.status === UserStatus.ACTIVE,
  );

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await api.get<User[]>("/admin/users", {
        skip401Redirect: true,
      });

      setUsers(response.data);
    } catch (err) {
      toast({
        title: "Error al cargar usuarios",
        description:
          err instanceof Error
            ? err.message
            : "No se pudo obtener la lista de usuarios.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedRole === Role.EMPLOYEE) {
      setValue("managerId", undefined);
    }
    if (selectedRole === Role.LEADER) {
      setValue("leaderId", undefined);
    }
    if (selectedRole === Role.MANAGER || selectedRole === Role.ADMIN) {
      setValue("leaderId", undefined);
      setValue("managerId", undefined);
    }
  }, [selectedRole, setValue]);

  const openCreateModal = () => {
    setEditingUser(null);
    reset({
      role: Role.EMPLOYEE,
      department: "",
      position: "",
      area: "",
      leaderId: undefined,
      managerId: undefined,
      birthDate: undefined,
      startDate: undefined,
      documentType: undefined,
      documentNumber: undefined,
      office: "",
      contractType: undefined,
      eps: undefined,
      afp: undefined,
      arl: undefined,
      salary: undefined,
      emergencyContactName: undefined,
      emergencyContactPhone: undefined,
      emergencyContactRel: undefined,
      email: undefined,
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
    setIsLoadingDetail(true);

    try {
      const { data } = await api.get<UserDetail>(
        `/admin/users/${user.userId}`,
        {
          skip401Redirect: true,
        },
      );

      reset({
        name: data.name ?? "",
        email: data.email ?? "",
        role: data.role,
        department: data.department ?? "",
        position: data.position ?? "",
        area: data.area ?? "",
        leaderId: data.leaderId ?? undefined,
        managerId: data.managerId ?? undefined,
        birthDate: toInputDate(data.birthDate) as any,
        startDate: toInputDate(data.startDate) as any,
        documentType: data.documentType ?? undefined,
        documentNumber: data.documentNumber ?? undefined,
        office: data.office ?? "",
        contractType: data.contractType ?? undefined,
        eps: data.eps ?? undefined,
        afp: data.afp ?? undefined,
        arl: data.arl ?? undefined,
        salary:
          data.salary != null && data.salary !== ""
            ? Number(data.salary)
            : undefined,
        emergencyContactName: data.emergencyContactName ?? undefined,
        emergencyContactPhone: data.emergencyContactPhone ?? undefined,
        emergencyContactRel: data.emergencyContactRel ?? undefined,
        legalEntity: data.legalEntity ?? undefined,
      });
    } catch (err) {
      toast({
        title: "No se pudo cargar el usuario",
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
      setIsModalOpen(false);
      setEditingUser(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSaving(true);
    try {
      const payload: CreateUserDto = {
        name: data.name,
        email: data.email || undefined,
        role: data.role,
        department: data.department || undefined,
        area: data.area || undefined,
        position: data.position || undefined,
        birthDate: data.birthDate || undefined,
        leaderId:
          data.role === Role.EMPLOYEE ? data.leaderId || undefined : undefined,
        managerId:
          data.role === Role.LEADER ? data.managerId || undefined : undefined,
        startDate: data.startDate || undefined,
        documentType: data.documentType || undefined,
        documentNumber: data.documentNumber || undefined,
        office: data.office,
        contractType: data.contractType || undefined,
        eps: data.eps || undefined,
        afp: data.afp || undefined,
        arl: data.arl || undefined,
        salary: data.salary || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactPhone: data.emergencyContactPhone || undefined,
        emergencyContactRel: data.emergencyContactRel || undefined,
        legalEntity: data.legalEntity || undefined,
        // vacationDaysAdjustment:
        //   data.vacationDaysAdjustment !== undefined &&
        //   !Number.isNaN(data.vacationDaysAdjustment)
        //     ? Number(data.vacationDaysAdjustment)
        //     : undefined,
      };

      if (isEditMode && editingUser) {
        await api.patch(
          `/admin/users/${editingUser.userId}/update-admin`,
          payload,
          {
            skip401Redirect: true,
          },
        );
        toast({
          title: "Usuario actualizado",
          description: "Los datos del empleado fueron guardados correctamente.",
        });
      } else {
        await api.post("/admin/users", payload, { skip401Redirect: true });
        toast({
          title: "Empleado registrado",
          description:
            "El empleado se ha registrado correctamente en el sistema.",
        });
      }

      reset({
        name: "",
        email: "",
        role: Role.EMPLOYEE,
        department: "",
        position: "",
        birthDate: undefined,
        leaderId: undefined,
        managerId: undefined,
        startDate: undefined,
        documentType: undefined,
        documentNumber: undefined,
        office: "",
        contractType: undefined,
        eps: undefined,
        afp: undefined,
        arl: undefined,
        salary: undefined,
        emergencyContactName: undefined,
        emergencyContactPhone: undefined,
        emergencyContactRel: undefined,
        legalEntity: undefined,
      });
      setEditingUser(null);
      setIsModalOpen(false);
      await loadUsers();
    } catch (err) {
      const description =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : "No se pudo guardar. Verifica los datos e intenta nuevamente.";

      toast({
        title: isEditMode ? "Error al actualizar" : "Error al registrar",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (
    userId: string,
    status: UserStatus.ACTIVE | UserStatus.INACTIVE,
  ) => {
    setRowActionLoadingId(userId);
    try {
      await api.patch(
        `/admin/users/${userId}`,
        { status },
        { skip401Redirect: true },
      );
      toast({
        title: status === "ACTIVE" ? "Usuario activado" : "Usuario desactivado",
      });
      await loadUsers();
    } catch (err) {
      toast({
        title: "No se pudo actualizar el estado",
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setRowActionLoadingId(null);
    }
  };

  const resendInvite = async (userId: string) => {
    setRowActionLoadingId(userId);
    try {
      await api.post(
        `/admin/users/${userId}/resend-invite`,
        {},
        { skip401Redirect: true },
      );
      toast({
        title: "Invitación reenviada",
      });
    } catch (err) {
      toast({
        title: "No se pudo reenviar la invitación",
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setRowActionLoadingId(null);
    }
  };

  const deleteUser = async (userId: string) => {
    setRowActionLoadingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`, { skip401Redirect: true });
      toast({ title: "Usuario eliminado" });
      await loadUsers();
    } catch (err) {
      toast({
        title: "No se pudo eliminar el usuario",
        // description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setRowActionLoadingId(null);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "No disponible";
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
    }).format(date);
  };

  const getStatusBadgeClass = (status: UserStatus) => {
    if (status === UserStatus.PENDING)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (status === UserStatus.ACTIVE)
      return "bg-green-100 text-green-800 border-green-200";
    if (status === UserStatus.INACTIVE)
      return "bg-gray-100 text-gray-800 border-gray-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const onInvalid = (errors: FieldErrors<CreateUserFormData>) => {
    console.log(errors);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Usuarios del sistema</CardTitle>
            <CardDescription>
              Administra invitaciones, estado y jerarquía de usuarios.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={loadUsers}
              disabled={isLoadingUsers}
            >
              {isLoadingUsers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                "Actualizar"
              )}
            </Button>

            <Dialog
              open={isModalOpen}
              onOpenChange={(open) => {
                setIsModalOpen(open);
                if (!open) {
                  setEditingUser(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4" />
                  Registrar empleado
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col gap-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                  <DialogTitle>
                    {isEditMode ? "Editar usuario" : "Invitar usuario"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditMode
                      ? `Actualiza los datos de ${editingUser?.name}.`
                      : "Crea el usuario en estado pendiente. Recibirá un correo para activar su cuenta."}
                  </DialogDescription>
                </DialogHeader>

                {isLoadingDetail ? (
                  <div className="flex-1 flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Cargando datos del usuario...
                    </span>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit(onSubmit, onInvalid)}
                    className="flex flex-col flex-1 min-h-0"
                  >
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
                      {/* ---------- Información personal ---------- */}
                      <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Información personal
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="name">Nombre completo</Label>
                            <Input
                              id="name"
                              placeholder="Juan Perez"
                              {...register("name")}
                            />
                            <FieldError>{errors.name?.message}</FieldError>
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="juan@empresa.com"
                              disabled={isEditMode}
                              {...register("email")}
                            />
                            <FieldError>{errors.email?.message}</FieldError>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="birthDate">
                              Fecha de nacimiento
                            </Label>
                            <Input
                              id="birthDate"
                              type="date"
                              {...register("birthDate")}
                            />
                            <FieldError>{errors.birthDate?.message}</FieldError>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="documentType">
                              Tipo de documento
                            </Label>
                            <Select
                              value={selectedDocumentType}
                              onValueChange={(value) =>
                                setValue(
                                  "documentType",
                                  value as DocumentType,
                                  {
                                    shouldValidate: true,
                                  },
                                )
                              }
                            >
                              <SelectTrigger
                                id="documentType"
                                className="w-full"
                              >
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={DocumentType.CC}>
                                  CC (Cédula de ciudadanía)
                                </SelectItem>
                                <SelectItem value={DocumentType.CE}>
                                  CE (Cédula de extranjería)
                                </SelectItem>
                                <SelectItem value={DocumentType.PA}>
                                  PA (Pasaporte)
                                </SelectItem>
                                <SelectItem value={DocumentType.PEP}>
                                  PEP
                                </SelectItem>
                                <SelectItem value={DocumentType.TI}>
                                  TI
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FieldError>
                              {errors.documentType?.message}
                            </FieldError>
                          </div>

                          {selectedDocumentType && (
                            <div className="space-y-1.5 md:col-span-2">
                              <Label htmlFor="documentNumber">
                                Número de documento
                              </Label>
                              <Controller
                                control={control}
                                name="documentNumber"
                                render={({ field }) => (
                                  <NumericFormat
                                    customInput={Input}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    allowNegative={false}
                                    value={field.value ?? ""}
                                    onValueChange={(values) =>
                                      field.onChange(values.value)
                                    }
                                    placeholder="Número de documento"
                                  />
                                )}
                              />
                              <FieldError>
                                {errors.documentNumber?.message}
                              </FieldError>
                            </div>
                          )}
                        </div>
                      </section>

                      {/* ---------- Información laboral ---------- */}
                      <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Información laboral
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="role">Rol</Label>
                            <Select
                              value={selectedRole}
                              onValueChange={(value) =>
                                setValue("role", value as Role, {
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger id="role" className="w-full">
                                <SelectValue placeholder="Selecciona un rol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={Role.EMPLOYEE}>
                                  EMPLOYEE
                                </SelectItem>
                                <SelectItem value={Role.LEADER}>
                                  LEADER
                                </SelectItem>
                                <SelectItem value={Role.MANAGER}>
                                  MANAGER
                                </SelectItem>
                                <SelectItem value={Role.ADMIN}>
                                  ADMIN
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FieldError>{errors.role?.message}</FieldError>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="area">Área</Label>
                            <Select
                              value={selectedArea}
                              onValueChange={(value) =>
                                setValue("area", value as Area, {
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger id="area" className="w-full">
                                <SelectValue placeholder="Seleccione un área" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(Area).map((area) => (
                                  <SelectItem key={area} value={area}>
                                    {area}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldError>{errors.area?.message}</FieldError>
                          </div>

                          {/* Jerarquía condicional */}
                          {selectedRole === Role.EMPLOYEE && (
                            <div className="space-y-1.5 md:col-span-2">
                              <Label>Líder</Label>
                              <Select
                                value={watch("leaderId") ?? ""}
                                onValueChange={(value) =>
                                  setValue("leaderId", value, {
                                    shouldValidate: true,
                                  })
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecciona un líder" />
                                </SelectTrigger>
                                <SelectContent>
                                  {leaders.map((leader) => (
                                    <SelectItem
                                      key={leader.userId}
                                      value={leader.userId}
                                    >
                                      {leader.name} ({leader.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FieldError>
                                {errors.leaderId?.message}
                              </FieldError>
                            </div>
                          )}

                          {selectedRole === Role.LEADER && (
                            <div className="space-y-1.5 md:col-span-2">
                              <Label>Manager</Label>
                              <Select
                                value={watch("managerId") ?? ""}
                                onValueChange={(value) =>
                                  setValue("managerId", value, {
                                    shouldValidate: true,
                                  })
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecciona un manager" />
                                </SelectTrigger>
                                <SelectContent>
                                  {managers.map((manager) => (
                                    <SelectItem
                                      key={manager.userId}
                                      value={manager.userId}
                                    >
                                      {manager.name} ({manager.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FieldError>
                                {errors.managerId?.message}
                              </FieldError>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <Label htmlFor="position">Cargo</Label>
                            <Input
                              id="position"
                              placeholder="Cargo"
                              {...register("position")}
                            />
                            <FieldError>{errors.position?.message}</FieldError>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="startDate">
                              Fecha de incorporación
                            </Label>
                            <Input
                              id="startDate"
                              type="date"
                              {...register("startDate")}
                            />
                            <FieldError>{errors.startDate?.message}</FieldError>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="office">Oficina</Label>
                            <Select
                              value={selectedOffice}
                              onValueChange={(value) =>
                                setValue("office", value as Office, {
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger id="office" className="w-full">
                                <SelectValue placeholder="Seleccione la oficina" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(Office).map((office) => (
                                  <SelectItem key={office} value={office}>
                                    {office.replaceAll("_", " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldError>{errors.office?.message}</FieldError>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="contractType">
                              Tipo de contrato
                            </Label>
                            <Select
                              value={selectedContractType}
                              onValueChange={(value) =>
                                setValue(
                                  "contractType",
                                  value as ContractType,
                                  {
                                    shouldValidate: true,
                                  },
                                )
                              }
                            >
                              <SelectTrigger
                                id="contractType"
                                className="w-full"
                              >
                                <SelectValue placeholder="Seleccione el tipo de contrato" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(ContractType).map((ct) => (
                                  <SelectItem key={ct} value={ct}>
                                    {ct.replaceAll("_", " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldError>
                              {errors.contractType?.message}
                            </FieldError>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="legalEntity">Razón social</Label>
                            <Select
                              value={selectedLegalEntity}
                              onValueChange={(value) =>
                                setValue("legalEntity", value as LegalEntity, {
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger
                                id="legalEntity"
                                className="w-full"
                              >
                                <SelectValue placeholder="Seleccione la razón social" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(LegalEntity).map((le) => (
                                  <SelectItem key={le} value={le}>
                                    {le.replaceAll("_", " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldError>
                              {errors.legalEntity?.message}
                            </FieldError>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="salary">Salario</Label>
                            <Controller
                              control={control}
                              name="salary"
                              render={({ field }) => (
                                <NumericFormat
                                  customInput={Input}
                                  thousandSeparator="."
                                  decimalSeparator=","
                                  allowNegative={false}
                                  value={field.value ?? ""}
                                  onValueChange={(values) =>
                                    field.onChange(values.floatValue)
                                  }
                                  placeholder="Salario del colaborador"
                                />
                              )}
                            />
                            <FieldError>{errors.salary?.message}</FieldError>
                          </div>
                        </div>
                      </section>

                      {/* ---------- Seguridad social ---------- */}
                      <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Seguridad social
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="eps">EPS</Label>
                            <Input id="eps" type="text" {...register("eps")} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="afp">AFP</Label>
                            <Input id="afp" type="text" {...register("afp")} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="arl">ARL</Label>
                            <Input id="arl" type="text" {...register("arl")} />
                          </div>
                        </div>
                      </section>

                      {/* ---------- Contacto de emergencia ---------- */}
                      <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Contacto de emergencia
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="emergencyContactPhone">
                              Número de contacto
                            </Label>
                            <Input
                              id="emergencyContactPhone"
                              type="text"
                              {...register("emergencyContactPhone")}
                            />
                          </div>

                          {selectedEmergencyContact && (
                            <>
                              <div className="space-y-1.5">
                                <Label htmlFor="emergencyContactName">
                                  Nombre completo
                                </Label>
                                <Input
                                  id="emergencyContactName"
                                  type="text"
                                  {...register("emergencyContactName")}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="emergencyContactRel">
                                  Parentesco
                                </Label>
                                <Input
                                  id="emergencyContactRel"
                                  type="text"
                                  placeholder="Madre, hermano, etc."
                                  {...register("emergencyContactRel")}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </section>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                        disabled={isSaving}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditMode ? "Guardando..." : "Enviando..."}
                          </>
                        ) : isEditMode ? (
                          "Guardar cambios"
                        ) : (
                          "Registrar usuario"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, correo, rol o área..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Filas por página
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando usuarios...
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay usuarios registrados.
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No se encontraron usuarios que coincidan con "{searchQuery}".
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => {
                    const isBusy = rowActionLoadingId === user.userId;
                    const isActive = user.status === UserStatus.ACTIVE;
                    const canResend = user.status === UserStatus.PENDING;
                    const canToggle =
                      user.status === UserStatus.ACTIVE ||
                      user.status === UserStatus.INACTIVE;

                    return (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.area || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClass(user.status)}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isBusy}
                              onClick={() => openEditModal(user)}
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Button>

                            {canResend && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isBusy}
                                onClick={() => resendInvite(user.userId)}
                              >
                                <Mail className="h-4 w-4" />
                                Reenviar invitación
                              </Button>
                            )}

                            {canToggle && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isBusy}
                                  >
                                    {isBusy ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <UserX className="h-4 w-4" />
                                    )}
                                    {isActive ? "Desactivar" : "Activar"}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {isActive
                                        ? "Desactivar usuario"
                                        : "Activar usuario"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {isActive
                                        ? "El usuario perderá acceso al portal hasta reactivarlo."
                                        : "El usuario recuperará acceso al portal."}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        updateStatus(
                                          user.userId,
                                          isActive
                                            ? UserStatus.INACTIVE
                                            : UserStatus.ACTIVE,
                                        )
                                      }
                                    >
                                      Confirmar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={isBusy}
                                >
                                  <UserCog className="h-4 w-4" />
                                  Eliminar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Eliminar usuario
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción es permanente y no se puede
                                    deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                    onClick={() => deleteUser(user.userId)}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * pageSize + 1}–
                    {Math.min(currentPage * pageSize, filteredUsers.length)}
                  </span>{" "}
                  de <span className="font-medium">{filteredUsers.length}</span>{" "}
                  usuarios
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      // Muestra máximo 5 páginas alrededor de la actual
                      .filter((page) => {
                        if (totalPages <= 7) return true;
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && page - prev > 1;
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && (
                              <span className="px-2 text-sm text-muted-foreground">
                                …
                              </span>
                            )}
                            <Button
                              variant={
                                page === currentPage ? "default" : "outline"
                              }
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

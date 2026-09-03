"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Plus, UserCog, UserX } from "lucide-react";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
} from "@/types/user.types";
import { NumericFormat } from "react-number-format";

const createUserSchema = z
  .object({
    name: z.string().min(2, "El nombre es requerido"),
    email: z.string().email("Ingresa un correo válido"),
    role: z.nativeEnum(Role),
    department: z.string().optional().or(z.literal("")),
    area: z.string().optional().or(z.literal("")),
    position: z.string().optional().or(z.literal("")),
    birthDate: z.coerce.date().optional(),
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

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [rowActionLoadingId, setRowActionLoadingId] = useState<string | null>(
    null,
  );

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
    },
  });

  const selectedRole = watch("role");
  const selectedArea = watch("area");
  const selectedDocumentType = watch("documentType");
  const selectedOffice = watch("office");
  const selectedContractType = watch("contractType");
  const selectedEmergencyContact = watch("emergencyContactPhone");

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

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSaving(true);
    try {
      const payload: CreateUserDto = {
        name: data.name,
        email: data.email,
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
      };
      await api.post("/admin/users", payload, { skip401Redirect: true });
      toast({
        title: "Invitación enviada",
        description:
          "El usuario fue creado en estado pendiente y recibirá un correo para activar su cuenta.",
      });
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
      });
      setIsSheetOpen(false);
      await loadUsers();
    } catch (err) {
      const description =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : "No se pudo crear el usuario. Verifica los datos e intenta nuevamente.";

      toast({
        title: "Error al registrar",
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
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" />
                  Invitar empleado
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md max-h-screen overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Invitar usuario</SheetTitle>
                  <SheetDescription>
                    Crea el usuario en estado pendiente y envía correo de
                    invitación.
                  </SheetDescription>
                </SheetHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4 px-4 pb-6"
                >
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
                      <Input
                        id="name"
                        placeholder="Juan Perez"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="email">
                        Correo electrónico
                      </FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juan@empresa.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="role">Rol</FieldLabel>
                      <Select
                        value={selectedRole}
                        onValueChange={(value) =>
                          setValue("role", value as Role, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Role.EMPLOYEE}>
                            EMPLOYEE
                          </SelectItem>
                          <SelectItem value={Role.LEADER}>LEADER</SelectItem>
                          <SelectItem value={Role.MANAGER}>MANAGER</SelectItem>
                          <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="birthDate">
                        Fecha de nacimiento
                      </FieldLabel>
                      <Input
                        id="birthDate"
                        type="date"
                        {...register("birthDate")}
                        placeholder="Fecha de nacimiento"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="area">Área</FieldLabel>
                      <Select
                        value={selectedArea}
                        onValueChange={(value) =>
                          setValue("area", value as Area, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger id="area">
                          <SelectValue placeholder="Seleccione un área" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Area.COMERCIAL}>
                            {Area.COMERCIAL}
                          </SelectItem>
                          <SelectItem value={Area.AUXILIARES}>
                            {Area.AUXILIARES}
                          </SelectItem>
                          <SelectItem value={Area.MAYORISTA}>
                            {Area.MAYORISTA}
                          </SelectItem>
                          <SelectItem value={Area.MERCADEO}>
                            {Area.MERCADEO}
                          </SelectItem>
                          <SelectItem value={Area.TECNOLOGIA}>
                            {Area.TECNOLOGIA}
                          </SelectItem>
                          <SelectItem value={Area.DIRECCION_GERENCIA}>
                            {Area.DIRECCION_GERENCIA}
                          </SelectItem>
                          <SelectItem value={Area.GESTION_HUMANA}>
                            {Area.GESTION_HUMANA}
                          </SelectItem>
                          <SelectItem value={Area.CONTABILIDAD}>
                            {Area.CONTABILIDAD}
                          </SelectItem>
                          <SelectItem value={Area.SERVICIO_AL_CLIENTE}>
                            {Area.SERVICIO_AL_CLIENTE}
                          </SelectItem>
                          <SelectItem value={Area.PRODUCTO}>
                            {Area.PRODUCTO}
                          </SelectItem>
                          <SelectItem value={Area.RESERVAS}>
                            {Area.RESERVAS}
                          </SelectItem>
                          <SelectItem value={Area.BUEN_VIVIR}>
                            {Area.BUEN_VIVIR}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    {selectedRole === Role.EMPLOYEE && (
                      <Field>
                        <FieldLabel>Lider</FieldLabel>
                        <Select
                          onValueChange={(value) =>
                            setValue("leaderId", value, {
                              shouldValidate: true,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un leader" />
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
                      </Field>
                    )}

                    {selectedRole === Role.LEADER && (
                      <Field>
                        <FieldLabel>Manager</FieldLabel>
                        <Select
                          onValueChange={(value) =>
                            setValue("managerId", value, {
                              shouldValidate: true,
                            })
                          }
                        >
                          <SelectTrigger>
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
                      </Field>
                    )}

                    <Field>
                      <FieldLabel htmlFor="startDate">
                        Fecha de incorporación
                      </FieldLabel>
                      <Input
                        id="startDate"
                        type="date"
                        {...register("startDate")}
                        placeholder="Fecha de incorporación"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="documentType">
                        Tipo de documento
                      </FieldLabel>
                      <Select
                        value={selectedDocumentType}
                        onValueChange={(value) =>
                          setValue("documentType", value as DocumentType, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger id="documentType">
                          <SelectValue placeholder="Seleccione un tipo de documento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DocumentType.CC}>
                            CC (Cédula de ciudadania)
                          </SelectItem>
                          <SelectItem value={DocumentType.CE}>
                            CE (Cédula de extranjeria)
                          </SelectItem>
                          <SelectItem value={DocumentType.PA}>
                            PA (Pasaporte)
                          </SelectItem>
                          <SelectItem value={DocumentType.PEP}>
                            PEP (Permiso especial de permanencia)
                          </SelectItem>
                          <SelectItem value={DocumentType.TI}>
                            TI (Tarjeta de identidad)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    {selectedDocumentType && (
                      <Field>
                        <FieldLabel htmlFor="documentNumber">
                          Número de documento
                        </FieldLabel>
                        {/* <Input
                          id="documentNumber"
                          type="text"
                          {...register("documentNumber")}
                          placeholder="Número de documento"
                        /> */}
                        <Controller
                          control={control}
                          name="documentNumber"
                          render={({ field }) => (
                            <NumericFormat
                              customInput={Input}
                              thousandSeparator="."
                              decimalSeparator=","
                              allowNegative={false}
                              onValueChange={(values) =>
                                field.onChange(values.floatValue)
                              }
                              placeholder="Número de documento"
                            />
                          )}
                        />
                      </Field>
                    )}

                    <Field>
                      <FieldLabel htmlFor="office">Oficina</FieldLabel>
                      <Select
                        value={selectedOffice}
                        onValueChange={(value) =>
                          setValue("office", value as Office, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger id="office">
                          <SelectValue placeholder="Seleccione la oficina a la que pertenece el colaborador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Office.BOGOTA}>BOGOTA</SelectItem>
                          <SelectItem value={Office.EL_PENOL}>
                            EL PEÑOL
                          </SelectItem>
                          <SelectItem value={Office.GUARNE}>GUARNE</SelectItem>
                          <SelectItem value={Office.MARINILLA_INDUSTRIAL}>
                            MARINILLA INDUSTRIAL
                          </SelectItem>
                          <SelectItem value={Office.MARINILLA_PARQUE}>
                            MARINILLA PARQUE
                          </SelectItem>
                          <SelectItem value={Office.MEDELLIN}>
                            MEDELLIN
                          </SelectItem>
                          <SelectItem value={Office.NUEVA_AVENIDA}>
                            NUEVA AVENIDA
                          </SelectItem>
                          <SelectItem
                            value={Office.SANTUARIO_CALLE_DEL_COMERCIO}
                          >
                            SANTUARIO CALLE DEL COMERCIO
                          </SelectItem>
                          <SelectItem value={Office.SANTUARIO_PARQUE}>
                            SANTUARIO PARQUE
                          </SelectItem>
                          <SelectItem value={Office.SAN_ANTONIO}>
                            SAN ANTONIO
                          </SelectItem>
                          <SelectItem value={Office.TELETRABAJO}>
                            TELETRABAJO
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="contractType">
                        Tipo de contrato
                      </FieldLabel>
                      <Select
                        value={selectedContractType}
                        onValueChange={(value) =>
                          setValue("contractType", value as ContractType, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger id="contractType">
                          <SelectValue placeholder="Seleccione el tipo de contrato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ContractType.FIJO}>
                            FIJO
                          </SelectItem>
                          <SelectItem value={ContractType.INDEFINIDO}>
                            INDEFINIDO
                          </SelectItem>
                          <SelectItem value={ContractType.OBRA_LABOR}>
                            OBRA LABOR
                          </SelectItem>
                          <SelectItem value={ContractType.PRESTACION}>
                            PRESTACIÓN DE SERVICIOS
                          </SelectItem>
                          <SelectItem value={ContractType.APRENDIZAJE}>
                            APRENDIZAJE
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="eps">EPS</FieldLabel>
                      <Input id="eps" type="text" {...register("eps")} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="afp">AFP</FieldLabel>
                      <Input id="afp" type="text" {...register("afp")} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="arl">ARL</FieldLabel>
                      <Input id="arl" type="text" {...register("arl")} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="salary">Salario</FieldLabel>
                      <Controller
                        control={control}
                        name="salary"
                        render={({ field }) => (
                          <NumericFormat
                            customInput={Input}
                            thousandSeparator="."
                            decimalSeparator=","
                            allowNegative={false}
                            onValueChange={(values) =>
                              field.onChange(values.floatValue)
                            }
                            placeholder="Salario del colaborador"
                          />
                        )}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="emergencyContactPhone">
                        Numero de contacto de emergencia
                      </FieldLabel>
                      <Input
                        id="emergencyContactPhone"
                        type="text"
                        {...register("emergencyContactPhone")}
                      />
                    </Field>

                    {selectedEmergencyContact && (
                      <Field>
                        <FieldLabel htmlFor="emergencyContactName">
                          Nombre del contacto de emergencia
                        </FieldLabel>
                        <Input
                          id="emergencyContactName"
                          type="text"
                          {...register("emergencyContactName")}
                        />
                      </Field>
                    )}

                    {selectedEmergencyContact && (
                      <Field>
                        <FieldLabel htmlFor="emergencyContactRel">
                          Que relacion tiene con el contacto de emergencia
                        </FieldLabel>
                        <Input
                          id="emergencyContactRel"
                          type="text"
                          {...register("emergencyContactRel")}
                          placeholder="Que relacion tiene con el contacto de emergencia"
                        />
                      </Field>
                    )}
                  </FieldGroup>
                  <SheetFooter className="px-0">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Crear invitación"
                      )}
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando usuarios...
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay usuarios registrados.
            </p>
          ) : (
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
                {users.map((user) => {
                  const isBusy = rowActionLoadingId === user.userId;
                  const isActive = user.status === UserStatus.ACTIVE;
                  const canResend = user.status === UserStatus.PENDING;
                  const canToggle =
                    user.status === UserStatus.ACTIVE ||
                    user.status === UserStatus.INACTIVE;

                  return (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">{user.name}</TableCell>
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
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// components/forms/GoogleFormsManager.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Eye,
  Maximize2,
  Minimize2,
  ExternalLink,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetForms } from "@/hooks/useGetForms";
import { useCreateForm } from "@/hooks/useCreateForm";
import { useUpdateForm } from "@/hooks/useUpdateForm";
import { useDeleteForm } from "@/hooks/useDeleteForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  embed_url: z.string().url("Debe ser una URL válida"),
  category: z.string().min(1, "La categoría es requerida"),
  type: z.string().optional(),
  status: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface FormType {
  form_id: string;
  title: string;
  description: string | null;
  category: string;
  embed_url: string | null;
  type: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  schema: any;
  autofill: any;
}

const CATEGORIES = [
  "Evaluación",
  "RRHH",
  "Encuesta",
  "Solicitud",
  "Reporte",
  "Capacitación",
  "Otro",
];

const STATUS_OPTIONS = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "draft", label: "Borrador" },
];

const TYPE_OPTIONS = [
  { value: "google", label: "Google Forms" },
  { value: "custom", label: "Personalizado" },
];

const EDIT_ROLES = ["ADMIN", "LEADER", "MANAGER"];
const DELETE_ROLES = ["ADMIN", "LEADER", "MANAGER"];

const ITEMS_PER_PAGE = 6;

export function GoogleFormsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<FormType | null>(null);
  const [formToDelete, setFormToDelete] = useState<FormType | null>(null);
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filters, setFilters] = useState<{
    category?: string;
    status?: string;
    type?: string;
  }>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  const getRoleFromToken = () => {
    try {
      const token = Cookies.get("portal_access_token") || localStorage.getItem("token");
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        return payload.role || payload.rol || payload.userRole || null;
      }
    } catch (e) {
      console.error("Error decodificando token:", e);
    }
    return null;
  };

  const tokenRole = getRoleFromToken();
  const userRole = currentUser?.role || tokenRole || "";

  const canEdit = EDIT_ROLES.includes(userRole);
  const canDelete = DELETE_ROLES.includes(userRole);

  const {
    data: formsData,
    isLoading: isFormsLoading,
    isError,
    error,
    refetch,
  } = useGetForms({
    ...filters,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const createForm = useCreateForm();
  const updateForm = useUpdateForm();
  const deleteForm = useDeleteForm();

  const forms = formsData?.data || [];
  const total = formsData?.total || 0;
  const totalPages = formsData?.totalPages || 0;

  const filteredForms = useMemo(() => {
    if (!searchTerm.trim()) return forms;
    
    const searchLower = searchTerm.toLowerCase();
    return forms.filter((form) =>
      form.title.toLowerCase().includes(searchLower) ||
      form.description?.toLowerCase().includes(searchLower) ||
      form.category.toLowerCase().includes(searchLower)
    );
  }, [forms, searchTerm]);

  const paginatedForms = useMemo(() => {
    if (searchTerm.trim()) {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      return filteredForms.slice(start, end);
    }
    return filteredForms;
  }, [filteredForms, currentPage, searchTerm]);

  const localTotalPages = useMemo(() => {
    if (searchTerm.trim()) {
      return Math.ceil(filteredForms.length / ITEMS_PER_PAGE);
    }
    return totalPages;
  }, [filteredForms.length, totalPages, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      embed_url: "",
      category: "",
      type: "google",
      status: "active",
    },
  });

  const onSubmit = (data: FormData) => {
    const formData = {
      ...data,
      embed_url: data.embed_url,
    };

    if (editingForm) {
      updateForm.mutate(
        { formId: editingForm.form_id, data: formData },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            form.reset();
            setEditingForm(null);
            refetch();
          },
        }
      );
    } else {
      createForm.mutate(formData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          form.reset();
          refetch();
        },
      });
    }
  };

  const handleDelete = () => {
    if (formToDelete) {
      deleteForm.mutate(formToDelete.form_id, {
        onSuccess: () => {
          setFormToDelete(null);
          refetch();
        },
        onError: (error) => {
          console.error('❌ Error en delete:', error);
        }
      });
    }
  };

  const handleEdit = (currentForm: FormType) => {
    setEditingForm(currentForm);
    form.reset({
      title: currentForm.title,
      description: currentForm.description || "",
      embed_url: currentForm.embed_url || "",
      category: currentForm.category,
      type: currentForm.type || "google",
      status: currentForm.status || "active",
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingForm(null);
    form.reset({
      title: "",
      description: "",
      embed_url: "",
      category: "",
      type: "google",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleViewForm = (form: FormType) => {
    setSelectedForm(form);
    setIsFormModalOpen(true);
    setIsFullscreen(false);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const goToPage = (page: number) => {
    const maxPages = searchTerm.trim() ? localTotalPages : totalPages;
    if (page >= 1 && page <= maxPages) {
      setCurrentPage(page);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  const formsToShow = searchTerm.trim() ? paginatedForms : filteredForms;

  if (isFormsLoading || isUserLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5" />
                Formularios Google
              </CardTitle>
              <CardDescription>Cargando formularios...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            Formularios Google
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudieron cargar los formularios.
              {error instanceof Error && ` Error: ${error.message}`}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const showPagination = (searchTerm.trim() ? localTotalPages : totalPages) > 1;

  return (
    <>
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5" />
                Formularios Google
                {!isUserLoading && userRole && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {userRole}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Gestiona los formularios de Google Forms
                {canEdit && userRole && (
                  <span className="text-green-600 ml-2">• Tienes permisos de edición</span>
                )}
                {!canEdit && userRole && (
                  <span className="text-yellow-600 ml-2">• Solo visualización</span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="whitespace-nowrap">
                {searchTerm.trim() ? filteredForms.length : total} formularios
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {Object.keys(filters).length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0">
                    {Object.keys(filters).length}
                  </Badge>
                )}
              </Button>
              {canEdit && (
                <Button onClick={handleCreate} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Formulario
                </Button>
              )}
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Filtros</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1">
                  <X className="h-3 w-3" />
                  Limpiar
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  value={filters.category || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, type: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {formsToShow.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron formularios</p>
              <p className="text-sm">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Intenta ajustar los filtros o la búsqueda"
                  : "Comienza creando tu primer formulario"}
              </p>
              {!searchTerm && Object.keys(filters).length === 0 && canEdit && (
                <Button onClick={handleCreate} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Crear formulario
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formsToShow.map((form) => (
                  <Card key={form.form_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="font-medium truncate">{form.title}</p>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="secondary" className="font-normal text-xs">
                              {form.category}
                            </Badge>
                            <Badge
                              variant={form.status === "active" ? "default" : "secondary"}
                              className="font-normal text-xs"
                            >
                              {STATUS_OPTIONS.find((s) => s.value === form.status)?.label ||
                                form.status ||
                                "Sin estado"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {form.description || "Sin descripción"}
                          </p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(form.created_at)}
                            </span>
                            {form.type && (
                              <Badge variant="outline" className="text-xs">
                                {TYPE_OPTIONS.find((t) => t.value === form.type)?.label ||
                                  form.type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-4 pt-4 border-t">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-3 gap-1"
                          onClick={() => handleViewForm(form)}
                          disabled={!form.embed_url}
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleEdit(form)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-destructive hover:text-destructive"
                            onClick={() => setFormToDelete(form)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {showPagination && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, searchTerm.trim() ? filteredForms.length : total)} -{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, searchTerm.trim() ? filteredForms.length : total)} de{" "}
                    {searchTerm.trim() ? filteredForms.length : total} formularios
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const maxPages = searchTerm.trim() ? localTotalPages : totalPages;
                        const pages = [];
                        const maxVisible = 5;
                        
                        if (maxPages <= maxVisible) {
                          for (let i = 1; i <= maxPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          if (currentPage <= 3) {
                            for (let i = 1; i <= 5; i++) {
                              pages.push(i);
                            }
                          } else if (currentPage >= maxPages - 2) {
                            for (let i = maxPages - 4; i <= maxPages; i++) {
                              pages.push(i);
                            }
                          } else {
                            for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                              pages.push(i);
                            }
                          }
                        }
                        
                        return pages.map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8"
                            onClick={() => goToPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        ));
                      })()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === (searchTerm.trim() ? localTotalPages : totalPages)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal para ver formulario embebido - TAMAÑO AJUSTADO */}
      <Dialog open={isFormModalOpen} onOpenChange={(open) => {
        setIsFormModalOpen(open);
        if (!open) {
          setIsFullscreen(false);
        }
      }}>
        <DialogContent 
          className={cn(
            "transition-all duration-300 p-0 overflow-hidden",
            // Tamaño por defecto: ocupa casi toda la pantalla
            isFullscreen 
              ? "max-w-[100vw] max-h-[100vh] w-[100vw] h-[100vh] rounded-none" 
              : "max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] rounded-lg"
          )}
          style={{
            // Asegurar que el modal ocupe el espacio máximo disponible
            margin: isFullscreen ? 0 : 'auto',
          }}
        >
          {/* Header del modal - más compacto */}
          <div className={cn(
            "flex items-center justify-between bg-background border-b z-10",
            isFullscreen ? "p-3" : "p-4"
          )}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold truncate">
                {selectedForm?.title || "Formulario"}
              </DialogTitle>
              {selectedForm?.category && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {selectedForm.category}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Botón para abrir en nueva ventana */}
              {selectedForm?.embed_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(selectedForm.embed_url, '_blank')}
                  className="h-8 w-8 p-0"
                  title="Abrir en nueva ventana"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              {/* Botón de pantalla completa */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8 p-0"
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              {/* Botón de cerrar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsFormModalOpen(false);
                  setIsFullscreen(false);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Contenido del modal - ocupa todo el espacio restante */}
          <div className={cn(
            "flex-1 min-h-0 bg-muted/5",
            isFullscreen ? "p-0" : "p-1"
          )}>
            {selectedForm?.embed_url ? (
              <iframe
                src={selectedForm.embed_url}
                className="w-full h-full border-0"
                style={{
                  minHeight: 'calc(100vh - 60px)', // Altura mínima para que se vea bien
                }}
                allowFullScreen
                loading="lazy"
                title={selectedForm.title || "Formulario Google"}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay URL disponible para este formulario</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para crear/editar formulario */}
      {canEdit && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingForm ? "Editar Formulario" : "Nuevo Formulario"}
              </DialogTitle>
              <DialogDescription>
                {editingForm
                  ? "Actualiza la información del formulario"
                  : "Agrega un nuevo formulario de Google al directorio"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Evaluación de Desempeño" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Breve descripción del formulario"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="embed_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL del Formulario *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://docs.google.com/forms/d/e/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingForm(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createForm.isPending || updateForm.isPending}>
                    {(createForm.isPending || updateForm.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingForm ? "Actualizar" : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {canDelete && (
        <AlertDialog open={!!formToDelete} onOpenChange={() => setFormToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente el formulario "{formToDelete?.title}".
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteForm.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
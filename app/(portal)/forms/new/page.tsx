"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  GripVertical,
  Trash2,
  Copy,
  Plus,
  Settings,
  Type,
  Mail,
  Square,
  AlignLeft,
  List,
  CircleDot,
  Hash,
  Calendar,
  Loader2,
  ChevronUp,
  ChevronDown,
  Info,
  Save,
  Eye,
  FileText,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/axios";
import type { FormField, FormCategory } from "@/types/form.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const COMPONENT_TYPES = [
  {
    type: "text",
    label: "Texto Corto",
    icon: Type,
    description: "Campo de texto de una línea",
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
    description: "Campo para correo electrónico",
  },
  {
    type: "number",
    label: "Número",
    icon: Hash,
    description: "Campo numérico",
  },
  {
    type: "date",
    label: "Fecha",
    icon: Calendar,
    description: "Selector de fecha",
  },
  {
    type: "textarea",
    label: "Área de Texto",
    icon: AlignLeft,
    description: "Texto de múltiples líneas",
  },
  {
    type: "select",
    label: "Lista Desplegable",
    icon: List,
    description: "Menú con opciones de selección única",
  },
  {
    type: "checkbox",
    label: "Casilla (Checkbox)",
    icon: Square,
    description: "Casilla de verificación simple",
  },
  {
    type: "radio",
    label: "Botón de Opción",
    icon: CircleDot,
    description: "Opciones con selección única",
  },
];

const categories: FormCategory[] = [
  "RRHH",
  "Operaciones",
  "Finanzas",
  "General",
];

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "_") // replace non-alphanumeric with underscores
    .replace(/^_+|_+$/g, ""); // trim underscores
};

export default function FormBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form metadata states
  const [formTitle, setFormTitle] = useState("Formulario sin título");
  const [formDescription, setFormDescription] = useState(
    "Descripción del formulario",
  );
  const [formCategory, setFormCategory] = useState<FormCategory>("General");

  // Canvas fields list
  const [fields, setFields] = useState<FormField[]>([]);

  // Selection states: can be number (index of field), 'header' (metadata), or null (no selection)
  const [selectedIndex, setSelectedIndex] = useState<number | "header">(
    "header",
  );

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<"above" | "below" | null>(
    null,
  );
  const [isDraggingNew, setIsDraggingNew] = useState<boolean>(false);
  const [isOverEmpty, setIsOverEmpty] = useState<boolean>(false);

  // Loading state for saving
  const [isSaving, setIsSaving] = useState(false);

  // Inline editing states
  const [editingLabelIndex, setEditingLabelIndex] = useState<number | null>(
    null,
  );
  const [editingHeader, setEditingHeader] = useState<
    "title" | "description" | null
  >(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const inlineTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (editingLabelIndex !== null && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    }
  }, [editingLabelIndex]);

  useEffect(() => {
    if (editingHeader === "title" && inlineInputRef.current) {
      inlineInputRef.current.focus();
    }
  }, [editingHeader]);

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // No field selected → ignore
      if (typeof selectedIndex !== "number") return;

      const currentIndex = selectedIndex;
      const currentField = fields[currentIndex];
      if (!currentField) return;

      // Delete: remove field
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        const fakeEvent = {
          stopPropagation: () => {},
        } as React.MouseEvent;
        deleteField(fakeEvent, currentIndex);
        return;
      }

      // Ctrl/Cmd + D: duplicate field
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        const fakeEvent = {
          stopPropagation: () => {},
        } as React.MouseEvent;
        duplicateField(fakeEvent, currentIndex);
        return;
      }

      // Arrow Up: move field up
      if (e.key === "ArrowUp" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        moveField(currentIndex, "up");
        return;
      }

      // Arrow Down: move field down
      if (e.key === "ArrowDown" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        moveField(currentIndex, "down");
        return;
      }

      // Arrow Up/Down (without Ctrl): navigate between fields
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIndex > 0) setSelectedIndex(currentIndex - 1);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentIndex < fields.length - 1)
          setSelectedIndex(currentIndex + 1);
        return;
      }

      // Enter: start editing label of selected field
      if (e.key === "Enter") {
        e.preventDefault();
        setEditingLabelIndex(currentIndex);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, fields]);

  // Helper to generate a unique key name for new fields
  const generateUniqueName = (type: string) => {
    let name = slugify(type);
    let counter = 1;

    // Check if name already exists in fields
    while (fields.some((f) => f.name === `${name}_${counter}`)) {
      counter++;
    }

    return `${name}_${counter}`;
  };

  // Add field to the end of the canvas
  const addField = (type: string) => {
    const defaultLabel = getFieldDefaultLabel(type);
    const name = generateUniqueName(type);

    const newField: FormField = {
      name,
      label: defaultLabel,
      type: type as any,
      required: false,
      placeholder: "",
      options: ["select", "radio"].includes(type)
        ? [
            { label: "Opción 1", value: "opcion_1" },
            { label: "Opción 2", value: "opcion_2" },
          ]
        : undefined,
    };

    setFields((prev) => [...prev, newField]);
    setSelectedIndex(fields.length); // Select the new field

    toast({
      title: "Campo agregado",
      description: `Se agregó un campo de tipo ${defaultLabel}.`,
    });
  };

  // Insert field at specific index
  const insertField = (type: string, targetIndex: number) => {
    const defaultLabel = getFieldDefaultLabel(type);
    const name = generateUniqueName(type);

    const newField: FormField = {
      name,
      label: defaultLabel,
      type: type as any,
      required: false,
      placeholder: "",
      options: ["select", "radio"].includes(type)
        ? [
            { label: "Opción 1", value: "opcion_1" },
            { label: "Opción 2", value: "opcion_2" },
          ]
        : undefined,
    };

    const updated = [...fields];
    updated.splice(targetIndex, 0, newField);
    setFields(updated);
    setSelectedIndex(targetIndex);
  };

  // Reorder fields
  const reorderFields = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return;

    const updated = [...fields];
    const [removed] = updated.splice(sourceIndex, 1);

    // Adjust target index if it shifted due to removal
    let adjustedTarget = targetIndex;
    if (sourceIndex < targetIndex) {
      adjustedTarget = targetIndex - 1;
    }

    updated.splice(adjustedTarget, 0, removed);
    setFields(updated);
    setSelectedIndex(adjustedTarget);
  };

  // Duplicate field
  const duplicateField = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const field = fields[index];
    const name = generateUniqueName(field.type);

    const duplicated: FormField = {
      ...field,
      name,
      label: `${field.label} (Copia)`,
      options: field.options ? field.options.map((o) => ({ ...o })) : undefined,
    };

    const updated = [...fields];
    updated.splice(index + 1, 0, duplicated);
    setFields(updated);
    setSelectedIndex(index + 1);

    toast({
      title: "Campo duplicado",
      description: `Se creó una copia de "${field.label}".`,
    });
  };

  // Delete field
  const deleteField = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const fieldName = fields[index].label;
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);

    if (selectedIndex === index) {
      setSelectedIndex("header");
    } else if (typeof selectedIndex === "number" && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }

    toast({
      title: "Campo eliminado",
      description: `Se eliminó el campo "${fieldName}".`,
      variant: "destructive",
    });
  };

  // Move field up/down manually (for accessibility/quick action)
  const moveField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFields(updated);
    setSelectedIndex(targetIndex);
  };

  // Helper for default labels
  const getFieldDefaultLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Campo de texto corto";
      case "email":
        return "Correo electrónico";
      case "number":
        return "Número";
      case "date":
        return "Fecha de registro";
      case "textarea":
        return "Área de texto";
      case "select":
        return "Lista desplegable";
      case "checkbox":
        return "Casilla de verificación";
      case "radio":
        return "Botón de opción";
      default:
        return "Nuevo campo";
    }
  };

  // Drag handles from Left Panel
  const handleDragStartFromLeft = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("newComponentType", type);
    e.dataTransfer.effectAllowed = "copy";
    setIsDraggingNew(true);
  };

  const handleDragEndLeft = () => {
    setIsDraggingNew(false);
    setDragOverIndex(null);
    setDragPosition(null);
  };

  // Drag handles inside Canvas
  const handleDragStartFromCanvas = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("draggedIndex", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(index);
  };

  const handleDragEndCanvas = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragPosition(null);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === index) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const position = relativeY < rect.height / 2 ? "above" : "below";

    setDragOverIndex(index);
    setDragPosition(position);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    const newType = e.dataTransfer.getData("newComponentType");
    const sourceIndexStr = e.dataTransfer.getData("draggedIndex");

    setDragOverIndex(null);
    setDragPosition(null);
    setDraggedIndex(null);
    setIsDraggingNew(false);

    let targetIndex = index;
    if (dragPosition === "below") {
      targetIndex = index + 1;
    }

    if (newType) {
      insertField(newType, targetIndex);
    } else if (sourceIndexStr) {
      const sourceIndex = parseInt(sourceIndexStr, 10);
      reorderFields(sourceIndex, targetIndex);
    }
  };

  // Property update handlers
  const updateSelectedField = (key: keyof FormField, value: any) => {
    if (typeof selectedIndex !== "number") return;

    const updated = [...fields];
    const currentField = { ...updated[selectedIndex] };

    (currentField as any)[key] = value;

    // Auto-update field name (slug) if label is changing and name hasn't been heavily customized
    if (key === "label" && typeof value === "string") {
      const currentSlug = slugify(currentField.label || "");
      if (currentField.name === currentSlug || currentField.name === "") {
        currentField.name = slugify(value);
      }
    }

    updated[selectedIndex] = currentField;
    setFields(updated);
  };

  // Update specific option in select/radio
  const updateOption = (optionIndex: number, newLabel: string) => {
    if (typeof selectedIndex !== "number") return;
    const currentField = fields[selectedIndex];
    if (!currentField.options) return;

    const updatedOptions = [...currentField.options];
    updatedOptions[optionIndex] = {
      label: newLabel,
      value: slugify(newLabel) || `option_${optionIndex + 1}`,
    };

    updateSelectedField("options", updatedOptions);
  };

  // Add option to select/radio
  const addOption = () => {
    if (typeof selectedIndex !== "number") return;
    const currentField = fields[selectedIndex];
    const currentOptions = currentField.options || [];

    const newOptionIndex = currentOptions.length + 1;
    const updatedOptions = [
      ...currentOptions,
      { label: `Opción ${newOptionIndex}`, value: `opcion_${newOptionIndex}` },
    ];

    updateSelectedField("options", updatedOptions);
  };

  // Delete option from select/radio
  const deleteOption = (optionIndex: number) => {
    if (typeof selectedIndex !== "number") return;
    const currentField = fields[selectedIndex];
    if (!currentField.options || currentField.options.length <= 1) {
      toast({
        title: "Acción no permitida",
        description: "Debes mantener al menos una opción disponible.",
        variant: "destructive",
      });
      return;
    }

    const updatedOptions = currentField.options.filter(
      (_, i) => i !== optionIndex,
    );
    updateSelectedField("options", updatedOptions);
  };

  // Save the complete form
  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      toast({
        title: "Error de validación",
        description: "Por favor, ingresa un título para el formulario.",
        variant: "destructive",
      });
      setSelectedIndex("header");
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "Formulario vacío",
        description:
          "Por favor, agrega al menos un campo en el lienzo antes de guardar.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        type: "native".toUpperCase(),
        schema: {
          fields,
        },
      };

      console.log(payload);

      await api.post("/forms", payload);

      toast({
        title: "Formulario Guardado",
        description:
          "El formulario se ha creado exitosamente y está listo para usarse.",
      });

      // Invalidate react query cache for forms list
      queryClient.invalidateQueries({ queryKey: ["forms"] });

      router.push("/forms");
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description:
          error?.message ||
          "Ocurrió un error inesperado al intentar guardar el formulario.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen -mx-4 -my-6 lg:-mx-8">
      {/* Premium Sticky Top Bar */}
      <header className="sticky -top-6 z-40 bg-background/95 backdrop-blur-md border-b border-border/80 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/forms">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Creador de Formularios
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Diseña formularios interactivos de forma visual y rápida
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            disabled={fields.length === 0}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden md:inline">Vista previa</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden md:inline-flex"
          >
            <Link href="/forms" className="gap-2">
              Cancelar
            </Link>
          </Button>
          <Button
            onClick={handleSaveForm}
            disabled={isSaving}
            size="sm"
            className="gap-2 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Formulario
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main 3-Column Layout Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-muted/20">
        {/* PANEL IZQUIERDO: Componentes Arrastrables (lg:col-span-3) */}
        <aside className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-100px)]">
          <Card className="border border-border/80 shadow-xs flex-1">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Componentes
                </h2>
                <p className="text-xs text-muted-foreground">
                  Arrastra un elemento al lienzo o haz clic para agregarlo al
                  final.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
                {COMPONENT_TYPES.map((comp) => {
                  const Icon = comp.icon;
                  return (
                    <div
                      key={comp.type}
                      draggable
                      onDragStart={(e) => handleDragStartFromLeft(e, comp.type)}
                      onDragEnd={handleDragEndLeft}
                      onClick={() => addField(comp.type)}
                      className="flex items-center gap-3 p-3 bg-card border border-border/60 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/50 hover:bg-accent/40 transition-all select-none group shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-foreground">
                          {comp.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {comp.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto pt-4 border-t border-border/50 text-[11px] text-muted-foreground flex items-start gap-2 bg-muted/40 p-2.5 rounded-lg">
                <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>
                  Tip: También puedes reordenar campos dentro del lienzo
                  arrastrándolos desde su manija central.
                </span>
              </div>

              <div className="mt-2 pt-3 border-t border-border/50 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Atajos de teclado
                </p>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Editar etiqueta</span>
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-mono">
                      Enter
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Duplicar campo</span>
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-mono">
                      Ctrl+D
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Eliminar campo</span>
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-mono">
                      Del
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Navegar campos</span>
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-mono">
                      ↑ ↓
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mover campo</span>
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-mono">
                      Ctrl+↑↓
                    </kbd>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* PANEL CENTRAL: Lienzo / Canvas (lg:col-span-6) */}
        <main className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Lienzo del Formulario
            </h2>
            <span className="text-xs font-medium text-muted-foreground bg-card border border-border px-2 py-0.5 rounded-md shadow-2xs">
              {fields.length} {fields.length === 1 ? "campo" : "campos"}
            </span>
          </div>

          <div
            className="flex-1 flex flex-col gap-4 pb-12 pr-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              // Handle drop at the end of the canvas if dropping directly on the container
              if (e.target === e.currentTarget) {
                const newType = e.dataTransfer.getData("newComponentType");
                const sourceIndexStr = e.dataTransfer.getData("draggedIndex");
                if (newType) {
                  addField(newType);
                } else if (sourceIndexStr) {
                  const sourceIndex = parseInt(sourceIndexStr, 10);
                  reorderFields(sourceIndex, fields.length);
                }
              }
            }}
          >
            {/* GOOGLE FORMS CABECERA / HEADER CARD */}
            <div
              onClick={() => setSelectedIndex("header")}
              className={`relative bg-card rounded-xl border transition-all cursor-pointer shadow-sm overflow-hidden ${
                selectedIndex === "header"
                  ? "border-l-4 border-l-primary border-t-2 border-t-primary border-r border-b border-primary/20 shadow-md ring-[0.5px] ring-primary/10"
                  : "border-border/80 hover:border-border-hover"
              }`}
            >
              {/* Colored top accent stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-primary to-indigo-500" />

              <div className="p-6 pt-7 space-y-3">
                {/* <h3 className="text-lg font-bold text-foreground tracking-tight">
                  {formTitle || "Formulario sin título"}
                </h3>
                {formDescription ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {formDescription}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic">
                    Sin descripción.
                  </p>
                )} */}

                {editingHeader === "title" ? (
                  <Input
                    ref={inlineInputRef}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    onBlur={() => setEditingHeader(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape") {
                        e.currentTarget.blur();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Formulario sin título"
                    className="text-lg font-bold tracking-tight h-auto py-1 border-primary/40 focus-visible:border-primary"
                  />
                ) : (
                  <h3
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex("header");
                      setEditingHeader("title");
                    }}
                    className="text-lg font-bold text-foreground tracking-tight cursor-text hover:bg-muted/30 rounded px-1 -mx-1 transition-colors"
                    title="Clic para editar"
                  >
                    {formTitle || "Formulario sin título"}
                  </h3>
                )}

                {editingHeader === "description" ? (
                  <Textarea
                    ref={inlineTextareaRef}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    onBlur={() => setEditingHeader(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.currentTarget.blur();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Descripción del formulario..."
                    className="text-sm min-h-16 resize-none border-primary/40 focus-visible:border-primary"
                  />
                ) : (
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex("header");
                      setEditingHeader("description");
                    }}
                    className={`text-sm whitespace-pre-line leading-relaxed cursor-text hover:bg-muted/30 rounded px-1 -mx-1 transition-colors ${
                      formDescription
                        ? "text-muted-foreground"
                        : "text-muted-foreground/60 italic"
                    }`}
                    title="Clic para editar"
                  >
                    {formDescription || "Sin descripción. Clic para agregar."}
                  </p>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Categoría: {formCategory}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    Formulario Nativo
                  </span>
                </div>
              </div>
            </div>

            {/* CANVAS FIELDS LIST */}
            {fields.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsOverEmpty(true);
                }}
                onDragLeave={() => setIsOverEmpty(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsOverEmpty(false);
                  const newType = e.dataTransfer.getData("newComponentType");
                  if (newType) addField(newType);
                }}
                className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                  isOverEmpty
                    ? "border-primary bg-primary/5 text-primary border-solid scale-[0.99] shadow-inner"
                    : "border-border/90 bg-card text-muted-foreground/80 shadow-xs"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 animate-pulse">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-base text-foreground mb-1">
                  Arrastra un elemento aquí para empezar
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Toma un componente de la barra izquierda y arrástralo sobre
                  esta zona, o haz clic en él para agregarlo.
                </p>
              </div>
            ) : (
              fields.map((field, index) => {
                const isSelected = selectedIndex === index;
                const isItemDragged = draggedIndex === index;

                return (
                  <div key={field.name} className="relative group/item">
                    {/* GUIDELINE LINE (ABOVE) */}
                    {dragOverIndex === index && dragPosition === "above" && (
                      <div className="h-1 bg-primary rounded-full w-full my-2 animate-pulse transition-all" />
                    )}

                    {/* FIELD CARD */}
                    <div
                      onClick={() => setSelectedIndex(index)}
                      onDragOver={(e) => handleDragOverItem(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`relative bg-card rounded-xl border p-5 flex flex-col gap-3 transition-all cursor-pointer shadow-2xs hover:shadow-xs group ${
                        isItemDragged
                          ? "opacity-30 border-dashed bg-muted/10"
                          : ""
                      } ${
                        isSelected
                          ? "border-l-4 border-l-primary border-t border-r border-b border-primary/20 shadow-sm ring-[0.5px] ring-primary/10 bg-accent/5"
                          : "border-border/80 hover:border-border-hover"
                      }`}
                    >
                      {/* Grip reorder handle */}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStartFromCanvas(e, index)}
                        onDragEnd={handleDragEndCanvas}
                        className="absolute left-1/2 -translate-x-1/2 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded-md z-10"
                      >
                        <GripVertical className="h-4 w-10 text-muted-foreground" />
                      </div>

                      {/* Header row: field type indicator + validation flags */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5">
                        <span className="font-bold uppercase tracking-wider text-primary/80 flex items-center gap-1.5">
                          {COMPONENT_TYPES.find((c) => c.type === field.type)
                            ?.label || field.type}
                        </span>
                        {field.required && (
                          <span className="text-red-500 font-bold bg-red-100 dark:bg-red-950/40 dark:text-red-400 px-2 py-0.5 rounded-md">
                            Obligatorio *
                          </span>
                        )}
                      </div>

                      {/* Content row: field label and placeholder preview */}
                      <div className="space-y-1.5">
                        {/* <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                          {field.label || (
                            <span className="text-muted-foreground/50 italic">
                              Sin etiqueta
                            </span>
                          )}
                          {field.required && (
                            <span className="text-destructive">*</span>
                          )}
                        </p> */}

                        {editingLabelIndex === index ? (
                          <Input
                            ref={inlineInputRef}
                            value={field.label}
                            onChange={(e) => {
                              const updated = [...fields];
                              updated[index] = {
                                ...updated[index],
                                label: e.target.value,
                              };

                              // Auto-update slug
                              const currentSlug = slugify(
                                updated[index].label || "",
                              );
                              if (
                                updated[index].name === slugify(field.label) ||
                                updated[index].name === ""
                              ) {
                                updated[index].name = currentSlug;
                              }
                              setFields(updated);
                            }}
                            onBlur={() => setEditingLabelIndex(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Escape") {
                                e.currentTarget.blur();
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Etiqueta del campo"
                            className="text-xs font-semibold h-7 py-1 border-primary/40 focus-visible:border-primary"
                          />
                        ) : (
                          <p
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIndex(index);
                              setEditingLabelIndex(index);
                            }}
                            className="text-xs font-semibold text-foreground flex items-center gap-1 cursor-text hover:bg-muted/30 rounded px-1 -mx-1 transition-colors group/label"
                            title="Clic para editar"
                          >
                            {field.label || (
                              <span className="text-muted-foreground/50 italic">
                                Sin etiqueta
                              </span>
                            )}
                            {field.required && (
                              <span className="text-destructive">*</span>
                            )}
                            <Pencil className="h-3 w-3 opacity-0 group-hover/label:opacity-50 transition-opacity ml-1" />
                          </p>
                        )}

                        {/* Placeholder preview according to type */}
                        {["text", "email", "number", "textarea"].includes(
                          field.type,
                        ) && (
                          <div className="text-[11px] text-muted-foreground bg-muted/30 border border-border/50 rounded-lg px-3 py-2 select-none pointer-events-none truncate italic">
                            {field.placeholder ||
                              `Ej: Ingrese su ${field.label.toLowerCase()}`}
                          </div>
                        )}

                        {field.type === "date" && (
                          <div className="text-[11px] text-muted-foreground bg-muted/30 border border-border/50 rounded-lg px-3 py-2 select-none pointer-events-none flex justify-between items-center italic">
                            <span>dd/mm/aaaa</span>
                            <Calendar className="h-3.5 w-3.5 opacity-60" />
                          </div>
                        )}

                        {field.type === "checkbox" && (
                          <div className="flex items-center gap-2 select-none pointer-events-none p-1">
                            <div className="h-4 w-4 rounded border border-border bg-muted/40" />
                            <span className="text-[11px] text-muted-foreground">
                              Opción de verificación
                            </span>
                          </div>
                        )}

                        {field.type === "textarea" && (
                          <div className="h-10 text-[11px] text-muted-foreground bg-muted/30 border border-border/50 rounded-lg px-3 py-2 select-none pointer-events-none italic">
                            {field.placeholder || "Área de texto largo..."}
                          </div>
                        )}

                        {field.type === "select" && (
                          <div className="flex flex-col gap-1.5 pl-1.5 mt-1 pointer-events-none select-none">
                            {field.options && field.options.length > 0 ? (
                              field.options.map((opt) => (
                                <div
                                  key={opt.value}
                                  className="flex items-center gap-2"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                                  <span className="text-[11px] text-muted-foreground">
                                    {opt.label}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-[11px] text-muted-foreground/50 italic">
                                Sin opciones
                              </span>
                            )}
                          </div>
                        )}

                        {field.type === "radio" && (
                          <div className="flex flex-col gap-1.5 pl-1 mt-1 pointer-events-none select-none">
                            {field.options && field.options.length > 0 ? (
                              field.options.map((opt) => (
                                <div
                                  key={opt.value}
                                  className="flex items-center gap-2"
                                >
                                  <div className="h-3.5 w-3.5 rounded-full border border-border bg-muted/40" />
                                  <span className="text-[11px] text-muted-foreground">
                                    {opt.label}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-[11px] text-muted-foreground/50 italic">
                                Sin opciones
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* QUICK FLOATING ACTIONS BAR */}
                      <div
                        className={`mt-2 flex items-center justify-end gap-1 border-t border-border/40 pt-2 ${
                          isSelected
                            ? "opacity-100"
                            : "opacity-0 group-hover/item:opacity-100 transition-opacity"
                        }`}
                      >
                        {/* Accessibility Up/Down */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(index, "up");
                          }}
                          disabled={index === 0}
                          className="h-7 w-7 rounded-full text-muted-foreground"
                          title="Subir"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(index, "down");
                          }}
                          disabled={index === fields.length - 1}
                          className="h-7 w-7 rounded-full text-muted-foreground"
                          title="Bajar"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>

                        <div className="h-4 w-px bg-border/80 mx-1" />

                        {/* Obligatorio switch inside fast action bar */}
                        <div className="flex items-center gap-1.5 mr-2">
                          <Switch
                            id={`req-fast-${field.name}`}
                            checked={field.required}
                            onCheckedChange={(checked) => {
                              // Ensure this item is selected when toggled
                              setSelectedIndex(index);
                              updateSelectedField("required", checked);
                            }}
                            className="scale-90"
                          />
                          <Label
                            htmlFor={`req-fast-${field.name}`}
                            className="text-[10px] font-bold text-muted-foreground cursor-pointer uppercase"
                          >
                            Obligatorio
                          </Label>
                        </div>

                        <div className="h-4 w-px bg-border/80 mx-1" />

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => duplicateField(e, index)}
                          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Duplicar"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => deleteField(e, index)}
                          className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* GUIDELINE LINE (BELOW) */}
                    {dragOverIndex === index && dragPosition === "below" && (
                      <div className="h-1 bg-primary rounded-full w-full my-2 animate-pulse transition-all" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* PANEL DERECHO: Propiedades Dinámicas (lg:col-span-3) */}
        <aside className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-100px)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Propiedades
            </h2>
          </div>

          {selectedIndex === null ? (
            <Card className="border border-dashed border-border/80 flex flex-col items-center justify-center p-6 text-center text-muted-foreground bg-card h-80">
              <Settings
                className="h-10 w-10 text-muted-foreground/30 mb-3 animate-spin"
                style={{ animationDuration: "10s" }}
              />
              <p className="text-sm font-semibold text-foreground">
                Ningún elemento seleccionado
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                Haz clic en la cabecera o en cualquier campo del lienzo para
                configurarlo aquí.
              </p>
            </Card>
          ) : selectedIndex === "header" ? (
            /* PROPERTIES PANEL: FORM METADATA */
            <Card className="border border-border/80 shadow-xs">
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                    Datos del Formulario
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="form-title-input"
                        className="text-xs font-semibold"
                      >
                        Título del Formulario
                      </Label>
                      <Input
                        id="form-title-input"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Ej: Encuesta de Satisfacción"
                        className="bg-card text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="form-desc-input"
                        className="text-xs font-semibold"
                      >
                        Descripción
                      </Label>
                      <Textarea
                        id="form-desc-input"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Describe el propósito o instrucciones de este formulario..."
                        className="min-h-24 bg-card text-xs resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="form-cat-select"
                        className="text-xs font-semibold"
                      >
                        Categoría
                      </Label>
                      <Select
                        value={formCategory}
                        onValueChange={(val: string) =>
                          setFormCategory(val as FormCategory)
                        }
                      >
                        <SelectTrigger
                          id="form-cat-select"
                          className="bg-card text-xs"
                        >
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem
                              key={cat}
                              value={cat}
                              className="text-xs"
                            >
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* PROPERTIES PANEL: SELECTED FIELD PROPERTIES */
            (() => {
              const currentField = fields[selectedIndex as number];
              if (!currentField) return null;

              return (
                <Card className="border border-border/80 shadow-xs">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                          Propiedades del Campo
                        </h3>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded-md">
                          Indice: #{selectedIndex}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {/* Label property */}
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="field-label-input"
                            className="text-xs font-semibold"
                          >
                            Etiqueta / Pregunta
                          </Label>
                          <Input
                            id="field-label-input"
                            value={currentField.label}
                            onChange={(e) =>
                              updateSelectedField("label", e.target.value)
                            }
                            placeholder="Ej: Ingrese su nombre"
                            className="bg-card text-xs"
                          />
                        </div>

                        {/* Name (unique slug) property */}
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="field-name-input"
                            className="text-xs font-semibold"
                          >
                            ID del campo (Base de datos)
                          </Label>
                          <Input
                            id="field-name-input"
                            value={currentField.name}
                            onChange={(e) =>
                              updateSelectedField(
                                "name",
                                slugify(e.target.value),
                              )
                            }
                            placeholder="ej_identificador_unico"
                            className="bg-card text-xs font-mono"
                          />
                          <p className="text-[10px] text-muted-foreground italic">
                            Identificador interno del campo en la base de datos
                            (letras y guiones bajos).
                          </p>
                        </div>

                        {/* Placeholder property */}
                        {["text", "email", "number", "textarea"].includes(
                          currentField.type,
                        ) && (
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="field-placeholder-input"
                              className="text-xs font-semibold"
                            >
                              Texto de Ayuda / Placeholder
                            </Label>
                            <Input
                              id="field-placeholder-input"
                              value={currentField.placeholder || ""}
                              onChange={(e) =>
                                updateSelectedField(
                                  "placeholder",
                                  e.target.value,
                                )
                              }
                              placeholder="Ej: Nombre completo..."
                              className="bg-card text-xs"
                            />
                          </div>
                        )}

                        {/* Required toggle property */}
                        <div className="flex items-center justify-between bg-muted/30 border border-border/50 p-2.5 rounded-lg">
                          <div className="flex flex-col">
                            <Label
                              htmlFor="field-req-input"
                              className="text-xs font-semibold cursor-pointer"
                            >
                              Obligatorio
                            </Label>
                            <span className="text-[10px] text-muted-foreground">
                              Exigir respuesta para enviar
                            </span>
                          </div>
                          <Switch
                            id="field-req-input"
                            checked={currentField.required}
                            onCheckedChange={(checked) =>
                              updateSelectedField("required", checked)
                            }
                          />
                        </div>

                        {/* Option Editor for Select / Radio */}
                        {["select", "radio"].includes(currentField.type) && (
                          <div className="space-y-2.5 pt-2 border-t border-border/80">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-semibold">
                                Opciones de la lista
                              </Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={addOption}
                                className="h-6 text-[10px] gap-1 px-2 border-primary/50 text-primary hover:bg-primary/5"
                              >
                                <Plus className="h-3 w-3" />
                                Añadir Opción
                              </Button>
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {currentField.options?.map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className="flex items-center gap-2 group/opt"
                                >
                                  <span className="text-xs font-bold text-muted-foreground w-4">
                                    {optIdx + 1}
                                  </span>
                                  <Input
                                    value={opt.label}
                                    onChange={(e) =>
                                      updateOption(optIdx, e.target.value)
                                    }
                                    placeholder={`Opción ${optIdx + 1}`}
                                    className="bg-card text-xs h-8 flex-1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteOption(optIdx)}
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                                    title="Eliminar opción"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()
          )}
        </aside>
      </div>

      {/* Vista previa   */}
      {/* PREVIEW DIALOG */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Vista Previa
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {formCategory}
              </span>
            </div>
            <DialogTitle className="text-2xl">
              {formTitle || "Formulario sin título"}
            </DialogTitle>
            <DialogDescription className="text-sm whitespace-pre-line leading-relaxed">
              {formDescription || "Sin descripción."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {fields.map((field, idx) => (
              <div key={field.name} className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  {field.label || `Campo ${idx + 1}`}
                  {field.required && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>

                {field.type === "text" && (
                  <Input placeholder={field.placeholder || ""} disabled />
                )}
                {field.type === "email" && (
                  <Input
                    type="email"
                    placeholder={field.placeholder || "ejemplo@correo.com"}
                    disabled
                  />
                )}
                {field.type === "number" && (
                  <Input
                    type="number"
                    placeholder={field.placeholder || ""}
                    disabled
                  />
                )}
                {field.type === "date" && <Input type="date" disabled />}
                {field.type === "textarea" && (
                  <Textarea
                    placeholder={field.placeholder || ""}
                    className="min-h-24"
                    disabled
                  />
                )}
                {field.type === "select" && (
                  <Select disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una opción..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.type === "checkbox" && (
                  <div className="flex items-center gap-2">
                    <Checkbox disabled id={`preview-${field.name}`} />
                    <Label
                      htmlFor={`preview-${field.name}`}
                      className="text-sm cursor-pointer"
                    >
                      {field.label}
                    </Label>
                  </div>
                )}
                {field.type === "radio" && (
                  <RadioGroup disabled>
                    {field.options?.map((opt) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={opt.value}
                          id={`preview-${field.name}-${opt.value}`}
                        />
                        <Label
                          htmlFor={`preview-${field.name}-${opt.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Cerrar vista previa
            </Button>
            <Button disabled className="opacity-60 cursor-not-allowed">
              Enviar formulario (deshabilitado)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

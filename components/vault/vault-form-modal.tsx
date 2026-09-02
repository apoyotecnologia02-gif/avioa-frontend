"use client";

import { useCreateVault } from "@/hooks/useCreateVault";
import { VaultCategory } from "@/hooks/useVaultCategories";
import { useUpdateVault } from "@/hooks/useUpdateVault";
import { VaultTag } from "@/hooks/useVaultTags";
import { VaultItem } from "@/types/password-vault.types";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { CalendarIcon, Eye, EyeOff, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns/format";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { es } from "date-fns/locale";
import { PasswordGeneratorPopover } from "./password-generator-popover";
import { StrengthMeter } from "./strengthmeter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface VaultFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  item: VaultItem | null;
  categories: VaultCategory[];
  tags: VaultTag[];
  onSaved: () => void;
}

interface FormState {
  title: string;
  username: string;
  email: string;
  password: string;
  website: string;
  notes: string;
  categoryId: string;
  tagIds: string[];
  expiresAt: Date | undefined;
}

const EMPTY_FORM: FormState = {
  title: "",
  username: "",
  email: "",
  password: "",
  website: "",
  notes: "",
  categoryId: "",
  tagIds: [],
  expiresAt: undefined,
};

export function VaultFormModal({
  open,
  onOpenChange,
  mode,
  item,
  categories,
  tags,
  onSaved,
}: VaultFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    createVault,
    isSubmitting: isCreating,
    error: createError,
  } = useCreateVault(() => {
    onSaved();
    onOpenChange(false);
  });

  const {
    updateVault,
    isSubmitting: isUpdating,
    error: updateError,
  } = useUpdateVault(() => {
    onSaved();
    onOpenChange(false);
  });

  const isSubmitting = isCreating || isUpdating;
  const submitError = createError ?? updateError;

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && item) {
      setForm({
        title: item.title,
        username: item.username ?? "",
        email: item.email ?? "",
        password: "",
        website: item.website ?? "",
        notes: item.notes ?? "",
        categoryId: item.categoryId ?? "",
        tagIds: item.tags?.map((t) => t.tag.name) ?? [],
        expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setShowPassword(false);
    setErrors({});
  }, [open, mode, item]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "El nombre es obligatorio";
    if (mode === "create" && !form.password.trim())
      next.password = "La contraseña es obligatoria";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const dto = {
      title: form.title.trim(),
      username: form.username.trim() || undefined,
      email: form.email.trim() || undefined,
      website: form.website.trim() || undefined,
      notes: form.notes.trim() || undefined,
      categoryId: form.categoryId || undefined,
      tagIds: form.tagIds.length ? form.tagIds : undefined,
      expiresAt: form.expiresAt?.toISOString(),
      ...(form.password ? { password: form.password } : {}),
    };

    if (mode === "create") {
      await createVault(dto as any);
    } else if (item) {
      await updateVault(item.passwordVaultId, dto as any);
    }
  }

  function toggleTag(tagId: string) {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva credencial" : "Editar credencial"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Guarda una nueva contraseña de forma cifrada."
              : "Los cambios en la contraseña quedan registrados en el historial de versiones."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          {/* Nombre ocupa todo el ancho */}
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="title">Nombre *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Ej: Servidor de producción"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="password">
              {mode === "create"
                ? "Contraseña *"
                : "Nueva contraseña (opcional)"}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder={
                    mode === "edit"
                      ? "Dejar en blanco para no cambiar"
                      : undefined
                  }
                  className="pr-9"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5 text-muted-foreground"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <PasswordGeneratorPopover
                onGenerate={(pwd) => setForm((f) => ({ ...f, password: pwd }))}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
            <StrengthMeter password={form.password} />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="website">Sitio web</Label>
            <Input
              id="website"
              value={form.website}
              onChange={(e) =>
                setForm((f) => ({ ...f, website: e.target.value }))
              }
              placeholder="ejemplo.com"
            />
          </div>

          <div className="space-y-1">
            <Label>Categoría</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.passwordCategoryId}
                    value={cat.passwordCategoryId}
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Expira</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.expiresAt && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.expiresAt
                    ? format(form.expiresAt, "PP", { locale: es })
                    : "Sin fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.expiresAt}
                  onSelect={(date) =>
                    setForm((f) => ({ ...f, expiresAt: date }))
                  }
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const active = form.tagIds.includes(tag.passwordTagId);
                return (
                  <button
                    key={tag.passwordTagId}
                    type="button"
                    onClick={() => toggleTag(tag.passwordTagId)}
                  >
                    <Badge
                      variant={active ? "default" : "outline"}
                      className="cursor-pointer"
                    >
                      {tag.name}
                      {active && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  </button>
                );
              })}
              {tags.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hay etiquetas creadas aún
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>

          {submitError && (
            <p className="text-sm text-destructive sm:col-span-2">
              {submitError}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
                ? "Crear"
                : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Area } from "@/types/user.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, UserIcon } from "lucide-react";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { api } from "@/lib/axios";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre es requerido")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Ingresa un correo válido")
    .optional()
    .or(z.literal("")),
  // area: z.nativeEnum(Area).optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  // avatar: z.any().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasResetRef = useRef(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      // area: user?.area || "",
      birthDate: "",
    },
  });

  // const avatarRegister = useMemo(() => form.register("avatar"), [form]);
  // const {
  //   ref: avatarRef,
  //   onChange: avatarOnChange,
  //   ...avatarRest
  // } = avatarRegister;

  useEffect(() => {
    if (user && !hasResetRef.current) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        // area: user.area,
        birthDate: "",
      });
      hasResetRef.current = true;
    }
  }, [user, form]);

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    // avatarOnChange(e);
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  }

  async function onSubmit(data: ProfileFormValues) {
    try {
      setError(null);

      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.email) formData.append("email", data.email);
      // if (data.area) formData.append("area", data.area);
      if (data.birthDate) formData.append("birthDate", data.birthDate);
      if (avatarFile) formData.append("file", avatarFile);

      const response = await api.patch(
        "/admin/users/update-profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUser({ ...user, ...response.data });

      toast({
        title: "Perfil actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No fue posible actualizar el perfil",
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-xl animate-in fade-in-50 duration-500"
      >
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="size-24 border-2 border-border transition-all duration-300 group-hover:border-primary/50 shadow-sm">
              {avatarUrl ? (
                <AvatarImage
                  src={avatarUrl}
                  alt="Avatar"
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-muted">
                <UserIcon className="size-10 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-6 text-white" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-medium leading-none">Foto de perfil</h4>
            <p className="text-sm text-muted-foreground">
              Recomendamos una imagen de al menos 400x400px.
            </p>
            <div className="pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Subir nueva foto
              </Button>
            </div>
          </div>
        </div>
        {/* Form Fields */}
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Escribe tu nombre completo"
                    className="bg-background"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Este es el nombre que se mostrará en la plataforma.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Escribe tu correo electrónico"
                    className="bg-background"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Se usará para notificaciones y para iniciar sesión.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Fecha de nacimiento</FormLabel>
            <Input
              type="date"
              className="bg-background"
              {...form.register("birthDate")}
            />
          </FormItem>
        </div>
        <div className="flex items-center justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

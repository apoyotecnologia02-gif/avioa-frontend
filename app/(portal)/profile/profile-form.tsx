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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

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
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") === "connected") {
      toast({
        title: "Cuenta vinculada",
        description: "Tu cuenta de Google se conectó correctamente.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

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

  async function handleConnectGoogle() {
    try {
      setIsConnectingGoogle(true);
      const { data } = await api.get("/auth/google/connect");
      console.log("Google Connect URL:", data);
      window.location.href = data.url;
    } catch (err: any) {
      setIsConnectingGoogle(false);
      toast({
        title: "Error",
        description: "No fue posible iniciar la vinculación con Google.",
        variant: "destructive",
      });
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
            <div className="pt-1 flex items-center gap-2">
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

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleConnectGoogle}
                disabled={isConnectingGoogle}
                className="gap-2 hover:bg-gray-100 data-[state=active]:bg-gray-200"
              >
                {isConnectingGoogle ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <GoogleIcon className="size-4" />
                )}
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

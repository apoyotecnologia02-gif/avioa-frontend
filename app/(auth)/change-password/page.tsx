"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { api } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuthStore } from "@/store/authStore";

const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(100, "La contraseña es demasiado larga")
      .regex(
        /[A-Z]/,
        "La contraseña debe contener al menos una letra mayúscula",
      )
      .regex(
        /[a-z]/,
        "La contraseña debe contener al menos una letra minúscula",
      )
      .regex(/[0-9]/, "La contraseña debe contener al menos un número"),

    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

function ChangePasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const temporaryToken = searchParams.get("temporaryToken");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
  });

  /**
   * Si no viene el temporaryToken,
   * no podemos continuar.
   */
  useEffect(() => {
    if (!temporaryToken) {
      setError("El enlace para cambiar la contraseña no es válido.");
    }
  }, [temporaryToken]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    setError(null);

    if (!temporaryToken) {
      setError("El enlace para cambiar la contraseña no es válido.");
      return;
    }

    try {
      const response = await api.post("/auth/change-temporary-password", {
        temporaryToken,
        newPassword: data.newPassword,
      });

      setSuccess(true);

      if (response.data.twoFactorEnabled) {
        if (!response.data.temporaryToken) {
          throw new Error(
            "No se recibió el token necesario para continuar con 2FA.",
          );
        }

        router.push(
          `/two-factor?temporaryToken=${encodeURIComponent(
            response.data.temporaryToken,
          )}`,
        );

        return;
      }

      const { accessToken, refreshToken, user } = response.data;

      if (!accessToken || !refreshToken) {
        throw new Error(
          "La contraseña se cambió, pero no se recibió la sesión.",
        );
      }

      /**
       * Aquí debemos guardar la sesión.
       *
       * Si tu store tiene setAuth, lo podemos utilizar.
       */
      // get().setAuth(...)

      setAuth(accessToken, refreshToken, user);

      router.push("/dashboard");
    } catch (err: any) {
      setSuccess(false);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "No fue posible cambiar la contraseña.";

      setError(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  if (!temporaryToken) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <LockKeyhole className="h-6 w-6 text-destructive" />
          </div>

          <h1 className="text-xl font-semibold">Enlace inválido</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            El enlace para cambiar tu contraseña no es válido o ha expirado.
          </p>

          <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
            Volver al inicio de sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="flex h-full w-full max-h-[98vh] flex-col overflow-hidden rounded-2xl border bg-card shadow-lg lg:flex-row">
        {/* Formulario */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-[380px]">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <Image
                src="/avioa-logo.png"
                alt="avioa Agencia de Viajes logo"
                width={180}
                height={90}
                className="h-auto w-auto max-h-12 object-contain"
                priority
              />
            </div>

            {/* Icono */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <LockKeyhole className="h-6 w-6 text-primary" />
              </div>
            </div>

            {/* Título */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Cambia tu contraseña
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Por seguridad, debes cambiar la contraseña temporal antes de
                continuar.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                Contraseña actualizada correctamente.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nueva contraseña */}
              <div>
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Nueva contraseña
                </Label>

                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    {...register("newPassword")}
                    className="h-10 w-full rounded-lg border-border bg-background px-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                    aria-invalid={!!errors.newPassword}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                {errors.newPassword && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Confirmar contraseña
                </Label>

                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    {...register("confirmPassword")}
                    className="h-10 w-full rounded-lg border-border bg-background px-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                    aria-invalid={!!errors.confirmPassword}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Requisitos */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="mb-2 text-xs font-medium text-foreground">
                  La contraseña debe contener:
                </p>

                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Al menos 8 caracteres</li>
                  <li>• Una letra mayúscula</li>
                  <li>• Una letra minúscula</li>
                  <li>• Un número</li>
                </ul>
              </div>

              {/* Botón */}
              <Button
                type="submit"
                className="h-10 w-full rounded-lg bg-primary text-base font-medium text-white hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Cambiar contraseña"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Por seguridad, no compartas tu contraseña con otras personas.
              </p>
            </div>
          </div>
        </div>

        {/* Imagen */}
        <div className="hidden bg-card p-4 lg:block lg:w-1/2">
          <div className="relative h-full w-full overflow-hidden rounded-2xl min-h-[300px]">
            <Image
              src="/login.png"
              alt="Avioa Viajes"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ChangePasswordPageContent />
    </Suspense>
  );
}

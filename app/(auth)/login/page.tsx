"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  documentNumber: z.string().min(1, "El documento es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated)
      router.push(searchParams.get("from") || "/dashboard");
  }, [authLoading, isAuthenticated, router, searchParams]);

  useEffect(() => {
    setSuccessMessage(searchParams.get("message"));
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const result = await login(data);
      if (result.mustChangePassword) {
        if (!result.temporaryToken)
          throw new Error(
            "No se recibió el token necesario para cambiar la contraseña.",
          );
        router.push(
          `/change-password?temporaryToken=${encodeURIComponent(result.temporaryToken)}`,
        );
        return;
      }
      if (result.twoFactorEnabled) {
        if (!result.temporaryToken)
          throw new Error("No se recibió el token temporal para 2FA.");
        router.push(
          `/two-factor?temporaryToken=${encodeURIComponent(result.temporaryToken)}`,
        );
        return;
      }
      router.push(searchParams.get("from") || "/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible iniciar sesión. Verifica tus credenciales.",
      );
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background p-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" />
          Preparando tu sesión…
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background p-4 sm:p-6">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <section className="grid w-full max-w-6xl overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/10 lg:min-h-[42rem] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-sm">
            <div className="mb-10">
              <Image
                src="/avioa-logo.png"
                alt="Avioa Agencia de Viajes"
                width={180}
                height={54}
                className="h-auto max-h-12 w-auto object-contain"
                priority
              />
            </div>
            <div className="mb-8 space-y-2">
              <p className="text-sm font-medium text-primary">
                Portal empresarial
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Bienvenido de nuevo
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Ingresa tus credenciales para continuar a tu espacio de trabajo.
              </p>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {successMessage && (
                <div
                  role="status"
                  className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2.5 text-sm text-primary"
                >
                  {successMessage}
                </div>
              )}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="documentNumber" className="text-sm font-medium">
                  Número de documento
                </Label>
                <div className="relative">
                  <UserRound
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="documentNumber"
                    type="text"
                    autoComplete="username"
                    placeholder="Ingresa tu número de documento"
                    {...register("documentNumber")}
                    className="h-11 rounded-lg bg-background pl-10 text-foreground placeholder:text-muted-foreground"
                    aria-invalid={!!errors.documentNumber}
                    aria-describedby={
                      errors.documentNumber ? "documentNumber-error" : undefined
                    }
                  />
                </div>
                {errors.documentNumber && (
                  <p
                    id="documentNumber-error"
                    className="text-xs text-destructive"
                  >
                    {errors.documentNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </Label>
                  <Link
                    href="/send-forgot-password"
                    className="text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline underline-offset-4"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    {...register("password")}
                    className="h-11 rounded-lg bg-background pl-10 pr-11 text-foreground placeholder:text-muted-foreground"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="h-11 w-full rounded-lg text-sm font-semibold shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Iniciando
                    sesión…
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
            <p className="mt-8 flex items-center gap-2 text-xs leading-5 text-muted-foreground">
              <ShieldCheck
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              Tu acceso está protegido y gestionado de forma segura.
            </p>
          </div>
        </div>
        <div className="relative hidden overflow-hidden lg:block">
          <Image
            src="/login.png"
            alt="Equipo Avioa planificando experiencias de viaje"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-primary/20" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="mb-3 text-sm font-medium text-white/80">
              Agencia de Viajes Avioa
            </p>
            {/* <p className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
              Todo tu trabajo, en un solo lugar.
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
              Gestiona solicitudes, novedades y recursos de tu equipo con una
              experiencia simple y segura.
            </p> */}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-background p-6">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

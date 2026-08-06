"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
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
    if (!authLoading && isAuthenticated) {
      const from = searchParams.get("from") || "/dashboard";
      router.push(from);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  useEffect(() => {
    const message = searchParams.get("message");
    setSuccessMessage(message);
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const result = await login(data);

      if (result.twoFactorEnabled) {
        router.push(`/two-factor?temporaryToken=${result.temporaryToken}`);
      } else {
        const from = searchParams.get("from") || "/dashboard";
        router.push(from);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al iniciar sesión. Verifica tus credenciales.");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white overflow-hidden">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white p-4 overflow-hidden bg-background">
      {/* Contenedor principal con fondo tenue */}
      <div className="flex w-full h-full max-h-[98vh] flex-col overflow-hidden rounded-2xl bg-[#F8F9FA] shadow-lg lg:flex-row">
        {/* Columna izquierda - Formulario */}
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

            {/* Título */}
            <div className="mb-6 text-center"></div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {successMessage && (
                <div className="rounded-lg bg-primary/10 p-2 text-sm text-primary">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {/* Email */}
                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@gmail.com"
                    {...register("email")}
                    className="mt-1 h-10 rounded-lg border-gray-200 bg-white px-3 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="mt-0.5 text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* password */}
                <div>
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Contraseña
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      {...register("password")}
                      className="h-10 w-full rounded-lg border-gray-200 bg-white px-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                      aria-invalid={!!errors.password}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="mt-0.5 text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {/* login btn */}
              <Button
                type="submit"
                className="h-10 w-full rounded-lg bg-primary text-base font-medium text-white hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando Sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                asChild
                className="text-sm text-gray-500 hover:text-gray-700 p-0 h-auto"
              >
                <Link href="/send-forgot-password">
                  ¿Olvidaste tu contraseña?
                </Link>
              </Button>
              <div className="mt-1 text-xs text-gray-400">
                Privacidad y protección de datos
              </div>
            </div>
          </div>
        </div>

        {/* R image */}
        <div className="hidden lg:block lg:w-1/2 bg-[#F8F9FA] p-4">
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-white overflow-hidden">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

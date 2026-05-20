"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { AcceptInviteDto } from "@/types/user.types";

const inviteSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type InviteFormData = z.infer<typeof inviteSchema>;
type InvitePreview = { name: string; email: string };

function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setFatalError("La invitación no es válida. Contacta al administrador.");
        setIsValidating(false);
        return;
      }

      try {
        const response = await api.get<InvitePreview>("/auth/invite/validate", {
          params: { token },
          skip401Redirect: true,
        });
        setPreview(response.data);
      } catch (err) {
        setFatalError(
          err instanceof Error
            ? err.message
            : "La invitación es inválida o expiró. Contacta al administrador.",
        );
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: InviteFormData) => {
    const payload: AcceptInviteDto = {
      token,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    try {
      await api.post("/auth/invite/accept", payload, { skip401Redirect: true });
      router.push(
        "/login?message=Contrasena%20creada%2C%20ya%20puedes%20iniciar%20sesion",
      );
    } catch (err) {
      setFatalError(
        err instanceof Error
          ? err.message
          : "No fue posible completar el registro. Contacta al administrador.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Activar cuenta</CardTitle>
          <CardDescription>
            Configura tu contraseña para finalizar el registro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isValidating ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Validando invitación...
            </div>
          ) : fatalError ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {fatalError}
              </div>
              <p className="text-sm text-muted-foreground">
                Si crees que es un error, por favor contacta al administrador
                para reenviar la invitación.
              </p>
            </div>
          ) : preview ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nombre</FieldLabel>
                  <Input id="name" value={preview.name} readOnly />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Correo</FieldLabel>
                  <Input id="email" value={preview.email} readOnly />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirmar contraseña
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </Field>
              </FieldGroup>
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Crear contraseña"
                )}
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando invitación...
        </div>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}

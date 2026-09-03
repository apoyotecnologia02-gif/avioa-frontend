"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const sendForgotPasswordSchema = z
  .object({
    email: z.string().email("Ingresa un correo electrónico válido"),
  })
  .refine((data) => data.email, {
    message: "El correo es requerido",
    path: ["email"],
  });

type SendForgotPasswordSchema = z.infer<typeof sendForgotPasswordSchema>;

function SendForgotPasswordContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SendForgotPasswordSchema>({
    resolver: zodResolver(sendForgotPasswordSchema),
  });

  const onSubmit = async (data: SendForgotPasswordSchema) => {
    setError(null);
    try {
      await api.post("/auth/forgot-password/send", data);
      setSuccessMessage("Ingresa a tu correo para restablecer tu contraseña");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al enviar el correo. Intenta de nuevo.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/avioa-logo.png"
              alt="avioa Agencia de Viajes logo"
              width={280}
              height={140}
              className="h-16 w-auto max-w-[220px] object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl">Restablecer contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo electr&oacute;nico y te enviaremos un enlace para
            restablecer tu contraseña
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {successMessage && (
              <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FieldGroup>
              <Field>
                {/* <FieldLabel htmlFor="email">
                  Correo electr&oacute;nico
                </FieldLabel> */}
                <Input
                  id="email"
                  type="email"
                  placeholder="Correo electr&oacute;nico"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Restablecer contraseña"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SendForgotPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SendForgotPasswordContent />
    </Suspense>
  );
}

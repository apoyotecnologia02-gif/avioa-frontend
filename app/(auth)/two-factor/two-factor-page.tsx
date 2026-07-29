"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function TwoFactorComponent() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const params = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setLoading(true);

    try {
      const res = await api.post(
        "/auth/2fa/verify",
        {
          code,
          temporaryToken: params.get("temporaryToken"),
        },
        { skip401Redirect: true },
      );

      const { accessToken, user, refreshToken } = res.data;
      setAuth(accessToken, refreshToken, user);
      router.push("/dashboard");
    } catch (err) {
      setError("El codigo es incorrecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>

          <CardTitle>Verificación en dos pasos</CardTitle>

          <CardDescription>
            Abre tu aplicación de autenticación e ingresa el código de 6 dígitos
            para continuar.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} aria-invalid={error !== ""} />
                <InputOTPSlot index={1} aria-invalid={error !== ""} />
                <InputOTPSlot index={2} aria-invalid={error !== ""} />
              </InputOTPGroup>

              <InputOTPSeparator />

              <InputOTPGroup>
                <InputOTPSlot index={3} aria-invalid={error !== ""} />
                <InputOTPSlot index={4} aria-invalid={error !== ""} />
                <InputOTPSlot index={5} aria-invalid={error !== ""} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full"
            disabled={loading || code.length !== 6}
            onClick={handleVerify}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verificar
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center text-sm text-muted-foreground"
          >
            Volver a la pantalla de inicio de sesión
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

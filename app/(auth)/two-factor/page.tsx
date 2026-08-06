"use client";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import TwoFactorComponent from "./two-factor-page";

export default function TwoFactorPage() {
  return (
    <Suspense
      fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}
    >
      <TwoFactorComponent />
    </Suspense>
  );
}

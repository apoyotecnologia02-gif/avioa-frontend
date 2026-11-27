"use client";

import { useRouter } from "next/navigation";
import { OffersNativeEditor } from "@/components/offers-manager/OffersNativeEditor";

export default function NativeCreateTestPage() {
  const router = useRouter();

  return (
    <OffersNativeEditor
      onCancel={() => router.push("/portal-offers/native-test")}
    />
  );
}

"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function useModalParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const open = useCallback(
    (key: string, value: string = "true") => {
      const params = new URLSearchParams(searchParams);
      params.set(key, value);
      router.push(`${pathname}?${params}`);
    },
    [router, pathname, searchParams],
  );

  const close = useCallback(
    (...keys: string[]) => {
      const params = new URLSearchParams(searchParams);
      keys.forEach((k) => params.delete(k));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  return { open, close };
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface StrengthResult {
  score: number;
  level: "VERY_WEAK" | "WEAK" | "MEDIUM" | "STRING" | "VERY_STRONG";
  issues: string[];
}

const LEVEL_STYLES: Record<
  string,
  { bar: string; label: string; text: string }
> = {
  VERY_WEAK: {
    bar: "bg-red-500 w-1/5",
    label: "Muy débil",
    text: "text-red-600",
  },
  WEAK: { bar: "bg-orange-500 w-2/5", label: "Débil", text: "text-orange-600" },
  MEDIUM: {
    bar: "bg-yellow-500 w-3/5",
    label: "Media",
    text: "text-yellow-600",
  },
  STRONG: {
    bar: "bg-green-500 w-4/5",
    label: "Fuerte",
    text: "text-green-600",
  },
  VERY_STRONG: {
    bar: "bg-emerald-600 w-full",
    label: "Muy fuerte",
    text: "text-emerald-700",
  },
};

export function StrengthMeter({ password }: { password: string }) {
  const debounced = useDebouncedValue(password, 300);
  const [result, setResult] = useState<StrengthResult | null>(null);

  useEffect(() => {
    if (!debounced) {
      setResult(null);
      return;
    }

    let cancelled = false;

    api
      .post<StrengthResult>(
        "/vault/strength",
        { password: debounced },
        { skip401Redirect: true },
      )
      .then(({ data }) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setResult(null);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  if (!password) return null;

  const style = result ? LEVEL_STYLES[result.level] : null;

  return (
    <div className="space-y-1 pt-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-300 ${style?.bar ?? ""}`}
        />
      </div>
      {style && <p className={`text-xs ${style.text}`}>{style.label}</p>}
      {result?.issues.map((issue, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          {issue}
        </p>
      ))}
    </div>
  );
}

"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { VaultItem } from "@/types/password-vault.types";
import { StrengthDots } from "./strength-dots";

interface VaultCardProps {
  item: VaultItem;
  selected: boolean;
  onSelect: () => void;
}

function faviconFor(website?: string) {
  if (!website) return null;
  try {
    const url = website.startsWith("http") ? website : "http://" + website;
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
}

export function VaultCard({ item, selected, onSelect }: VaultCardProps) {
  const favicon = faviconFor(item.website);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-primary bg-accent"
          : "border-transparent hover:bg-accent/50",
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden">
        {favicon ? (
          <img src={favicon} alt="h-5 w-5" />
        ) : (
          <span className="text-sm font-medium text-muted-foreground">
            {item.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.username ?? item.email ?? item.website ?? "-"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StrengthDots level={item.strengthLevel} />
        {item.favorite && (
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        )}
      </div>
    </button>
  );
}

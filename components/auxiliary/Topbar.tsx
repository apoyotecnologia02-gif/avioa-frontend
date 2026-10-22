"use client";

import { Menu, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { View } from "./Workspace";
import { viewLabels } from "./Workspace";

interface Props {
  view: View;
  onOpenMobile: () => void;
  onGoHistory: () => void;
}

export function Topbar({ view, onOpenMobile }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobile}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-muted-foreground">
        <span className="shrink-0">Portal aVioa</span>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="shrink-0 font-medium text-foreground">Auxiliares</span>
        {view !== "overview" && (
          <>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate">{viewLabels[view]}</span>
          </>
        )}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground sm:flex">
          <ShieldCheck className="h-3 w-3" />
          Privado
        </span>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            AV
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

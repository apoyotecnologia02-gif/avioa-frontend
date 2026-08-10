"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface VaultHeaderProps {
  onCreateNew: () => void;
}

export function VaultHeader({ onCreateNew }: VaultHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b bg-card px-4 py-3">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Contraseñas</h1>
        <p className="text-xs text-muted-foreground">
          Gestiona tus credenciales de forma segura
        </p>
      </div>
      <Button size="sm" className="gap-2" onClick={onCreateNew}>
        <Plus className="h-4 w-4" />
        Nueva contraseña
      </Button>
    </div>
  );
}

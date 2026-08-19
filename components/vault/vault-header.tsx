"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface VaultHeaderProps {
  scope: "own" | "shared";
  onCreateNew: () => void;
  onScopeChange: (scope: "own" | "shared") => void;
}

export function VaultHeader({
  scope,
  onCreateNew,
  onScopeChange,
}: VaultHeaderProps) {
  return (
    // <div className="flex items-center justify-between border-b bg-card px-4 py-3">
    //   <div>
    //     <h1 className="text-lg font-semibold tracking-tight">Contraseñas</h1>
    //     <p className="text-xs text-muted-foreground">
    //       Gestiona tus credenciales de forma segura
    //     </p>
    //   </div>
    //   <Button size="sm" className="gap-2" onClick={onCreateNew}>
    //     <Plus className="h-4 w-4" />
    //     Nueva contraseña
    //   </Button>
    // </div>

    <div className="flex items-center justify-between border-b bg-card px-4 py-3">
      <div className="space-y-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Contraseñas</h1>
          <p className="text-xs text-muted-foreground">
            Gestiona tus credenciales de forma segura
          </p>
        </div>
        <Tabs
          value={scope}
          onValueChange={(v) => onScopeChange(v as "own" | "shared")}
        >
          <TabsList className="h-8">
            <TabsTrigger value="own" className="text-xs">
              Mis contraseñas
            </TabsTrigger>
            <TabsTrigger value="shared" className="text-xs">
              Compartidas conmigo
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Button size="sm" className="gap-2" onClick={onCreateNew}>
        <Plus className="h-4 w-4" />
        Nueva contraseña
      </Button>
    </div>
  );
}

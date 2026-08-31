import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VaultEmpty({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <KeyRound className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">No tienes credenciales</p>
        <p className="text-xs text-muted-foreground">
          Empieza agregando una contraseña
        </p>
      </div>
      <Button size="sm" onClick={onCreateNew}>
        Nueva contraseña
      </Button>
    </div>
  );
}

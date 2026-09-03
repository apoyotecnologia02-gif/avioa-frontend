import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import InviteForm from "./invite-form";

export const dynamic = "force-dynamic";

export default function InvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando invitación...
          </div>
        }
      >
        <InviteForm />
      </Suspense>
    </div>
  );
}

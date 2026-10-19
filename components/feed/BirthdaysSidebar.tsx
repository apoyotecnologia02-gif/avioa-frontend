import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFeedStore } from "@/store/feedStore";
import { cn } from "@/lib/utils";

const scrollbarStyles = `
  [&::-webkit-scrollbar]:w-1.5
  [&::-webkit-scrollbar]:h-1.5
  [&::-webkit-scrollbar-track]:bg-muted/20
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-muted-foreground/25
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/40
  dark:[&::-webkit-scrollbar-track]:bg-muted/15
  dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30
  dark:[&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50
  scrollbar-width:thin
  scrollbar-color:hsl(var(--muted-foreground)/0.25) transparent
`;

export function BirthdaysSidebar() {
  const birthdays = useFeedStore((s) => s.birthdays);

  if (birthdays.length === 0) return null;

  const formatBirthday = (day: number, month: number) => {
    const date = new Date(2000, month - 1, day);
    return format(date, "d MMM", { locale: es });
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-muted/30 p-5 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="mb-1 flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-1.5 text-primary">
            <Gift className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold">🎂 Cumpleaños del mes</h3>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          {birthdays.length}{" "}
          {birthdays.length === 1 ? "persona cumple" : "personas cumplen"} este
          mes
        </p>
      </div>

      {/* Lista con scroll interno */}
      <div
        className={cn(
          "flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto pr-1",
          scrollbarStyles,
        )}
      >
        {birthdays.map((b) => (
          <div
            key={b.userId}
            className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-muted/30"
          >
            <Avatar>
              <AvatarImage src={b.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/5 text-xs text-primary">
                {b.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{b.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBirthday(b.birthDay, b.birthMonth)}
              </p>
            </div>
            <div className="h-2 w-2 rounded-full bg-primary/40 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
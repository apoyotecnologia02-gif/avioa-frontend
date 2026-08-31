"use client";

import { useFeedStore } from "@/store/feedStore";
import { Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { es } from "date-fns/locale";
import { format } from "date-fns";

export function BirthdaysSidebar() {
  const birthdays = useFeedStore((s) => s.birthdays);

  if (birthdays.length === 0) return null;

  function formatBirthday(day: number, month: number) {
    const date = new Date(2000, month - 1, day);

    return format(date, "d MMM", { locale: es });
  }

  return (
    // <aside className="lg:sticky lg:top-4 lg:self-start">
    //   <div className="rounded-2xl border bg-card p-5">
    //     <div className="mb-1 flex items-center gap-2">
    //       <Gift className="h-4 w-4 text-primary" />
    //       <h3 className="text-sm font-medium">Cumpleaños del mes</h3>
    //     </div>
    //     <p className="mb-4 text-xs text-muted-foreground">
    //       {birthdays.length}{" "}
    //       {birthdays.length === 1 ? "persona este mes" : "personas este mes"}
    //     </p>

    //     <div className="flex max-h-72 flex-col gap-3.5 overflow-y-auto pr-1">
    //       {birthdays.map((b) => (
    //         <div key={b.userId} className="flex items-center gap-2.5">
    //           <Avatar>
    //             <AvatarImage src={b.avatarUrl ?? undefined} />
    //             <AvatarFallback>{b.name[0]}</AvatarFallback>
    //           </Avatar>
    //           <div className="min-w-0">
    //             <p className="truncate text-sm font-medium">{b.name}</p>
    //             <p className="text-xs text-muted-foreground">
    //               {/* {format(new Date(b.birthDay), "d MMM", { locale: es })} */}
    //               {formatBirthday(b.birthDay, b.birthMonth)}
    //             </p>
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </aside>
    <aside className="lg:sticky lg:top-8 lg:self-start">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-muted/30 p-5 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-1.5 text-primary">
            <Gift className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold">🎂 Cumpleaños del mes</h3>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          {birthdays.length}{" "}
          {birthdays.length === 1 ? "persona cumple" : "personas que cumplen"}{" "}
          este mes
        </p>

        <div className="flex max-h-72 flex-col gap-4 overflow-y-auto pr-1">
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
              <div className="h-2 w-2 rounded-full bg-primary/40" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

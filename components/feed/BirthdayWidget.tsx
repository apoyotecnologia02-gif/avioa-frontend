import { Birthday } from "@/types/feed.types";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { es } from "date-fns/locale";
import { format } from "date-fns";

export function BirthdaysWidget({ birthdays }: { birthdays: Birthday[] }) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-medium">🎂 Cumpleaños del mes</h3>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {birthdays.map((b) => (
          <div
            key={b.userId}
            className="flex shrink-0 flex-col items-center gap-1"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={b.avatarUrl ?? undefined} />
              <AvatarFallback>{b.name[0]}</AvatarFallback>
            </Avatar>
            <span className="max-w-[64px] truncate text-center text-xs">
              {b.name.split(" ")[0]}
            </span>
            <span>{format(new Date(b.birthDay), "d MMM", { locale: es })}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

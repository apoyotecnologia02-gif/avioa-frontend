"use client";

import { api } from "@/lib/axios";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Check, ChevronDown, Loader2, Search, UserRound } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

interface UserOption {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

interface Props {
  value: UserOption | null;
  onChange: (user: UserOption | null) => void;
}

export function RecognitionUserPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get(`/admin/users/search?q=${query}`, {
          skip401Redirect: true,
        });
        setResults(data);
      } catch (error) {
        console.error("Error al buscar usuarios:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-[220px] justify-between border-border/50 bg-muted/30 px-3 py-2 text-sm font-normal hover:bg-muted/50"
        >
          {value ? (
            <span className="flex items-center gap-2 truncate">
              <Avatar className="h-5 w-5 ring-1 ring-background">
                <AvatarImage src={value.avatarUrl} />
                <AvatarFallback className="bg-primary/5 text-[10px] text-primary">
                  {value.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{value.name}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <UserRound className="h-4 w-4" />
              <span className="truncate">¿A quién reconoces?</span>
            </span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 shadow-lg"
        side="bottom"
        align="start"
      >
        <Command shouldFilter={false} className="rounded-lg">
          <div className="relative border-b border-border/50">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <CommandInput
              placeholder="Buscar por nombre…"
              value={query}
              onValueChange={setQuery}
              className="h-10 border-0 pl-9 pr-4 text-sm focus:ring-0"
            />
          </div>
          <CommandList className="max-h-60 py-1">
            {isSearching && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                <span className="inline-block animate-pulse">Buscando…</span>
              </div>
            )}
            {!isSearching && query.trim().length >= 2 && (
              <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                No se encontraron colaboradores.
              </CommandEmpty>
            )}
            <CommandGroup>
              {results?.map((u) => (
                <CommandItem
                  key={u.userId}
                  value={u.userId}
                  onSelect={() => {
                    onChange(u);
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50 data-[selected=true]:bg-accent"
                >
                  <Avatar className="h-7 w-7 ring-1 ring-background">
                    <AvatarImage src={u.avatarUrl} />
                    <AvatarFallback className="bg-primary/5 text-xs text-primary">
                      {u.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm">{u.name}</span>
                  {value?.userId === u.userId && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import { cn } from "@/lib/utils";
import type { FeedAuthor } from "@/types/feed.types";

const DIRECTORY_ENDPOINT = "/admin/users/directory";

interface DirectoryUser extends FeedAuthor {
  email?: string | null;
  department?: string | null;
  position?: string | null;
  area?: string | null;
}

interface Props {
  value: FeedAuthor | null;
  onChange: (user: FeedAuthor | null) => void;
}

// Cache a nivel de módulo → sobrevive remounts, se comparte entre instancias
let directoryCache: DirectoryUser[] | null = null;
let directoryPromise: Promise<DirectoryUser[]> | null = null;

async function loadDirectory(): Promise<DirectoryUser[]> {
  if (directoryCache) return directoryCache;
  if (directoryPromise) return directoryPromise;

  directoryPromise = api
    .get<DirectoryUser[]>(DIRECTORY_ENDPOINT, { skip401Redirect: true })
    .then(({ data }) => {
      directoryCache = Array.isArray(data) ? data : [];
      return directoryCache;
    })
    .catch((error) => {
      directoryPromise = null; // permite reintentar
      throw error;
    });

  return directoryPromise;
}

export function RecognitionUserPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<DirectoryUser[]>(directoryCache ?? []);
  const [loading, setLoading] = useState(!directoryCache);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || directoryCache) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    loadDirectory()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("Error cargando directorio:", e);
        setError("No se pudo cargar la lista");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users.slice(0, 50);

    return users
      .filter((u) => {
        return (
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.department?.toLowerCase().includes(q) ||
          u.area?.toLowerCase().includes(q) ||
          u.position?.toLowerCase().includes(q)
        );
      })
      .slice(0, 50);
  }, [users, query]);

  const showEmpty = !loading && !error && filtered.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between rounded-full border-border/60 bg-muted/40 px-4 text-xs font-medium sm:w-[220px]"
        >
          {value ? (
            <span className="flex items-center gap-2 truncate">
              <Avatar className="h-5 w-5">
                <AvatarImage src={value.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[9px]">
                  {value.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{value.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              Elige a quién reconocer
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-80 p-0">
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
          {loading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <Input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, área o cargo…"
            className="h-7 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto p-1">
          {loading && (
            <div className="space-y-1 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5"
                >
                  <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-muted" />
                  <div className="h-3 flex-1 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="px-3 py-4 text-center text-xs text-destructive">
              {error}
            </div>
          )}

          {showEmpty && (
            <div className="px-3 py-6 text-center">
              <p className="text-xs text-muted-foreground">
                Sin resultados para{" "}
                <span className="font-medium">“{query}”</span>
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            filtered.map((u) => {
              const selected = value?.userId === u.userId;
              return (
                <button
                  key={u.userId}
                  type="button"
                  onClick={() => {
                    onChange({
                      userId: u.userId,
                      name: u.name,
                      avatarUrl: u.avatarUrl ?? null,
                      role: u.role,
                    });
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                    "hover:bg-muted",
                    selected && "bg-muted",
                  )}
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={u.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {u.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    {(u.position || u.department) && (
                      <p className="truncate text-[11px] text-muted-foreground">
                        {[u.position, u.department].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  {selected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              );
            })}
        </div>

        {!loading && !error && users.length > 0 && (
          <div className="border-t border-border/60 px-3 py-1.5 text-[10px] text-muted-foreground">
            {query
              ? `${filtered.length} de ${users.length} usuarios`
              : `${users.length} usuarios en el directorio`}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { useFlightFilters } from "@/hooks/useFlightFilters";
import { useEffect, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { DESTINOS } from "@/lib/destinos";

export function FilterFields() {
  const { filters, setFilter, clearAll, activeCount } = useFlightFilters();

  return (
    <div className="space-y-5">
      {/* <IataField filterKey="origen" label="Origen" /> */}
      {/* <IataField filterKey="destino" label="Destino" /> */}
      <DestinoField />
      <AerolineaField />

      <div className="flex items-center justify-between">
        <Label htmlFor="solo-gangas">Solo gangas</Label>
        <Switch
          id="solo-gangas"
          checked={!!filters.solo_gangas}
          onCheckedChange={(v) => setFilter("solo_gangas", v || undefined)}
        />
      </div>

      <PriceRangeField />

      <div className="space-y-1.5">
        <Label>Máx. escalas</Label>
        <Select
          value={filters.max_escalas?.toString() ?? "any"}
          onValueChange={(v) =>
            setFilter("max_escalas", v === "any" ? undefined : Number(v))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Cualquiera</SelectItem>
            <SelectItem value="0">Directo</SelectItem>
            <SelectItem value="1">Máx. 1 escala</SelectItem>
            <SelectItem value="2">Máx. 2 escalas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Fecha de ida</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={filters.fecha_ida_desde ?? ""}
            onChange={(e) =>
              setFilter("fecha_ida_desde", e.target.value || undefined)
            }
          />
          <Input
            type="date"
            value={filters.fecha_ida_hasta ?? ""}
            min={filters.fecha_ida_desde || undefined}
            onChange={(e) =>
              setFilter("fecha_ida_hasta", e.target.value || undefined)
            }
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Actualizado en</Label>
        <Select
          value={filters.horas?.toString() ?? "any"}
          onValueChange={(v) =>
            setFilter("horas", v === "any" ? undefined : Number(v))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Cualquier momento</SelectItem>
            <SelectItem value="24">Últimas 24 h</SelectItem>
            <SelectItem value="48">Últimas 48 h</SelectItem>
            <SelectItem value="72">Últimos 3 días</SelectItem>
            <SelectItem value="168">Última semana</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeCount > 0 && (
        <Button variant="ghost" onClick={clearAll} className="w-full">
          Limpiar todos los filtros
        </Button>
      )}
    </div>
  );
}

function IataField({
  filterKey,
  label,
}: {
  filterKey: "origen" | "destino";
  label: string;
}) {
  const { filters, setFilter } = useFlightFilters();
  const current = filters[filterKey];
  const [input, setInput] = useState(current ?? "");
  const debounced = useDebounce(input, 400);
  const pushed = useRef(current ?? "");

  useEffect(() => {
    const norm = debounced.trim().toUpperCase();
    if (norm.length !== 0 && norm.length !== 3) return;
    if (norm === pushed.current) return;
    pushed.current = norm;
    setFilter(filterKey, norm || undefined);
  }, [debounced, setFilter, filterKey]);

  useEffect(() => {
    const url = (current ?? "").toUpperCase();
    if (url === pushed.current) return;
    pushed.current = url;
    setInput(url);
  }, [current]);

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={input}
        onChange={(e) =>
          setInput(
            e.target.value
              .toUpperCase()
              .replace(/[^A-Z]/g, "")
              .slice(0, 3),
          )
        }
        placeholder="Ej: MDE"
        maxLength={3}
        className="font-mono uppercase tracking-wider"
      />
    </div>
  );
}

function DestinoField() {
  const { filters, setFilter } = useFlightFilters();

  const destinosUnicos = Array.from(
    new Map(DESTINOS.map((d) => [d.code, d])).values(),
  );

  return (
    <div className="space-y-1.5">
      <Label>Destino</Label>
      <Select
        value={filters.destino ?? "any"}
        onValueChange={(val) => {
          setFilter("destino", val === "any" ? undefined : val);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona un destino" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Cualquier destino</SelectItem>
          {destinosUnicos.map((d) => (
            <SelectItem key={d.code} value={d.code}>
              {d.name} ({d.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function AerolineaField() {
  const { filters, setFilter } = useFlightFilters();
  const current = filters.aerolinea;
  const [input, setInput] = useState(current ?? "");
  const debounced = useDebounce(input, 400);
  const pushed = useRef(current ?? "");

  useEffect(() => {
    const norm = debounced.trim();
    if (norm === pushed.current) return;
    pushed.current = norm;
    setFilter("aerolinea", norm || undefined);
  }, [debounced, setFilter]);

  useEffect(() => {
    const url = current ?? "";
    if (url === pushed.current) return;
    pushed.current = url;
    setInput(url);
  }, [current]);

  return (
    <div className="space-y-1.5">
      <Label>Aerolinea</Label>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ej: Avianca"
      />
    </div>
  );
}

function PriceRangeField() {
  return (
    <div className="space-y-1.5">
      <Label>Precio</Label>
      <div className="grid grid-cols-2 gap-2">
        <PriceInput filterKey="precio_min" placeholder="Mín" />
        <PriceInput filterKey="precio_max" placeholder="Máx" />
      </div>
    </div>
  );
}

function PriceInput({
  filterKey,
  placeholder,
}: {
  filterKey: "precio_min" | "precio_max";
  placeholder: string;
}) {
  const { filters, setFilter } = useFlightFilters();
  const current = filters[filterKey];
  const [input, setInput] = useState(current?.toString() ?? "");
  const debounced = useDebounce(input, 500);
  const pushed = useRef(current?.toString() ?? "");

  useEffect(() => {
    const norm = debounced.trim();
    if (norm === "") {
      if (pushed.current !== "") {
        pushed.current = "";
        setFilter(filterKey, undefined);
      }
      return;
    }
    const n = Number(norm);
    if (!Number.isInteger(n) || n < 0) return;
    const str = String(n);
    if (str === pushed.current) return;
    pushed.current = str;
    setFilter(filterKey, n);
  }, [debounced, setFilter, filterKey]);

  useEffect(() => {
    const url = current?.toString() ?? "";
    if (url === pushed.current) return;
    pushed.current = url;
    setInput(url);
  }, [current]);

  return (
    <Input
      type="number"
      min={0}
      placeholder={placeholder}
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  );
}

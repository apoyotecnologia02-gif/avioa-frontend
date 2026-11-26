"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  MapPin,
  Pencil,
  Plane,
  RefreshCw,
  Search,
  Tag,
} from "lucide-react";

import {
  OfferRecord,
  offersManagerNativeApi,
  type OffersSession,
  type OffersWorkspaceSnapshot,
} from "@/lib/offers-manager-native";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OffersNativeEditor } from "./OffersNativeEditor";

const getText = (value: unknown): string =>
  typeof value === "string" ? value : "";

function getStartingPrice(offer: OfferRecord) {
  const variants = Array.isArray(offer.variants) ? offer.variants : [];

  const candidates = variants.flatMap((variant) => {
    if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
      return [];
    }

    const data = variant as Record<string, unknown>;
    const price = Number(data.price);
    const currency = typeof data.currency === "string" ? data.currency : "";

    if (!Number.isFinite(price) || price <= 0 || !currency) {
      return [];
    }

    return [
      {
        price,
        currency,
        basis: typeof data.basis === "string" ? data.basis : "",
      },
    ];
  });

  if (candidates.length === 0) return null;

  const currency = candidates.some((item) => item.currency === "COP")
    ? "COP"
    : candidates[0].currency;

  const sameCurrency = candidates.filter((item) => item.currency === currency);

  return sameCurrency.reduce((lowest, current) =>
    current.price < lowest.price ? current : lowest,
  );
}

function formatOfferPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString("es-CO")}`;
  }
}

export function OffersNativeReadOnly() {
  const [session, setSession] = useState<OffersSession | null>(null);
  const [snapshot, setSnapshot] = useState<OffersWorkspaceSnapshot | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingOffer, setEditingOffer] = useState<OfferRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [sessionData, stateData] = await Promise.all([
        offersManagerNativeApi.getSession(),
        offersManagerNativeApi.getState(),
      ]);

      setSession(sessionData);
      setSnapshot(stateData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las ofertas.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleSaveOffer = async (updatedOffer: OfferRecord) => {
    if (!snapshot) {
      throw new Error("No hay una revisión cargada para guardar.");
    }

    setSaving(true);
    setSaveError("");

    try {
      const updatedPayload = {
        ...snapshot.payload,
        offers: snapshot.payload.offers.map((offer) =>
          offer.id === updatedOffer.id ? updatedOffer : offer,
        ),
      };

      const savedSnapshot = await offersManagerNativeApi.saveState({
        expectedRevision: snapshot.revision,
        payload: updatedPayload,
      });

      setSnapshot(savedSnapshot);
      setEditingOffer(null);
    } catch (error) {
      const apiError = error as {
        response?: { status?: number };
      };

      if (apiError.response?.status === 409) {
        setSaveError(
          "Los datos cambiaron desde la última lectura. Recarga las ofertas antes de guardar.",
        );
      }

      throw error;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const offers = snapshot?.payload.offers ?? [];

  const statuses = useMemo(
    () =>
      Array.from(
        new Set(offers.map((offer) => getText(offer.status)).filter(Boolean)),
      ).sort(),
    [offers],
  );

  const filteredOffers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return offers.filter((offer) => {
      const searchable = [
        offer.id,
        offer.title,
        offer.origin,
        offer.dest,
        offer.destName,
      ];

      const matchesSearch =
        !term ||
        searchable.some((value) => getText(value).toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "ALL" || getText(offer.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [offers, search, statusFilter]);

  const draftCount = offers.filter(
    (offer) => getText(offer.status).toUpperCase() === "BORRADOR",
  ).length;

  const publishedCount = offers.filter((offer) =>
    ["PUBLICADA", "PUBLICADO", "ACTIVA"].includes(
      getText(offer.status).toUpperCase(),
    ),
  ).length;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertCircle className="size-9 text-destructive" />
          <div className="space-y-1">
            <h3 className="font-semibold">No pudimos cargar las ofertas</h3>
            <p className="max-w-md text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => void loadData()} variant="outline">
            <RefreshCw className="mr-2 size-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!session || !snapshot) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No se recibió información del gestor de ofertas.
        </CardContent>
      </Card>
    );
  }

  if (editingOffer) {
    return (
      <div className="space-y-3">
        {saveError && (
          <p className="mx-6 mt-4 text-sm text-destructive">{saveError}</p>
        )}

        <OffersNativeEditor
          key={editingOffer.id}
          initialOffer={editingOffer}
          onCancel={() => {
            setEditingOffer(null);
            setSaveError("");
          }}
          onSave={handleSaveOffer}
        />
      </div>
    );
  }

  if (!session.canRead) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <AlertCircle className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h3 className="font-semibold">Acceso no disponible</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu usuario no tiene permisos para consultar las ofertas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado de la vista */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">
              Ofertas de viaje
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta y encuentra las ofertas disponibles en el gestor.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadData(true)}
          disabled={refreshing}
        >
          <RefreshCw
            className={`mr-2 size-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Indicadores */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total de ofertas</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {offers.length}
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3">
              <Tag className="size-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Publicadas / activas
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {publishedCount}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-3">
              <Plane className="size-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Borradores</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {draftCount}
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-3">
              <Tag className="size-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y filtros */}
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Buscar ofertas</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1fr_230px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título, ID, origen o destino..."
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">Listado de ofertas</h3>
            <p className="text-sm text-muted-foreground">
              Resultados recuperados del gestor.
            </p>
          </div>

          <Badge variant="secondary">
            {filteredOffers.length} de {offers.length}
          </Badge>
        </div>

        {filteredOffers.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Search className="mb-3 size-8 text-muted-foreground" />
              <p className="font-medium">No encontramos ofertas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Intenta cambiar el texto de búsqueda o el estado seleccionado.
              </p>
              {(search || statusFilter !== "ALL") && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-2"
                >
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {filteredOffers.map((offer) => {
              const title = getText(offer.title) || "Oferta sin título";
              const origin = getText(offer.origin);
              const destination =
                getText(offer.destName) || getText(offer.dest);
              const status = getText(offer.status) || "Sin estado";
              const kind = getText(offer.kind) || "Sin tipo";
              const startingPrice = getStartingPrice(offer);

              return (
                <Card
                  key={offer.id}
                  className="group shadow-none transition-colors hover:border-primary/40"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <h4 className="line-clamp-2 font-semibold leading-snug">
                          {title}
                        </h4>
                        <p className="truncate text-xs text-muted-foreground">
                          ID: {offer.id}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline">{status}</Badge>

                        {session?.canUpdate && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingOffer(offer)}
                          >
                            <Pencil className="mr-1.5 size-3.5" />
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="size-4" />
                        {origin || "Origen pendiente"}
                      </span>
                      <ArrowRight className="size-3.5 text-muted-foreground" />
                      <span className="font-medium">
                        {destination || "Destino pendiente"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-primary/5 p-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Desde
                        </p>

                        {startingPrice ? (
                          <>
                            <p className="mt-1 text-xl font-bold tracking-tight text-primary">
                              {formatOfferPrice(
                                startingPrice.price,
                                startingPrice.currency,
                              )}
                            </p>

                            {startingPrice.basis === "POR_PERSONA" && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Por persona
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="mt-1 text-sm font-medium text-muted-foreground">
                            Precio por confirmar
                          </p>
                        )}
                      </div>

                      <Badge
                        variant={
                          offer.priceConfirmed === true
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {offer.priceConfirmed === true
                          ? "Precio confirmado"
                          : "Sujeto a reconfirmación"}
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                      <span className="text-xs text-muted-foreground">
                        {kind}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Oferta
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-right text-xs text-muted-foreground">
        Revisión de datos: {snapshot.revision}
      </p>
    </div>
  );
}

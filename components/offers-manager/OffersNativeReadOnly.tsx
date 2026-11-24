"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  offersManagerNativeApi,
  type OffersSession,
  type OffersWorkspaceSnapshot,
} from "@/lib/offers-manager-native";

const getText = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

export function OffersNativeReadOnly() {
  const [session, setSession] = useState<OffersSession | null>(null);
  const [snapshot, setSnapshot] = useState<OffersWorkspaceSnapshot | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [sessionData, stateData] = await Promise.all([
        offersManagerNativeApi.getSession(),
        offersManagerNativeApi.getState(),
      ]);

      setSession(sessionData);
      setSnapshot(stateData);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los datos nativos.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

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
      const matchesSearch =
        !term ||
        [offer.id, offer.title, offer.origin, offer.dest, offer.destName].some(
          (value) => getText(value).toLowerCase().includes(term),
        );

      const matchesStatus =
        statusFilter === "ALL" || getText(offer.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [offers, search, statusFilter]);

  if (loading) {
    return <p className="p-6">Cargando Offers Manager nativo...</p>;
  }

  if (error) {
    return (
      <div className="m-6 rounded-lg border border-red-300 p-4">
        <p className="font-semibold text-red-600">
          Error al cargar Offers Manager
        </p>
        <p className="mt-2 text-sm">{error}</p>
        <button
          onClick={() => void loadData()}
          className="mt-4 rounded-md border px-4 py-2"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!session || !snapshot) {
    return <p className="p-6">No se recibieron datos del backend.</p>;
  }

  const permissions = [
    ["Leer", session.canRead],
    ["Crear", session.canCreate],
    ["Actualizar", session.canUpdate],
    ["Eliminar", session.canDelete],
    ["Aprobar", session.canApprove],
  ] as const;

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Offers Manager — React nativo</h1>
          <p className="text-sm text-muted-foreground">
            Pantalla de prueba en modo de solo lectura
          </p>
        </div>

        <button
          onClick={() => void loadData()}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Actualizar datos
        </button>
      </header>

      <section className="rounded-xl border p-5">
        <h2 className="mb-4 text-lg font-semibold">Sesión del usuario</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Correo</p>
            <p className="font-medium">{session.email}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Rol</p>
            <p className="font-medium">{session.role}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">User ID</p>
            <p className="break-all text-sm">{session.userId}</p>
          </div>
        </div>

        <h3 className="mb-3 mt-5 font-medium">Permisos nativos</h3>

        <div className="flex flex-wrap gap-2">
          {permissions.map(([name, enabled]) => (
            <span
              key={name}
              className={`rounded-full px-3 py-1 text-sm ${
                enabled
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {name}: {enabled ? "Sí" : "No"}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="mb-4 text-lg font-semibold">Estado de PostgreSQL</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Revisión</p>
            <p className="text-2xl font-bold">{snapshot.revision}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Versión</p>
            <p className="text-2xl font-bold">{snapshot.payload.version}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Total de ofertas</p>
            <p className="text-2xl font-bold">{offers.length}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Última actualización: {new Date(snapshot.updatedAt).toLocaleString()}
        </p>
      </section>

      <section className="rounded-xl border p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Listado de ofertas</h2>
            <p className="text-sm text-muted-foreground">
              Ofertas recuperadas desde PostgreSQL
            </p>
          </div>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
            {filteredOffers.length} de {offers.length} ofertas
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, ID, origen o destino..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="ALL">Todos los estados</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 space-y-3">
          {filteredOffers.map((offer) => {
            const title = getText(offer.title) || "Oferta sin título";
            const origin = getText(offer.origin);
            const destination = getText(offer.destName) || getText(offer.dest);
            const status = getText(offer.status) || "Sin estado";
            const kind = getText(offer.kind) || "Sin tipo";

            return (
              <article
                key={offer.id}
                className="rounded-xl border p-4 transition hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{title}</h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      ID: {offer.id}
                    </p>
                  </div>

                  <span className="rounded-full bg-muted px-3 py-1 text-xs">
                    {status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Origen</p>
                    <p className="text-sm font-medium">
                      {origin || "No especificado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Destino</p>
                    <p className="text-sm font-medium">
                      {destination || "No especificado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="text-sm font-medium">{kind}</p>
                  </div>
                </div>
              </article>
            );
          })}

          {filteredOffers.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No se encontraron ofertas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Prueba con otro término o estado.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

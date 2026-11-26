"use client";

import { useCallback, useEffect, useState } from "react";
import {
  OfferRecord,
  offersManagerNativeApi,
  OffersPayload,
  type OffersWorkspaceSnapshot,
} from "@/lib/offers-manager-native";
import { OffersNativeEditor } from "./OffersNativeEditor";

export function OffersNativeEditTest() {
  const [snapshot, setSnapshot] = useState<OffersWorkspaceSnapshot | null>(
    null,
  );

  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await offersManagerNativeApi.getState();

      setSnapshot(data);
      setSelectedId((current) => {
        if (current && data.payload.offers.some((o) => o.id === current)) {
          return current;
        }

        return data.payload.offers[0]?.id ?? "";
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las ofertas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveOffer = async (updatedOffer: OfferRecord) => {
    if (!snapshot) {
      throw new Error("No hay una revisión cargada para guardar.");
    }

    const updatedPayload: OffersPayload = {
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
    setSelectedId("");
  };

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  if (loading) {
    return <p className="p-6">Cargando ofertas...</p>;
  }

  if (error) {
    return (
      <div className="space-y-3 p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => void loadOffers()}
          className="rounded-lg border px-4 py-2"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!snapshot || snapshot.payload.offers.length === 0) {
    return <p className="p-6">No hay ofertas disponibles.</p>;
  }

  const selectedOffer = snapshot.payload.offers.find(
    (offer) => offer.id === selectedId,
  );

  if (selectedOffer) {
    return (
      <OffersNativeEditor
        key={selectedOffer.id}
        initialOffer={selectedOffer}
        onCancel={() => setSelectedId("")}
        onSave={handleSaveOffer}
      />
    );
  }

  return (
    <main className="space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-bold">Seleccionar oferta para editar</h1>
        <p className="text-sm text-muted-foreground">
          Revisión actual: {snapshot.revision}
        </p>
      </div>

      <section className="rounded-xl border p-5">
        <label className="mb-2 block text-sm font-medium">Oferta</label>

        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">Selecciona una oferta</option>

          {snapshot.payload.offers.map((offer) => (
            <option key={offer.id} value={offer.id}>
              {typeof offer.title === "string"
                ? offer.title
                : "Oferta sin título"}{" "}
              — {offer.id}
            </option>
          ))}
        </select>

        <button
          disabled={!selectedId}
          onClick={() => {
            if (!selectedId) return;
          }}
          className="mt-4 rounded-lg border px-4 py-2 disabled:opacity-50"
        >
          Oferta seleccionada
        </button>
      </section>
    </main>
  );
}

"use client";

import { OfferRecord } from "@/lib/offers-manager-native";
import { createNewOffer } from "@/lib/offers-manager.factory";
import { useState } from "react";

interface Props {
  onCancel: () => void;
  onSave: (offer: OfferRecord) => Promise<void>;
  initialOffer?: OfferRecord;
}

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function OffersNativeEditor({ onCancel, onSave, initialOffer }: Props) {
  const [offer, setOffer] = useState<OfferRecord>(() =>
    initialOffer ? JSON.parse(JSON.stringify(initialOffer)) : createNewOffer(),
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const isEditing = Boolean(initialOffer);

  const updateField = (field: string, value: string | boolean) => {
    setOffer((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");

    try {
      await onSave(offer);
    } catch (error) {
      const apiError = error as {
        response?: {
          status?: number;
          data?: { message?: string | { message?: string } };
        };
      };

      if (apiError.response?.status === 409) {
        setSaveError(
          "La oferta cambió en el servidor desde que la abriste. No se guardaron tus cambios. Cancela, recarga los datos y vuelve a editar.",
        );
      } else {
        const message = apiError.response?.data?.message;
        setSaveError(
          typeof message === "string"
            ? message
            : error instanceof Error
              ? error.message
              : "No se pudo guardar la oferta.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar oferta" : "Crear nueva oferta"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Modifica los datos generales de la oferta."
              : "Constructor nativo de ofertas."}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2"
        >
          Cancelar
        </button>
      </header>

      <section className="rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Información principal</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Estos datos permiten identificar y buscar la oferta.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Título comercial</span>

            <input
              value={getString(offer.title)}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Punta Cana desde Medellín"
              className="w-full rounded-lg border bg-background px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Ciudad de origen</span>

            <select
              value={getString(offer.origin)}
              onChange={(event) => updateField("origin", event.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2"
            >
              <option value="">Por confirmar / varias ciudades</option>
              <option value="MDE">Medellín · MDE</option>
              <option value="BOG">Bogotá · BOG</option>
              <option value="CLO">Cali · CLO</option>
              <option value="CTG">Cartagena · CTG</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Código del destino</span>

            <input
              value={getString(offer.dest)}
              onChange={(event) =>
                updateField("dest", event.target.value.toUpperCase())
              }
              placeholder="PUJ"
              className="w-full rounded-lg border bg-background px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Nombre visible del destino
            </span>

            <input
              value={getString(offer.destName)}
              onChange={(event) => updateField("destName", event.target.value)}
              placeholder="Punta Cana"
              className="w-full rounded-lg border bg-background px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Tipo de producto</span>

            <select
              value={getString(offer.kind)}
              onChange={(event) => updateField("kind", event.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2"
            >
              <option value="VUELO_HOTEL">Vuelo + hotel</option>
              <option value="CIRCUITO">Circuito multidestino</option>
              <option value="CRUCERO">Crucero</option>
              <option value="TERRESTRE">Plan terrestre</option>
              <option value="ACTIVIDAD">Actividad / tour</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Fuente / archivo</span>

            <input
              value={getString(offer.sourceFile)}
              onChange={(event) =>
                updateField("sourceFile", event.target.value)
              }
              placeholder="Formulario Avioa"
              className="w-full rounded-lg border bg-background px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-6 rounded-lg border p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={offer.defaultForDestination === true}
              onChange={(event) =>
                updateField("defaultForDestination", event.target.checked)
              }
              className="mt-1"
            />

            <span>
              <strong className="block text-sm">
                Respuesta principal para este destino
              </strong>

              <span className="mt-1 block text-xs text-muted-foreground">
                Esta oferta podrá aparecer primero cuando el cliente consulte
                por este destino y origen.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="space-y-1">
            <span className="text-sm font-medium">
              Descripción para Producto
            </span>

            <textarea
              value={getString(offer.description)}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              rows={3}
              placeholder="Descripción corta de la oferta..."
              className="w-full rounded-lg border bg-background px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Notas internas</span>

            <textarea
              value={getString(offer.notes)}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={3}
              placeholder="Notas internas para el equipo de Producto..."
              className="w-full rounded-lg border bg-background px-3 py-2"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="font-semibold">Información del borrador</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Identificador</p>
            <p className="text-sm font-medium">{offer.id}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <p className="text-sm font-medium">BORRADOR</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Tipo</p>
            <p className="text-sm font-medium">{getString(offer.kind)}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Los cambios se enviarán al servidor y quedarán registrados en el
          historial de revisiones cuando el guardado sea exitoso.
        </p>
      </section>

      <footer className="flex flex-wrap items-center justify-end gap-3">
        {saveError && (
          <p className="mr-auto text-sm text-destructive">{saveError}</p>
        )}

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border px-4 py-2 disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </footer>
    </main>
  );
}

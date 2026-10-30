"use client";
import { auxiliaryFetch } from "@/lib/auxiliary-operational/client";
import { useState } from "react";
import { Upload } from "lucide-react";
import { parseReservationPasswordFile } from "@/lib/auxiliary-operational/domain/reservation-password-import";
import { vaultIdentity } from "@/lib/auxiliary-operational/domain/vault-import";
import type { VaultData } from "@/lib/auxiliary-operational/domain/vault-crypto";
export default function AuxiliaryPasswordImport({
  existing,
  onSaved,
  disabled,
}: {
  existing: Pick<VaultData, "name" | "username">[];
  onSaved: (message: string) => Promise<void>;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [rows, setRows] = useState<VaultData[]>([]),
    [filename, setFilename] = useState("");
  const seen = new Set(existing.map(vaultIdentity)),
    preview = rows.map((row) => {
      const identity = vaultIdentity(row),
        duplicate = seen.has(identity);
      seen.add(identity);
      return { name: row.name, username: row.username, duplicate };
    }),
    newCount = preview.filter((row) => !row.duplicate).length;
  function close() {
    setOpen(false);
    setRows([]);
    setError("");
    setFilename("");
  }
  async function choose(file: File) {
    setBusy(true);
    setError("");
    setRows([]);
    setFilename("");
    try {
      setRows(await parseReservationPasswordFile(file));
      setFilename(file.name);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (busy || disabled || !rows.length) return;
    setBusy(true);
    setError("");
    try {
      const response = await auxiliaryFetch(
        "/api/auxiliary-operational/passwords",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "import", entries: rows }),
        },
      );
      const result = (await response.json()) as {
        error?: string;
        imported: number;
        skipped: number;
      };
      if (!response.ok) throw Error(result.error || "No se pudo importar.");
      await onSaved(
        `${result.imported} contraseñas importadas · ${result.skipped} duplicadas omitidas.`,
      );
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="aux-password-import">
      <button
        type="button"
        disabled={disabled || busy}
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Upload size={17} /> Importar Excel
      </button>
      {open && (
        <section className="aux-password-editor">
          <h3>Importar contraseñas desde Excel</h3>
          <p>
            Archivo .xlsx con las columnas{" "}
            <strong>Nombre, Usuario, Contraseña y Link</strong>. Link puede
            quedar vacío. Máximo 200 accesos y 2 MB.
          </p>
          <p className="aux-muted">
            Usa la primera hoja. Formatea usuario y contraseña como Texto para
            conservar ceros y caracteres. Los accesos con el mismo nombre y
            usuario se omiten.
          </p>
          <label>
            Seleccionar Excel
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              disabled={disabled || busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void choose(file);
              }}
            />
          </label>
          {busy && <p role="status">Procesando…</p>}
          {error && (
            <p className="aux-error" role="alert">
              {error}
            </p>
          )}
          {rows.length > 0 && (
            <>
              <p>
                <strong>{filename}</strong>
                <br />
                {newCount} nuevos · {rows.length - newCount} duplicados ·{" "}
                {rows.length} filas
              </p>
              <div className="aux-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Usuario</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i}>
                        <td>{row.name}</td>
                        <td>{row.username}</td>
                        <td>{row.duplicate ? "Se omite" : "Nuevo"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="aux-actions">
            <button type="button" disabled={busy} onClick={close}>
              Cancelar
            </button>
            <button
              type="button"
              className="aux-primary"
              disabled={disabled || busy || !rows.length || newCount === 0}
              onClick={() => void save()}
            >
              Importar {newCount || ""} contraseñas
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

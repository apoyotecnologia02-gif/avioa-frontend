"use client";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { transferService } from "@/lib/transfers/client";
export default function EvolutionConnection() {
  const [status, setStatus] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      setStatus(await transferService.evolutionStatus());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <article className="transfer-integration-card">
      <div className="transfer-integration-icon">
        <MessageCircle size={20} />
      </div>
      <div className="transfer-integration-copy">
        <h3>WhatsApp · Evolution API</h3>
        <p>
          {status?.message || "Consultando la instancia del portal."}
          {status?.instance ? " Instancia: " + status.instance : ""}
        </p>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
      </div>
      <span
        className={
          status?.connected ? "transfer-status is-on" : "transfer-status"
        }
      >
        {status?.connected ? <CheckCircle2 size={15} /> : null}
        {status?.connected ? "Conectado" : "No disponible"}
      </span>
      <div className="transfer-integration-actions">
        <button
          className="btn secondary"
          disabled={busy}
          onClick={() => void load()}
        >
          {busy ? (
            <Loader2 className="spin" size={15} />
          ) : (
            <RefreshCw size={15} />
          )}
          Actualizar
        </button>
      </div>
    </article>
  );
}

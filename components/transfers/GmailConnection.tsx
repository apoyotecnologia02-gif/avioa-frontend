"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { CheckCircle2, Loader2, Mail, Unplug } from "lucide-react";
export default function GmailConnection() {
  const [status, setStatus] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setStatus((await api.get("/transfers/gmail/connection")).data);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function connect() {
    setBusy(true);
    setError("");
    try {
      const result = (await api.get("/transfers/gmail/connect")).data;
      window.location.assign(result.authorizationUrl);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  async function disconnect() {
    setBusy(true);
    setError("");
    try {
      await api.delete("/transfers/gmail/connection");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="transfer-integration-card">
      <div className="transfer-integration-icon">
        <Mail size={20} />
      </div>
      <div className="transfer-integration-copy">
        <h3>Gmail</h3>
        <p>
          {status?.connected
            ? "Cuenta conectada: " + status.email
            : status?.needsReconnect
              ? "La conexión necesita renovarse para enviar correos. Vuelve a conectar Gmail."
              : "Conecta tu cuenta personal para enviar solicitudes por correo."}
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
        {status?.connected ? "Conectado" : "Desconectado"}
      </span>
      <div className="transfer-integration-actions">
        {status?.connected ? (
          <button
            className="btn secondary"
            disabled={busy}
            onClick={() => void disconnect()}
          >
            <Unplug size={15} />
            Desconectar
          </button>
        ) : (
          <button
            className="btn primary"
            disabled={busy || status?.configured === false}
            onClick={() => void connect()}
          >
            {busy ? <Loader2 className="spin" size={15} /> : <Mail size={15} />}
            Conectar Gmail
          </button>
        )}
      </div>
    </article>
  );
}

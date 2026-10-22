"use client";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MessageCircle,
  Send,
} from "lucide-react";
import { transferService } from "@/lib/transfers/client";
type Props = {
  id: string;
  version: number;
  channel: "email" | "whatsapp";
  notify: (message: string) => void;
};
export default function DeliveryPanel({ id, version, channel, notify }: Props) {
  const [preview, setPreview] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false);
  async function load() {
    setError("");
    try {
      setPreview(
        channel === "email"
          ? await transferService.emailPreview(id)
          : await transferService.whatsappPreview(id),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void load();
  }, [id, version, channel]);
  const delivery = preview?.deliveries?.find(
    (item: any) => item.version === preview.version,
  );
  const blocked =
    delivery &&
    ["SENT", "ACCEPTED", "SENDING", "UNCERTAIN"].includes(delivery.status);
  async function send() {
    setBusy(true);
    setError("");
    try {
      if (channel === "email")
        await transferService.sendEmail(
          id,
          preview.version,
          preview.previewHash,
          delivery?.status === "FAILED",
        );
      else
        await transferService.sendWhatsApp(
          id,
          preview.version,
          preview.previewHash,
          delivery?.status === "FAILED",
        );
      setConfirm(false);
      await load();
      notify(
        channel === "email"
          ? "Correo enviado por Gmail"
          : "WhatsApp aceptado por Evolution",
      );
    } catch (e) {
      setError((e as Error).message);
      await load();
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="transfer-delivery">
      <h4>
        {channel === "email" ? <Mail size={17} /> : <MessageCircle size={17} />}{" "}
        {channel === "email" ? "Enviar desde Gmail" : "Enviar por WhatsApp"}
      </h4>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      {!preview && !error ? (
        <p className="helper">
          <Loader2 className="spin" size={15} />
          Preparando vista previa...
        </p>
      ) : (
        preview && (
          <>
            <div className="transfer-delivery-target">
              <span>{channel === "email" ? "De" : "Instancia"}</span>
              <strong>
                {channel === "email"
                  ? preview.from || "Cuenta sin conectar"
                  : preview.instance || "Sin configurar"}
              </strong>
              <span>Para</span>
              <strong>
                {channel === "email"
                  ? preview.to.join(", ")
                  : preview.number
                    ? "+" + preview.number
                    : "Sin número"}
              </strong>
              {channel === "email" && (
                <>
                  <span>Asunto</span>
                  <strong>{preview.subject}</strong>
                </>
              )}
            </div>
            {preview.reason && <p className="helper">{preview.reason}</p>}
            {delivery && (
              <div
                className={
                  "delivery-result " +
                  (["SENT", "ACCEPTED"].includes(delivery.status)
                    ? "success"
                    : "")
                }
              >
                <strong>
                  {["SENT", "ACCEPTED"].includes(delivery.status) ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}{" "}
                  {delivery.status === "SENT"
                    ? "Correo enviado"
                    : delivery.status === "ACCEPTED"
                      ? "Evolution aceptó el mensaje"
                      : delivery.status === "FAILED"
                        ? "El intento fue rechazado"
                        : delivery.status === "SENDING"
                          ? "Envío en curso"
                          : "Resultado incierto"}
                </strong>
                <p>
                  {delivery.error ||
                    (channel === "email"
                      ? "Esto no confirma que el proveedor lo haya leído."
                      : "Evolution aceptó el mensaje; esto no confirma entrega ni lectura.")}
                </p>
              </div>
            )}
            {preview.canSend && !blocked && !confirm && (
              <div className="button-row">
                <button
                  className="btn primary"
                  onClick={() => setConfirm(true)}
                >
                  {channel === "email" ? (
                    <Mail size={15} />
                  ) : (
                    <MessageCircle size={15} />
                  )}
                  Revisar y enviar
                </button>
              </div>
            )}
            {confirm && (
              <div className="send-confirm">
                <strong>Confirmar envío real</strong>
                <p>
                  Se enviará este mensaje a{" "}
                  <b>
                    {channel === "email"
                      ? preview.to.join(", ")
                      : "+" + preview.number}
                  </b>
                  . Revisa el texto antes de confirmar.
                </p>
                <div className="button-row">
                  <button
                    className="btn secondary"
                    disabled={busy}
                    onClick={() => setConfirm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn primary"
                    disabled={busy}
                    onClick={() => void send()}
                  >
                    {busy ? (
                      <Loader2 className="spin" size={15} />
                    ) : (
                      <Send size={15} />
                    )}
                    Confirmar envío
                  </button>
                </div>
              </div>
            )}
          </>
        )
      )}
    </section>
  );
}

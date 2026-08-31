import { create } from "zustand";
import { api } from "@/lib/axios";
import {
  CotizadorJobResponse,
  CotizadorRequest,
  CotizadorResult,
  JobStatus,
} from "@/types/cotizador.types";

const POLL_INTERVAL_MS = 2500;

interface CotizadorState {
  jobId: string | null;
  status: JobStatus | "idle";
  progress: { percentage: number; message: string } | null;
  result: CotizadorResult | null;
  error: string | null;

  submit: (dto: CotizadorRequest) => Promise<void>;
  reset: () => void;
}

let pollTimeout: ReturnType<typeof setTimeout> | null = null;

function stopPolling() {
  if (pollTimeout) {
    clearTimeout(pollTimeout);
    pollTimeout = null;
  }
}

export const useCotizadorStore = create<CotizadorState>((set, get) => ({
  jobId: null,
  status: "idle",
  progress: null,
  result: null,
  error: null,

  submit: async (dto) => {
    stopPolling();
    set({
      jobId: null,
      status: "waiting",
      progress: { percentage: 0, message: "Enviando solicitud..." },
      result: null,
      error: null,
    });

    try {
      const { data } = await api.post("/cotizador/cotizar", dto);
      const jobId: string = data.jobId ?? data.id ?? data;

      set({ jobId });

      const poll = async () => {
        try {
          const { data: job } = await api.get<CotizadorJobResponse>(
            `/cotizador/estado/${jobId}`,
          );

          set({
            status: job.status,
            progress: job.progress,
          });

          if (job.status === "completed") {
            set({ result: job.result });
            stopPolling();
            return;
          }

          if (job.status === "failed") {
            set({ error: job.error ?? "La cotización falló." });
            stopPolling();
            return;
          }

          pollTimeout = setTimeout(poll, POLL_INTERVAL_MS);
        } catch (err) {
          console.error("Error consultando estado del job:", err);
          set({ error: "No se pudo consultar el estado de la cotización." });
          stopPolling();
        }
      };

      poll();
    } catch (err) {
      console.error("Error creando la cotización:", err);
      set({
        status: "failed",
        error: "No se pudo iniciar la cotización.",
      });
    }
  },

  reset: () => {
    stopPolling();
    set({
      jobId: null,
      status: "idle",
      progress: null,
      result: null,
      error: null,
    });
  },
}));

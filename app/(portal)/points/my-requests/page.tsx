"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PointRequest {
  pointRequestId: string;
  userId: string;
  leaderId: string;
  action: string;
  points: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  decision: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

const STATUS_CONFIG = {
  APPROVED: {
    label: "Aprobada",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  REJECTED: {
    label: "Rechazada",
    icon: XCircle,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    badgeBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  PENDING: {
    label: "Pendiente",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    badgeBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function RequestSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-border/50 bg-card/50 space-y-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get<{ success: boolean; data: PointRequest[] }>(
          "/points/my-requests"
        );
        setRequests(res.data.data ?? []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "No fue posible cargar las solicitudes"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/points")}
          className="-ml-2 mb-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Recompensas
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Mis Solicitudes de Puntos
            </h1>
            <p className="text-sm text-muted-foreground">
              Seguimiento de todas tus solicitudes enviadas al líder
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <RequestSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center space-y-3">
          <div className="flex justify-center">
            <Coins className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Aún no has enviado ninguna solicitud de puntos
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/points")}
          >
            Solicitar puntos
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const config = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.PENDING;
            const Icon = config.icon;
            const createdDate = formatDate(req.createdAt);
            const reviewedDate = formatDate(req.reviewedAt);

            return (
              <div
                key={req.pointRequestId}
                className={`p-4 rounded-xl border ${config.border} bg-card/70 backdrop-blur-sm hover:bg-card transition-colors duration-200 space-y-3`}
              >
                {/* Top row */}
                <div className="flex items-start gap-3">
                  {/* Status icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg} mt-0.5`}
                  >
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>

                  {/* Action + dates */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium leading-snug">
                      {req.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Solicitado: {createdDate}
                      {reviewedDate && (
                        <span className="ml-2 opacity-70">
                          · Revisado: {reviewedDate}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Points + badge */}
                  <div className="shrink-0 text-right space-y-1.5">
                    <p className="text-base font-bold tabular-nums text-primary">
                      +{req.points} pts
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeBg}`}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Decision note (only when rejected and has decision) */}
                {req.status === "REJECTED" && req.decision && (
                  <div className="ml-13 pl-13 border-l-2 border-rose-500/30 pl-3 ml-[52px]">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-rose-500/80">
                        Motivo:{" "}
                      </span>
                      {req.decision}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PointTransaction {
  pointTransactionId: string;
  userId: string;
  pointRequestId: string;
  type: "EARN" | "REDEEM" | "DEDUCT";
  points: number;
  balanceAfter: number;
  createdAt: string;
}

const TYPE_CONFIG = {
  EARN: {
    label: "Puntos ganados",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    prefix: "+",
    badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  REDEEM: {
    label: "Canje de recompensa",
    icon: TrendingDown,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    prefix: "-",
    badgeBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  DEDUCT: {
    label: "Deducción",
    icon: TrendingDown,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    prefix: "-",
    badgeBg: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50"
        >
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-5 w-16 ml-auto" />
            <Skeleton className="h-3 w-20 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PointsHistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get<{ success: boolean; data: PointTransaction[] }>(
          "/points/history"
        );
        setTransactions(res.data.data ?? []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "No fue posible cargar el historial"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
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
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Historial de Transacciones
            </h1>
            <p className="text-sm text-muted-foreground">
              Registro de todos tus movimientos de puntos
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <TransactionSkeleton />
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
      ) : transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center space-y-3">
          <div className="flex justify-center">
            <Coins className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Aún no tienes transacciones registradas
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const config = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.EARN;
            const Icon = config.icon;
            return (
              <div
                key={tx.pointTransactionId}
                className={`group flex items-center gap-4 p-4 rounded-xl border ${config.border} bg-card/70 backdrop-blur-sm hover:bg-card transition-colors duration-200`}
              >
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                >
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium leading-none">
                      {config.label}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeBg}`}
                    >
                      {tx.type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>

                {/* Points & Balance */}
                <div className="text-right shrink-0">
                  <p className={`text-base font-bold tabular-nums ${config.color}`}>
                    {config.prefix}
                    {tx.points} pts
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Saldo: {tx.balanceAfter} pts
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

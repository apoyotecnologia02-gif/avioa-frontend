"use client";

import { BalanceRing } from "@/components/leaves/BalanceRing";
import { LeaveCalendar } from "@/components/leaves/LeaveCalendar";
import { LeaveTimeline } from "@/components/leaves/LeaveTimeline";
import { RequestLeaveModal } from "@/components/leaves/RequestLeaveModal";
import { ReviewLeaveModal } from "@/components/leaves/ReviewLeaveModal";
import { TeamLeavesView } from "@/components/leaves/TeamLeavesView";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  useCancelLeave,
  useCreateLeave,
  useMyLeaves,
  useReviewLeave,
  useTeamLeaves,
  useVacationBalance,
} from "@/hooks/useLeaves";
import { isLeaderOrManagerOrAdminRole } from "@/lib/roles";
import { LeaveRequest } from "@/types/leaves.types";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function LeavesPage() {
  const { user } = useAuth();
  const isLeader = isLeaderOrManagerOrAdminRole(user?.role);

  const [requestOpen, setRequestOpen] = useState(false);
  const [reviewLeave, setReviewLeave] = useState<LeaveRequest | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const {
    balance,
    isLoading: balanceLoading,
    reload: reloadBalance,
  } = useVacationBalance();

  const {
    leaves: myLeaves,
    isLoading: myLeavesLoading,
    reload: reloadMy,
  } = useMyLeaves();

  const {
    leaves: teamLeaves,
    isLoading: teamLeavesLoading,
    reload: reloadTeam,
  } = useTeamLeaves(isLeader);

  const { isReviewing, reviewLeave: doReview } = useReviewLeave(async () => {
    setReviewOpen(false);
    await Promise.all([reloadTeam(), reloadBalance(), reloadMy()]);
    // await reloadTeam();
  });

  const { isCancelling, cancelLeave } = useCancelLeave(async () => {
    await Promise.all([reloadBalance(), reloadMy()]);
  });

  const { isSubmitting, createLeave } = useCreateLeave(async () => {
    setRequestOpen(false);
    await Promise.all([reloadBalance(), reloadMy()]);
  });

  const upcoming = [...myLeaves]
    .filter(
      (l) =>
        (l.status === "APPROVED" || l.status === "PENDING") &&
        new Date(l.endDate) >= new Date(),
    )
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )[0];

  const handleReviewClick = (leave: LeaveRequest) => {
    setReviewLeave(leave);
    setReviewOpen(true);
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex itemss-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Vacaciones y ausencias
          </h1>
          <p className="text-sm text-muted-foreground">
            Tu saldo, solicitudes y estado de cada una
          </p>
        </div>
        <Button onClick={() => setRequestOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Solicitar
        </Button>
      </div>

      {/* Fila superior: anillo + contexto */}
      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <div className="rounded-xl border bg-card p-5">
          <BalanceRing balance={balance} isLoading={balanceLoading} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Próxima ausencia</p>
            {upcoming ? (
              <>
                <p className="mt-1.5 text-sm font-medium">
                  {new Date(upcoming.startDate).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  -{" "}
                  {new Date(upcoming.endDate).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {upcoming.businessDays} día(s) hábiles ·{" "}
                  {upcoming.status === "PENDING" ? "Pendiente" : "Aprobada"}
                </p>
              </>
            ) : (
              <p className="mt-1.5 text-sm text-muted-foreground">
                No tienes ausencias programadas
              </p>
            )}
          </div>

          {/* <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">
              Devengado desde tu ingreso
            </p>
            <p className="mt-1.5 text-sm font-medium">
              {balance?.accrued ?? 0} días hábiles
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              15 por año · Art. 186 CST
            </p>
          </div> */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Resumen de tus vacaciones
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Devengados</p>
                <p className="text-sm font-medium">
                  {balance?.accrued ?? 0} días
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Tomados</p>
                <p className="text-sm font-medium">
                  {balance?.taken ?? 0} días
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Pendientes</p>
                <p className="text-sm font-medium">
                  {balance?.pending ?? 0} días
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Saldo actual</p>
                <p
                  className={`text-sm font-semibold ${
                    (balance?.available ?? 0) < 0
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {balance?.available ?? 0} días
                </p>
              </div>
            </div>

            {(balance?.pending ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground">
                Si se aprueban tus solicitudes pendientes, tu saldo quedaría en{" "}
                <span className="font-medium">
                  {balance?.projectedAvailable ?? 0} días
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* vista de lider (si aplica) */}
      {isLeader && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Solicitudes de mi equipo</h2>
          <TeamLeavesView
            leaves={teamLeaves}
            isLoading={teamLeavesLoading}
            onReviewClick={handleReviewClick}
          />
        </section>
      )}

      {/* mis solicitudes + mi calendario */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Mis solicitudes</h2>
          <LeaveTimeline
            leaves={myLeaves}
            isLoading={myLeavesLoading}
            onCancel={cancelLeave}
            isCancelling={isCancelling}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Mi calendario</h2>
          <LeaveCalendar leaves={myLeaves} />
        </section>
      </div>

      {/* Modales */}
      <RequestLeaveModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        onSubmit={createLeave}
        isSubmitting={isSubmitting}
        balance={balance}
      />
      <ReviewLeaveModal
        leave={reviewLeave}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        onReview={doReview}
        isReviewing={isReviewing}
      />
    </div>
  );
}

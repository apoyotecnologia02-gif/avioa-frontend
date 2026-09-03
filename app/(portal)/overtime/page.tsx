// app/(portal)/overtime/page.tsx

"use client";

import { Plus, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isLeaderOrManagerOrAdminRole } from "@/lib/roles";
import { useOvertimeSummary } from "@/hooks/useOvertimeSummary";
import { useMyOvertime } from "@/hooks/useMyOvertime";
import { useTeamOvertime } from "@/hooks/useTeamOvertime";
import { useCreateOvertime } from "@/hooks/useCreateOvertime";
import { useReviewOvertime } from "@/hooks/useReviewOvertime";
import {
  OvertimeCalendar,
  OvertimeEntry,
} from "@/components/overtime/OvertimeCalendar";
import { OvertimeDayPanel } from "@/components/overtime/OvertimeDayPanel";
import { OvertimeSummaryCards } from "@/components/overtime/OvertimeSummaryCards";
import { RegisterOvertimeModal } from "@/components/overtime/RegisterOvertimeModal";
import { ReviewOvertimeModal } from "@/components/overtime/ReviewOvertimeModal";
import type { OvertimeRecord, OvertimeStatus } from "@/types/overtime.types";
import { useGetLeaders } from "@/hooks/useGetLeaders";

import { useEffect, useState } from "react";
import { useOvertimeStore } from "@/store/overtimeStore";
import { useSearchParams } from "next/navigation";

function toDateOnly(value: string) {
  if (!value) return "";
  if (value.includes("T")) return value.split("T")[0];
  if (value.includes(" ")) return value.split(" ")[0];
  return value;
}

export default function OvertimePage() {
  const { user } = useAuth();
  const isLeaderOrManager = isLeaderOrManagerOrAdminRole(user);

  //obtener el estado del store (zustand)
  const { shouldOpenModal, clearModalTrigger } = useOvertimeStore();

  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Selected day state
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Modal visibility
  const [registerOpen, setRegisterOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (shouldOpenModal) {
      setReviewOpen(true);
      clearModalTrigger();
    }
  }, [shouldOpenModal, clearModalTrigger]);

  // Data hooks
  const {
    summary,
    isLoading: summaryLoading,
    reload: reloadSummary,
  } = useOvertimeSummary(year, month);
  const {
    records: myRecords,
    isLoading: myLoading,
    reload: reloadMy,
  } = useMyOvertime();
  const {
    records: teamRecords,
    isLoading: teamLoading,
    reload: reloadTeam,
  } = useTeamOvertime(isLeaderOrManager);

  // Action hooks
  const { isSubmitting: isCreating, createOvertime } = useCreateOvertime(
    async () => {
      setRegisterOpen(false);
      await Promise.all([reloadSummary(), reloadMy()]);
    },
  );

  const { isSubmitting: isReviewing, reviewOvertime } = useReviewOvertime(
    async () => {
      await reloadTeam();
    },
  );

  // All leaders
  const {
    requests: leaders,
    isLoading: leadersLoading,
    reload: reloadLeaders,
  } = useGetLeaders();

  // Filter my records for the selected day
  const dayRecords: OvertimeRecord[] = selectedDate
    ? myRecords.filter((r) => toDateOnly(r.date) === selectedDate)
    : [];

  // If summary has records for the day (with detail), prefer those
  const summaryDay = summary?.days.find((d) => d.date === selectedDate);
  const dayRecordsToShow: OvertimeEntry[] = summaryDay?.entries
    ? summaryDay.entries
    : [];

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate("");
  };

  useEffect(() => {
    const requestId = searchParams.get("review");

    if (requestId && isLeaderOrManager) {
      setReviewOpen(true);
    }
  }, [searchParams, isLeaderOrManager]);

  useEffect(() => {
    const handler = async () => {
      await reloadTeam();
      await reloadSummary();
      await reloadMy();
    };

    window.addEventListener("overtime-request-created", handler);
    window.addEventListener("overtime_request_approved", handler);
    window.addEventListener("overtime_request_rejected", handler);

    return () => {
      window.removeEventListener("overtime-request-created", handler);
      window.removeEventListener("overtime_request_approved", handler);
      window.removeEventListener("overtime_request_rejected", handler);
    };
  }, [reloadTeam, reloadSummary, reloadMy]);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 py-2 sm:py-4 animate-in fade-in duration-500">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Control de Horas
          </h1>
          <p className="text-muted-foreground">
            Registra y consulta tus horas extra del mes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isLeaderOrManager && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setReviewOpen(true)}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Revisar Solicitudes</span>
              <span className="sm:hidden">Revisar</span>
            </Button>
          )}
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setRegisterOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Registrar Horas Extra</span>
            <span className="sm:hidden">Registrar</span>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {/* <OvertimeSummaryCards summary={summary} isLoading={summaryLoading} /> */}

      {/* Calendar + day panel */}
      <div
        className={`grid gap-4 transition-all duration-300 ${
          selectedDate ? "grid-cols-1 lg:grid-cols-[1fr_360px]" : "grid-cols-1"
        }`}
      >
        {/* Calendar */}
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm sm:p-5">
          <OvertimeCalendar
            currentDate={currentDate}
            onMonthChange={handleMonthChange}
            daySummaries={summary?.days ?? []}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            isLoading={summaryLoading}
            // daysToColor={daysToColor}
          />
        </div>

        {/* Day detail panel */}
        {selectedDate && (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col min-h-[300px]">
            <OvertimeDayPanel
              selectedDate={selectedDate}
              records={dayRecordsToShow}
              isLoading={myLoading}
              onClose={() => setSelectedDate("")}
            />
          </div>
        )}
      </div>

      {/*Modales */}
      <RegisterOvertimeModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSubmit={createOvertime}
        isSubmitting={isCreating}
        leaders={leaders}
        leaderId={user?.leaderId}
        existingRequests={dayRecordsToShow}
      />

      {isLeaderOrManager && (
        <ReviewOvertimeModal
          isOpen={reviewOpen}
          onClose={() => setReviewOpen(false)}
          records={teamRecords}
          myRecords={myRecords}
          isLoading={teamLoading}
          onReview={async (id, status, comment) =>
            reviewOvertime(id, { status, comment })
          }
          isReviewing={isReviewing}
        />
      )}
    </div>
  );
}

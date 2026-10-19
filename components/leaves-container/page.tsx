"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  X,
  Users,
  Search,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveAbsences } from "@/hooks/useActiveAbsences";
import {
  LEAVE_TYPE_META,
  type ActiveLeaveRequest,
  type LeaveType,
} from "@/types/leaves.types";

interface AbsencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const scrollbarStyles = `
  [&::-webkit-scrollbar]:w-1.5
  [&::-webkit-scrollbar]:h-1.5
  [&::-webkit-scrollbar-track]:bg-muted/20
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-muted-foreground/25
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/40
  dark:[&::-webkit-scrollbar-track]:bg-muted/15
  dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30
  dark:[&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50
  scrollbar-width:thin
  scrollbar-color:hsl(var(--muted-foreground)/0.25) transparent
`;

const TYPE_GROUPS: Record<string, LeaveType[]> = {
  VACACIONES: ["VACACIONES"],
  INCAPACIDADES: ["INCAPACIDAD_EPS", "INCAPACIDAD_ARL"],
  LICENCIAS: [
    "LICENCIA_MATERNIDAD",
    "LICENCIA_PATERNIDAD",
    "LICENCIA_LUTO",
    "LICENCIA_MATRIMONIO",
  ],
  PERMISOS: [
    "PERMISO_REMUNERADO",
    "PERMISO_NO_REMUNERADO",
    "CALAMIDAD_DOMESTICA",
    "DILIGENCIA_PERSONAL",
    "OBLIGACION_COMO_ACUDIENTE",
  ],
  CITAS_MEDICAS: [
    "CITA_MEDICA_PARTICULAR",
    "CITA_MEDICA_CON_ESPECIALISTA_EPS",
  ],
  OTRO: ["OTRO"],
};

const GROUP_LABELS: Record<string, string> = {
  VACACIONES: "Vacaciones",
  INCAPACIDADES: "Incapacidades",
  LICENCIAS: "Licencias",
  PERMISOS: "Permisos",
  CITAS_MEDICAS: "Citas médicas",
  OTRO: "Otros",
};

const getInitials = (name: string | null | undefined): string => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  const daysElapsed = Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
  const daysRemaining = totalDays - daysElapsed + 1;

  if (daysElapsed <= 1 && daysRemaining <= 1) {
    return { label: "Hoy", tone: "current" as const };
  }
  if (daysRemaining <= 1) {
    return { label: "Último día", tone: "ending" as const };
  }
  return {
    label: `${daysRemaining} días restantes`,
    tone: "current" as const,
  };
};

const ITEMS_PER_PAGE = 6;

export const AbsencesModal: React.FC<AbsencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { absences, isLoading } = useActiveAbsences();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAbsence, setSelectedAbsence] =
    useState<ActiveLeaveRequest | null>(null);

  const departments = useMemo(
    () =>
      Array.from(
        new Set(absences.map((a) => a.user.department).filter(Boolean)),
      ).sort() as string[],
    [absences],
  );

  const filteredAbsences = useMemo(() => {
    return absences.filter((absence) => {
      const matchesSearch =
        absence.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (absence.user.position ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (absence.user.department ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesGroup =
        filterGroup === "all" ||
        TYPE_GROUPS[filterGroup]?.includes(absence.type) === true;

      const matchesDepartment =
        filterDepartment === "all" ||
        absence.user.department === filterDepartment;

      return matchesSearch && matchesGroup && matchesDepartment;
    });
  }, [absences, searchTerm, filterGroup, filterDepartment]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGroup, filterDepartment]);

  const totalPages = Math.ceil(filteredAbsences.length / ITEMS_PER_PAGE);
  const paginatedAbsences = useMemo(
    () =>
      filteredAbsences.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [filteredAbsences, currentPage],
  );

  if (!isOpen) return null;

  const hasFilters =
    searchTerm || filterGroup !== "all" || filterDepartment !== "all";

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
        onClick={onClose}
      >
        <div
          className="bg-card w-full h-full sm:h-auto sm:max-h-[90vh] max-w-6xl sm:mx-4 mx-0 rounded-none sm:rounded-2xl flex flex-col shadow-2xl border-0 sm:border border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  Ausencias activas hoy
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  {isLoading
                    ? "Cargando..."
                    : `${filteredAbsences.length} persona${
                        filteredAbsences.length !== 1 ? "s" : ""
                      } ausente${filteredAbsences.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Filtros */}
          <div className="p-3 sm:p-4 border-b border-border flex-shrink-0 bg-muted/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, cargo o área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="all">Todos los tipos</option>
                  {Object.keys(TYPE_GROUPS).map((g) => (
                    <option key={g} value={g}>
                      {GROUP_LABELS[g]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="all">Todas las áreas</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterGroup("all");
                  setFilterDepartment("all");
                }}
                className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Lista */}
          <div className={cn("flex-1 overflow-y-auto p-3 sm:p-4", scrollbarStyles)}>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredAbsences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium">
                  {absences.length === 0
                    ? "Nadie está ausente hoy"
                    : "No se encontraron ausencias"}
                </p>
                <p className="text-sm text-muted-foreground text-center px-4">
                  {absences.length === 0
                    ? "Todos los colaboradores están activos 🎉"
                    : "Intenta ajustar los filtros de búsqueda"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop: tabla */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 sticky top-0 z-10">
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Empleado
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                          Departamento
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                          Área
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                          Período
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {paginatedAbsences.map((absence) => {
                        const meta = LEAVE_TYPE_META[absence.type];
                        const duration = formatDuration(
                          absence.startDate,
                          absence.endDate,
                        );
                        const initials = getInitials(absence.user.name);

                        return (
                          <tr
                            key={absence.leaveRequestId}
                            className="hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => setSelectedAbsence(absence)}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {absence.user.avatarUrl ? (
                                  <img
                                    src={absence.user.avatarUrl}
                                    alt={absence.user.name}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-background"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 ring-2 ring-background">
                                    {initials}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground truncate">
                                    {absence.user.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground hidden sm:block truncate">
                                    {absence.user.position ?? "—"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-foreground hidden md:table-cell">
                              {absence.user.department ?? "—"}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                              {absence.user.area ?? "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap",
                                  meta.accent,
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    meta.dot,
                                  )}
                                />
                                {meta.short}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-foreground text-sm hidden sm:table-cell">
                              <div className="flex flex-col">
                                <span>{formatDate(absence.startDate)}</span>
                                <span className="text-xs text-muted-foreground">
                                  al {formatDate(absence.endDate)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center hidden sm:table-cell">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap",
                                  duration.tone === "ending"
                                    ? "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400"
                                    : "text-muted-foreground bg-muted/40 border-border",
                                )}
                              >
                                {duration.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: cards */}
                <div className="md:hidden space-y-3">
                  {paginatedAbsences.map((absence) => {
                    const meta = LEAVE_TYPE_META[absence.type];
                    const duration = formatDuration(
                      absence.startDate,
                      absence.endDate,
                    );
                    const initials = getInitials(absence.user.name);

                    return (
                      <button
                        key={absence.leaveRequestId}
                        onClick={() => setSelectedAbsence(absence)}
                        className="w-full text-left bg-card border border-border/50 rounded-xl p-3 hover:border-primary/40 hover:bg-muted/20 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          {absence.user.avatarUrl ? (
                            <img
                              src={absence.user.avatarUrl}
                              alt={absence.user.name}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-background"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 ring-2 ring-background">
                              {initials}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {absence.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {absence.user.position ?? "—"}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium",
                                  meta.accent,
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    meta.dot,
                                  )}
                                />
                                {meta.short}
                              </span>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium",
                                  duration.tone === "ending"
                                    ? "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400"
                                    : "text-muted-foreground bg-muted/40 border-border",
                                )}
                              >
                                {duration.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1.5">
                              {formatDate(absence.startDate)} —{" "}
                              {formatDate(absence.endDate)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Paginador */}
          {!isLoading && filteredAbsences.length > 0 && (
            <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-t border-border flex-shrink-0 bg-muted/5">
              <div className="text-xs sm:text-sm text-muted-foreground">
                <span className="hidden sm:inline">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredAbsences.length,
                  )}{" "}
                  de {filteredAbsences.length}
                </span>
                <span className="sm:hidden">
                  {currentPage} / {totalPages || 1}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors",
                    currentPage === 1
                      ? "text-muted-foreground cursor-not-allowed opacity-50"
                      : "text-foreground hover:bg-muted/50",
                  )}
                >
                  Anterior
                </button>

                {/* Páginas — solo desktop */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-sm transition-colors",
                          currentPage === pageNum
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted/50",
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={cn(
                    "px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors",
                    currentPage === totalPages || totalPages === 0
                      ? "text-muted-foreground cursor-not-allowed opacity-50"
                      : "text-foreground hover:bg-muted/50",
                  )}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedAbsence && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedAbsence(null)}
        >
          <div
            className="bg-card rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-border/50 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Detalle de ausencia
              </h3>
              <button
                onClick={() => setSelectedAbsence(null)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                {selectedAbsence.user.avatarUrl ? (
                  <img
                    src={selectedAbsence.user.avatarUrl}
                    alt={selectedAbsence.user.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-background"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm ring-2 ring-background">
                    {getInitials(selectedAbsence.user.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {selectedAbsence.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedAbsence.user.position ?? "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Departamento</p>
                  <p className="text-foreground font-medium">
                    {selectedAbsence.user.department ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Área</p>
                  <p className="text-foreground font-medium">
                    {selectedAbsence.user.area ?? "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium",
                        LEAVE_TYPE_META[selectedAbsence.type].accent,
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          LEAVE_TYPE_META[selectedAbsence.type].dot,
                        )}
                      />
                      {LEAVE_TYPE_META[selectedAbsence.type].label}
                    </span>
                    {selectedAbsence.esCompensada && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                        Compensada
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Período</p>
                  <p className="text-foreground font-medium">
                    {formatDate(selectedAbsence.startDate)} —{" "}
                    {formatDate(selectedAbsence.endDate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedAbsence.isPartialDay &&
                    selectedAbsence.startTime &&
                    selectedAbsence.endTime
                      ? `${selectedAbsence.startTime} - ${selectedAbsence.endTime} (${selectedAbsence.totalHours}h)`
                      : `${selectedAbsence.businessDays} día${
                          selectedAbsence.businessDays !== 1 ? "s" : ""
                        } hábil${selectedAbsence.businessDays !== 1 ? "es" : ""}`}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAbsence(null)}
              className="w-full mt-6 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
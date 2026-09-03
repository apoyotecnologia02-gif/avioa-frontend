import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Search,
  Calendar as CalendarIcon,
  Cake,
  Heart,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Absence {
  id: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  area: string;
  position: string;
  type: 'vacation' | 'sick' | 'license' | 'personal' | 'other';
  startDate: string;
  endDate: string;
  duration: number;
  status: 'approved' | 'pending' | 'rejected';
  reason?: string;
}

interface AbsencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockAbsences: Absence[] = [
  {
    id: '1',
    employeeName: 'María González',
    employeeAvatar: 'MG',
    department: 'Marketing',
    area: 'Marketing Digital',
    position: 'Gerente de Marketing',
    type: 'vacation',
    startDate: '2026-08-25',
    endDate: '2026-09-05',
    duration: 12,
    status: 'approved',
    reason: 'Vacaciones anuales'
  },
  {
    id: '2',
    employeeName: 'Carlos Rodríguez',
    employeeAvatar: 'CR',
    department: 'Tecnología',
    area: 'Desarrollo',
    position: 'Desarrollador Senior',
    type: 'sick',
    startDate: '2026-08-20',
    endDate: '2026-08-22',
    duration: 3,
    status: 'approved',
    reason: 'Incapacidad médica'
  },
  {
    id: '3',
    employeeName: 'Ana Martínez',
    employeeAvatar: 'AM',
    department: 'Diseño',
    area: 'UX/UI',
    position: 'Diseñadora UX/UI',
    type: 'license',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    duration: 30,
    status: 'pending',
    reason: 'Licencia de maternidad'
  },
  {
    id: '4',
    employeeName: 'Pedro Ramírez',
    employeeAvatar: 'PR',
    department: 'Analítica',
    area: 'Datos',
    position: 'Analista de Datos',
    type: 'personal',
    startDate: '2026-08-28',
    endDate: '2026-08-28',
    duration: 1,
    status: 'approved',
    reason: 'Asuntos personales'
  },
  {
    id: '5',
    employeeName: 'Laura Fernández',
    employeeAvatar: 'LF',
    department: 'Recursos Humanos',
    area: 'Gestión',
    position: 'Gerente de RRHH',
    type: 'vacation',
    startDate: '2026-09-10',
    endDate: '2026-09-20',
    duration: 11,
    status: 'pending',
    reason: 'Vacaciones'
  },
  {
    id: '6',
    employeeName: 'Roberto Méndez',
    employeeAvatar: 'RM',
    department: 'Tecnología',
    area: 'Ingeniería',
    position: 'Ingeniero de Software',
    type: 'sick',
    startDate: '2026-08-19',
    endDate: '2026-08-21',
    duration: 3,
    status: 'rejected',
    reason: 'Incapacidad no justificada'
  },
  {
    id: '7',
    employeeName: 'Sofía Torres',
    employeeAvatar: 'ST',
    department: 'Marketing',
    area: 'Contenido',
    position: 'Especialista en Contenido',
    type: 'license',
    startDate: '2026-08-15',
    endDate: '2026-09-15',
    duration: 32,
    status: 'approved',
    reason: 'Licencia de estudios'
  },
  {
    id: '8',
    employeeName: 'Diego Silva',
    employeeAvatar: 'DS',
    department: 'Ventas',
    area: 'Comercial',
    position: 'Ejecutivo de Ventas',
    type: 'personal',
    startDate: '2026-08-27',
    endDate: '2026-08-28',
    duration: 2,
    status: 'approved',
    reason: 'Trámites personales'
  },
  {
    id: '9',
    employeeName: 'Elena Vargas',
    employeeAvatar: 'EV',
    department: 'Tecnología',
    area: 'DevOps',
    position: 'Ingeniero DevOps',
    type: 'vacation',
    startDate: '2026-09-05',
    endDate: '2026-09-12',
    duration: 8,
    status: 'pending',
    reason: 'Vacaciones'
  },
  {
    id: '10',
    employeeName: 'Jorge Castillo',
    employeeAvatar: 'JC',
    department: 'Finanzas',
    area: 'Contabilidad',
    position: 'Contador',
    type: 'sick',
    startDate: '2026-08-22',
    endDate: '2026-08-24',
    duration: 3,
    status: 'approved',
    reason: 'Problemas de salud'
  },
];

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

export const AbsencesModal: React.FC<AbsencesModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const itemsPerPage = 6;

  const uniqueAreas = Array.from(new Set(mockAbsences.map(a => a.area))).sort();

  const filteredAbsences = mockAbsences.filter(absence => {
    const matchesSearch = absence.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          absence.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          absence.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || absence.type === filterType;
    const matchesArea = filterArea === 'all' || absence.area === filterArea;
    const matchesStatus = filterStatus === 'all' || absence.status === filterStatus;
    
    const matchesDate = (!startDate || absence.startDate >= startDate) &&
                        (!endDate || absence.endDate <= endDate);

    return matchesSearch && matchesType && matchesArea && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredAbsences.length / itemsPerPage);
  const paginatedAbsences = filteredAbsences.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterArea, filterStatus, startDate, endDate]);

  const getTypeIcon = (type: Absence['type']) => {
    switch(type) {
      case 'vacation': return <Cake className="w-4 h-4 text-blue-500" />;
      case 'sick': return <Heart className="w-4 h-4 text-blue-500" />;
      case 'license': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'personal': return <Users className="w-4 h-4 text-blue-500" />;
      default: return <CalendarIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: Absence['type']) => {
    switch(type) {
      case 'vacation': return 'Vacaciones';
      case 'sick': return 'Incapacidad';
      case 'license': return 'Licencia';
      case 'personal': return 'Personal';
      default: return 'Otro';
    }
  };

  const getStatusColor = (status: Absence['status']) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: Absence['status']) => {
    switch(status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return '';
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-card rounded-2xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col shadow-2xl border border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Ausencias del Personal
                </h2>
                <p className="text-xs text-muted-foreground">
                  {filteredAbsences.length} ausencia{filteredAbsences.length !== 1 ? 's' : ''} encontrada{filteredAbsences.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <div className="p-4 border-b border-border flex-shrink-0 bg-muted/10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <div className="relative col-span-1 lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="vacation">Vacaciones</option>
                  <option value="sick">Incapacidades</option>
                  <option value="license">Licencias</option>
                  <option value="personal">Personales</option>
                  <option value="other">Otros</option>
                </select>
              </div>

              <div>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="all">Todas las áreas</option>
                  {uniqueAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              

              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  placeholder="Desde"
                />
              </div>

              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  placeholder="Hasta"
                />
              </div>
            </div>

            {(searchTerm || filterType !== 'all' || filterArea !== 'all' || filterStatus !== 'all' || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterArea('all');
                  setFilterStatus('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="overflow-x-auto">
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
                      Duración
                    </th>
                   
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paginatedAbsences.length > 0 ? (
                    paginatedAbsences.map((absence) => (
                      <tr
                        key={absence.id}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedAbsence(absence)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 ring-2 ring-background">
                              {absence.employeeAvatar}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {absence.employeeName}
                              </p>
                              <p className="text-xs text-muted-foreground hidden sm:block">
                                {absence.position}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground hidden md:table-cell">
                          {absence.department}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                          {absence.area}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(absence.type)}
                            <span className="text-foreground text-sm">
                              {getTypeLabel(absence.type)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground text-sm hidden sm:table-cell">
                          <div className="flex flex-col">
                            <span>{formatDate(absence.startDate)}</span>
                            <span className="text-xs text-muted-foreground">
                              al {formatDate(absence.endDate)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-foreground text-sm hidden sm:table-cell">
                          <span className="font-semibold">{absence.duration}</span>
                          <span className="text-xs text-muted-foreground ml-1">días</span>
                        </td>
                       
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                            <Users className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-foreground font-medium">
                            No se encontraron ausencias
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Intenta ajustar los filtros de búsqueda
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-shrink-0 bg-muted/5">
            <div className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAbsences.length)} de {filteredAbsences.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  currentPage === 1
                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                    : "text-foreground hover:bg-muted/50"
                )}
              >
                Anterior
              </button>
              <div className="flex items-center gap-1">
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
                          : "text-foreground hover:bg-muted/50"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  currentPage === totalPages || totalPages === 0
                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                    : "text-foreground hover:bg-muted/50"
                )}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedAbsence && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedAbsence(null)}
        >
          <div
            className="bg-card rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl border border-border/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Detalle de Ausencia
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ring-2 ring-background">
                  {selectedAbsence.employeeAvatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedAbsence.employeeName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAbsence.position}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Departamento</p>
                  <p className="text-foreground font-medium">{selectedAbsence.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Área</p>
                  <p className="text-foreground font-medium">{selectedAbsence.area}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <div className="flex items-center gap-1.5">
                    {getTypeIcon(selectedAbsence.type)}
                    <span className="text-foreground font-medium">
                      {getTypeLabel(selectedAbsence.type)}
                    </span>
                  </div>
                </div>
                <div>
                  
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Período</p>
                  <p className="text-foreground font-medium">
                    {formatDate(selectedAbsence.startDate)} - {formatDate(selectedAbsence.endDate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Duración: {selectedAbsence.duration} días
                  </p>
                </div>
                {selectedAbsence.reason && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Motivo</p>
                    <p className="text-foreground text-sm bg-muted/20 p-2 rounded-lg mt-0.5">
                      {selectedAbsence.reason}
                    </p>
                  </div>
                )}
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
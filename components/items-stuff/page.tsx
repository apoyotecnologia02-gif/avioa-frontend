"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Laptop,
  Smartphone,
  Keyboard,
  Mouse,
  Headphones,
  Fan,
  Monitor,
  Printer,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  Eye,
  Trash2,
  Download,
  MessageSquare,
  X,
  Cloud,
  Shield,
  Package,
  Building2,
  Users,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Check,
  Loader2,
  Filter as FilterIcon,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TIPOS =====

interface EquipmentRequest {
  id: string;
  requester: {
    id: string;
    name: string;
    avatar: string;
    department: string;
    position: string;
    email: string;
  };
  equipment: {
    id: string;
    name: string;
    type: "laptop" | "phone" | "keyboard" | "mouse" | "headphones" | "cooler" | "monitor" | "printer" | "other";
    brand?: string;
    model?: string;
    quantity: number;
  };
  requestDate: string;
  urgency: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "delivered" | "in_progress";
  justification: string;
  observations?: string;
  deliveryDate?: string;
  assignedBy?: {
    id: string;
    name: string;
    avatar: string;
  };
  attachments?: string[];
  history: {
    date: string;
    action: string;
    user: string;
    comment?: string;
  }[];
}

// ===== DATOS DE EJEMPLO =====

const mockRequests: EquipmentRequest[] = [
  {
    id: "r1",
    requester: {
      id: "u1",
      name: "María González",
      avatar: "MG",
      department: "Desarrollo",
      position: "Desarrolladora Senior",
      email: "maria.g@empresa.com",
    },
    equipment: {
      id: "e1",
      name: "MacBook Pro 16\" M3",
      type: "laptop",
      brand: "Apple",
      model: "M3 Pro",
      quantity: 1,
    },
    requestDate: "2026-01-15",
    urgency: "high",
    status: "approved",
    justification: "Necesito una laptop más potente para desarrollo con múltiples contenedores Docker y compilaciones pesadas.",
    observations: "Se asignará con prioridad, equipo disponible en bodega.",
    deliveryDate: "2026-01-20",
    assignedBy: {
      id: "u2",
      name: "Carlos Rodríguez",
      avatar: "CR",
    },
    history: [
      {
        date: "2026-01-15",
        action: "Solicitud creada",
        user: "María González",
      },
      {
        date: "2026-01-16",
        action: "Aprobada",
        user: "Carlos Rodríguez",
        comment: "Aprobado por necesidad del proyecto",
      },
      {
        date: "2026-01-20",
        action: "Entregada",
        user: "Carlos Rodríguez",
        comment: "Equipo entregado a María",
      },
    ],
  },
  {
    id: "r2",
    requester: {
      id: "u3",
      name: "Laura Fernández",
      avatar: "LF",
      department: "Diseño",
      position: "Diseñadora UX/UI",
      email: "laura.f@empresa.com",
    },
    equipment: {
      id: "e2",
      name: "Monitor 4K 27\"",
      type: "monitor",
      brand: "Dell",
      model: "U2723QE",
      quantity: 2,
    },
    requestDate: "2026-01-12",
    urgency: "medium",
    status: "in_progress",
    justification: "Necesito monitores adicionales para mejorar el flujo de trabajo en diseño y prototipado.",
    observations: "Se está revisando disponibilidad en bodega.",
    assignedBy: {
      id: "u4",
      name: "Pedro Ramírez",
      avatar: "PR",
    },
    history: [
      {
        date: "2026-01-12",
        action: "Solicitud creada",
        user: "Laura Fernández",
      },
      {
        date: "2026-01-13",
        action: "En revisión",
        user: "Pedro Ramírez",
        comment: "Verificando stock disponible",
      },
    ],
  },
  {
    id: "r3",
    requester: {
      id: "u5",
      name: "Ana Martínez",
      avatar: "AM",
      department: "QA",
      position: "Ingeniera de Calidad",
      email: "ana.m@empresa.com",
    },
    equipment: {
      id: "e3",
      name: "iPad Pro 12.9\"",
      type: "phone",
      brand: "Apple",
      model: "iPad Pro M2",
      quantity: 1,
    },
    requestDate: "2026-01-10",
    urgency: "low",
    status: "pending",
    justification: "Para pruebas de aplicación en dispositivos iOS, necesito un iPad para testing.",
    history: [
      {
        date: "2026-01-10",
        action: "Solicitud creada",
        user: "Ana Martínez",
      },
    ],
  },
  {
    id: "r4",
    requester: {
      id: "u6",
      name: "Roberto Méndez",
      avatar: "RM",
      department: "Soporte",
      position: "Técnico de Soporte",
      email: "roberto.m@empresa.com",
    },
    equipment: {
      id: "e4",
      name: "Teclado Mecánico",
      type: "keyboard",
      brand: "Logitech",
      model: "MX Mechanical",
      quantity: 3,
    },
    requestDate: "2026-01-08",
    urgency: "medium",
    status: "rejected",
    justification: "Renovación de teclados para el equipo de soporte.",
    observations: "Presupuesto agotado para este mes. Reintentar en febrero.",
    assignedBy: {
      id: "u7",
      name: "Sofía Torres",
      avatar: "ST",
    },
    history: [
      {
        date: "2026-01-08",
        action: "Solicitud creada",
        user: "Roberto Méndez",
      },
      {
        date: "2026-01-09",
        action: "Rechazada",
        user: "Sofía Torres",
        comment: "Sin presupuesto disponible para este mes",
      },
    ],
  },
  {
    id: "r5",
    requester: {
      id: "u8",
      name: "Javier Pérez",
      avatar: "JP",
      department: "Marketing",
      position: "Especialista en Marketing",
      email: "javier.p@empresa.com",
    },
    equipment: {
      id: "e5",
      name: "Audífonos Sony WH-1000XM5",
      type: "headphones",
      brand: "Sony",
      model: "WH-1000XM5",
      quantity: 1,
    },
    requestDate: "2026-01-05",
    urgency: "critical",
    status: "delivered",
    justification: "Necesito audífonos con cancelación de ruido para edición de audio y reuniones.",
    observations: "Equipo entregado. Excelente calidad.",
    deliveryDate: "2026-01-06",
    assignedBy: {
      id: "u2",
      name: "Carlos Rodríguez",
      avatar: "CR",
    },
    history: [
      {
        date: "2026-01-05",
        action: "Solicitud creada",
        user: "Javier Pérez",
      },
      {
        date: "2026-01-05",
        action: "Aprobada urgentemente",
        user: "Carlos Rodríguez",
        comment: "Urgente, aprobación inmediata",
      },
      {
        date: "2026-01-06",
        action: "Entregada",
        user: "Carlos Rodríguez",
        comment: "Audífonos entregados",
      },
    ],
  },
  {
    id: "r6",
    requester: {
      id: "u9",
      name: "Sofía Torres",
      avatar: "ST",
      department: "Recursos Humanos",
      position: "Coordinadora de RH",
      email: "sofia.t@empresa.com",
    },
    equipment: {
      id: "e6",
      name: "Base Refrigerante",
      type: "cooler",
      brand: "Cooler Master",
      model: "Notepal U3 Plus",
      quantity: 2,
    },
    requestDate: "2026-01-02",
    urgency: "low",
    status: "pending",
    justification: "Las bases refrigerantes actuales están fallando. Necesitamos reemplazo.",
    history: [
      {
        date: "2026-01-02",
        action: "Solicitud creada",
        user: "Sofía Torres",
      },
    ],
  },
  {
    id: "r7",
    requester: {
      id: "u10",
      name: "Luis Rodríguez",
      avatar: "LR",
      department: "Finanzas",
      position: "Analista Financiero",
      email: "luis.r@empresa.com",
    },
    equipment: {
      id: "e7",
      name: "Mouse Logitech MX Master 3S",
      type: "mouse",
      brand: "Logitech",
      model: "MX Master 3S",
      quantity: 1,
    },
    requestDate: "2025-12-28",
    urgency: "medium",
    status: "in_progress",
    justification: "Mi mouse actual está fallando y afecta mi productividad.",
    observations: "Se está procesando la compra.",
    assignedBy: {
      id: "u4",
      name: "Pedro Ramírez",
      avatar: "PR",
    },
    history: [
      {
        date: "2025-12-28",
        action: "Solicitud creada",
        user: "Luis Rodríguez",
      },
      {
        date: "2025-12-29",
        action: "En proceso de compra",
        user: "Pedro Ramírez",
        comment: "Realizando cotización",
      },
    ],
  },
  {
    id: "r8",
    requester: {
      id: "u11",
      name: "Elena Vargas",
      avatar: "EV",
      department: "Desarrollo",
      position: "Desarrolladora Frontend",
      email: "elena.v@empresa.com",
    },
    equipment: {
      id: "e8",
      name: "iPhone 15 Pro Max",
      type: "phone",
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      quantity: 1,
    },
    requestDate: "2025-12-20",
    urgency: "high",
    status: "approved",
    justification: "Para pruebas de desarrollo móvil y debugging en iOS.",
    observations: "Equipo reservado, pendiente de entrega.",
    deliveryDate: "2025-12-28",
    assignedBy: {
      id: "u2",
      name: "Carlos Rodríguez",
      avatar: "CR",
    },
    history: [
      {
        date: "2025-12-20",
        action: "Solicitud creada",
        user: "Elena Vargas",
      },
      {
        date: "2025-12-22",
        action: "Aprobada",
        user: "Carlos Rodríguez",
      },
      {
        date: "2025-12-28",
        action: "Entregada",
        user: "Carlos Rodríguez",
        comment: "iPhone entregado para desarrollo",
      },
    ],
  },
];

// ===== FUNCIONES UTILITARIAS =====

const getEquipmentIcon = (type: EquipmentRequest["equipment"]["type"]) => {
  switch (type) {
    case "laptop":
      return Laptop;
    case "phone":
      return Smartphone;
    case "keyboard":
      return Keyboard;
    case "mouse":
      return Mouse;
    case "headphones":
      return Headphones;
    case "cooler":
      return Fan;
    case "monitor":
      return Monitor;
    case "printer":
      return Printer;
    default:
      return Package;
  }
};

// TODOS los colores usan text-primary (azul #0578C8)
const getUrgencyColor = (urgency: EquipmentRequest["urgency"]) => {
  return "bg-primary/10 text-primary border-primary/20";
};

const getUrgencyLabel = (urgency: EquipmentRequest["urgency"]) => {
  switch (urgency) {
    case "critical":
      return "Crítica";
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    case "low":
      return "Baja";
    default:
      return "Desconocida";
  }
};

// TODOS los colores usan text-primary (azul #0578C8)
const getStatusColor = (status: EquipmentRequest["status"]) => {
  return "bg-primary/10 text-primary border-primary/20";
};

const getStatusLabel = (status: EquipmentRequest["status"]) => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "approved":
      return "Aprobada";
    case "rejected":
      return "Rechazada";
    case "delivered":
      return "Entregada";
    case "in_progress":
      return "En Proceso";
    default:
      return "Desconocido";
  }
};

const getStatusIcon = (status: EquipmentRequest["status"]) => {
  switch (status) {
    case "pending":
      return ClockIcon;
    case "approved":
      return CheckCircle;
    case "rejected":
      return XCircle;
    case "delivered":
      return Check;
    case "in_progress":
      return Loader2;
    default:
      return AlertCircle;
  }
};

// ===== SCROLLBAR STYLES =====

const scrollbarClasses = `
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

// ===== COMPONENTE PRINCIPAL =====

export const EquipmentRequestManagement: React.FC = () => {
  const [requests, setRequests] = useState<EquipmentRequest[]>(mockRequests);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EquipmentRequest["status"] | "all">("all");
  const [urgencyFilter, setUrgencyFilter] = useState<EquipmentRequest["urgency"] | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "urgency" | "status" | "requester">("date");
  const itemsPerPage = 6;

  // ===== FILTRAR Y ORDENAR =====

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch = 
        req.requester.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.equipment.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requester.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.justification.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      const matchesUrgency = urgencyFilter === "all" || req.urgency === urgencyFilter;

      return matchesSearch && matchesStatus && matchesUrgency;
    });
  }, [requests, searchQuery, statusFilter, urgencyFilter]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
        case "urgency": {
          const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        case "status": {
          const statusOrder = { pending: 0, approved: 1, in_progress: 2, delivered: 3, rejected: 4 };
          return statusOrder[a.status] - statusOrder[b.status];
        }
        case "requester":
          return a.requester.name.localeCompare(b.requester.name);
        default:
          return 0;
      }
    });
  }, [filteredRequests, sortBy]);

  // ===== PAGINACIÓN =====

  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedRequests.slice(start, end);
  }, [sortedRequests, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // ===== HANDLERS =====

  const handleSelectRequest = (id: string) => {
    setSelectedRequests(prev =>
      prev.includes(id)
        ? prev.filter(reqId => reqId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === paginatedRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(paginatedRequests.map(r => r.id));
    }
  };

  const handleStatusChange = (id: string, newStatus: EquipmentRequest["status"]) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === id
          ? {
              ...req,
              status: newStatus,
              history: [
                ...req.history,
                {
                  date: new Date().toISOString().split('T')[0],
                  action: `Estado cambiado a ${getStatusLabel(newStatus)}`,
                  user: "Usuario Actual",
                },
              ],
            }
          : req
      )
    );
  };

  const handleDeleteRequest = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    setSelectedRequests(prev => prev.filter(reqId => reqId !== id));
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
    delivered: requests.filter(r => r.status === "delivered").length,
    inProgress: requests.filter(r => r.status === "in_progress").length,
  };

  // ===== RENDERIZAR SOLICITUD EN GRID =====

  const renderGridItem = (request: EquipmentRequest) => {
    const Icon = getEquipmentIcon(request.equipment.type);
    const StatusIcon = getStatusIcon(request.status);
    const isSelected = selectedRequests.includes(request.id);

    return (
      <div
        key={request.id}
        className={cn(
          "group bg-card rounded-xl p-4 border transition-all hover:shadow-md cursor-pointer relative",
          isSelected
            ? "border-primary ring-2 ring-primary/20 bg-primary/5"
            : "border-border/50 hover:border-border/80 hover:bg-muted/10"
        )}
        onClick={() => handleSelectRequest(request.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground line-clamp-1">
                {request.equipment.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                {request.equipment.brand || "Sin marca"} · {request.equipment.quantity} unidad{request.equipment.quantity !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setShowDetailsModal(request.id); }}
              className="p-1 rounded-full hover:bg-muted/50 transition-colors"
            >
              <Eye className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteRequest(request.id); }}
              className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full border",
            getStatusColor(request.status)
          )}>
            <StatusIcon className="w-3 h-3 inline mr-1" />
            {getStatusLabel(request.status)}
          </span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full border",
            getUrgencyColor(request.urgency)
          )}>
            {getUrgencyLabel(request.urgency)}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(request.requestDate).toLocaleDateString('es-ES')}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/50 pt-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-[8px] flex-shrink-0">
            {request.requester.avatar}
          </div>
          <span className="truncate">{request.requester.name}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
          <span className="truncate">{request.requester.department}</span>
        </div>
      </div>
    );
  };

  // ===== RENDERIZAR SOLICITUD EN LISTA =====

  const renderListItem = (request: EquipmentRequest) => {
    const Icon = getEquipmentIcon(request.equipment.type);
    const StatusIcon = getStatusIcon(request.status);
    const isSelected = selectedRequests.includes(request.id);

    return (
      <div
        key={request.id}
        className={cn(
          "group flex items-center gap-4 p-3 border-b border-border/50 hover:bg-muted/10 transition-all cursor-pointer",
          isSelected && "bg-primary/5"
        )}
        onClick={() => handleSelectRequest(request.id)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-medium text-foreground truncate">
                {request.equipment.name}
              </h4>
              <span className="text-xs text-muted-foreground">
                {request.equipment.brand || "Sin marca"}
              </span>
              <span className="text-xs text-muted-foreground">
                x{request.equipment.quantity}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{request.requester.name}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
              <span>{request.requester.department}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
              <span>{new Date(request.requestDate).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full border",
            getUrgencyColor(request.urgency)
          )}>
            {getUrgencyLabel(request.urgency)}
          </span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full border whitespace-nowrap",
            getStatusColor(request.status)
          )}>
            <StatusIcon className="w-3 h-3 inline mr-1" />
            {getStatusLabel(request.status)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowDetailsModal(request.id); }}
            className="p-1 rounded-full hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Eye className="w-4 h-4 text-primary" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteRequest(request.id); }}
            className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    );
  };

  // ===== MODAL DE DETALLES =====

  const DetailsModal: React.FC<{ requestId: string; onClose: () => void }> = ({ requestId, onClose }) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return null;

    const Icon = getEquipmentIcon(request.equipment.type);
    const StatusIcon = getStatusIcon(request.status);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-card rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] shadow-2xl border border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={cn("overflow-y-auto max-h-[90vh]", scrollbarClasses)}>
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {request.equipment.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {request.equipment.brand || "Sin marca"} · {request.equipment.model || "Modelo no especificado"}
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

            <div className="p-6 space-y-6">
              {/* Estado y urgencia */}
              <div className="flex flex-wrap gap-3">
                <span className={cn(
                  "text-sm px-3 py-1 rounded-full border",
                  getStatusColor(request.status)
                )}>
                  <StatusIcon className="w-4 h-4 inline mr-1.5" />
                  {getStatusLabel(request.status)}
                </span>
                <span className={cn(
                  "text-sm px-3 py-1 rounded-full border",
                  getUrgencyColor(request.urgency)
                )}>
                  Urgencia: {getUrgencyLabel(request.urgency)}
                </span>
                <span className="text-sm text-muted-foreground px-3 py-1">
                  Cantidad: {request.equipment.quantity}
                </span>
              </div>

              {/* Información del solicitante */}
              <div className="bg-muted/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Solicitante
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-sm">
                    {request.requester.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {request.requester.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.requester.position} · {request.requester.department}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.requester.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Justificación */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Justificación
                </h3>
                <p className="text-sm text-foreground bg-muted/10 rounded-lg p-3 border border-border/30">
                  {request.justification}
                </p>
                {request.observations && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground font-medium">Observaciones:</p>
                    <p className="text-sm text-foreground bg-muted/5 rounded-lg p-3 border border-border/20">
                      {request.observations}
                    </p>
                  </div>
                )}
              </div>

              {/* Historial */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Historial
                </h3>
                <div className="space-y-2">
                  {request.history.map((event, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{event.action}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {event.user}
                          {event.comment && ` · ${event.comment}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información de entrega */}
              {request.deliveryDate && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="font-medium">Fecha de entrega:</span>
                    {new Date(request.deliveryDate).toLocaleDateString('es-ES')}
                  </p>
                  {request.assignedBy && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Entregado por: {request.assignedBy.name}
                    </p>
                  )}
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                <select
                  value={request.status}
                  onChange={(e) => {
                    handleStatusChange(request.id, e.target.value as EquipmentRequest["status"]);
                  }}
                  className="px-3 py-1.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobar</option>
                  <option value="in_progress">En Proceso</option>
                  <option value="delivered">Entregar</option>
                  <option value="rejected">Rechazar</option>
                </select>
                <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Download className="w-4 h-4 inline mr-1" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===== MODAL DE CREACIÓN =====

  const CreateRequestModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
      equipmentName: "",
      equipmentType: "laptop" as EquipmentRequest["equipment"]["type"],
      brand: "",
      model: "",
      quantity: 1,
      justification: "",
      urgency: "medium" as EquipmentRequest["urgency"],
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
      const newRequest: EquipmentRequest = {
        id: `r${Date.now()}`,
        requester: {
          id: "u1",
          name: "Usuario Actual",
          avatar: "UA",
          department: "General",
          position: "Empleado",
          email: "usuario@empresa.com",
        },
        equipment: {
          id: `e${Date.now()}`,
          name: formData.equipmentName,
          type: formData.equipmentType,
          brand: formData.brand || undefined,
          model: formData.model || undefined,
          quantity: formData.quantity,
        },
        requestDate: new Date().toISOString().split('T')[0],
        urgency: formData.urgency,
        status: "pending",
        justification: formData.justification,
        history: [
          {
            date: new Date().toISOString().split('T')[0],
            action: "Solicitud creada",
            user: "Usuario Actual",
          },
        ],
      };

      setRequests(prev => [newRequest, ...prev]);
      onClose();
    };

    const equipmentTypes = [
      { value: "laptop", label: "Laptop", icon: Laptop },
      { value: "phone", label: "Teléfono", icon: Smartphone },
      { value: "keyboard", label: "Teclado", icon: Keyboard },
      { value: "mouse", label: "Ratón", icon: Mouse },
      { value: "headphones", label: "Audífonos", icon: Headphones },
      { value: "cooler", label: "Base Refrigerante", icon: Fan },
      { value: "monitor", label: "Monitor", icon: Monitor },
      { value: "printer", label: "Impresora", icon: Printer },
      { value: "other", label: "Otro", icon: Package },
    ];

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-card rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] shadow-2xl border border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={cn("overflow-y-auto max-h-[90vh]", scrollbarClasses)}>
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card/95 backdrop-blur-sm z-10">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Nueva Solicitud
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Tipo de Equipo</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {equipmentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, equipmentType: type.value as any })}
                        className={cn(
                          "p-2 rounded-lg border text-sm transition-all flex items-center gap-2 justify-center",
                          formData.equipmentType === type.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 hover:border-border/80 hover:bg-muted/10 text-muted-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-xs">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nombre del Equipo</label>
                  <input
                    type="text"
                    value={formData.equipmentName}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    
                    className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Marca</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ej: Apple, Dell, Logitech"
                    className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Modelo</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ej: M3 Pro, U2723QE"
                    className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Urgencia</label>
                <div className="flex gap-2 mt-1">
                  {(["low", "medium", "high", "critical"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, urgency: level })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        formData.urgency === level
                          ? "border border-primary bg-primary/10 text-primary"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {getUrgencyLabel(level)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Justificación</label>
                <textarea
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder="Describe por qué necesitas este equipo..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/50">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-input rounded-lg text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.equipmentName || !formData.justification}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    formData.equipmentName && formData.justification
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Enviar Solicitud
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===== RENDER =====

  return (
    <div className="w-full h-[calc(100vh-120px)] overflow-hidden bg-muted/20 p-4">
      <div className="h-full max-w-7xl mx-auto">
        <div className="h-full bg-card/30 rounded-2xl p-4 backdrop-blur-sm border border-border/50 flex flex-col shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 flex-1 min-h-0">
            {/* Barra lateral */}
            <aside className="h-full overflow-hidden">
              <div className="bg-card rounded-xl shadow-sm p-5 h-full flex flex-col border border-border/50 hover:border-border/80 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Solicitudes
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Estadísticas - TODOS los números en text-primary */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between items-center text-sm p-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold text-primary">{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-primary flex items-center gap-1.5">
                      <ClockIcon className="w-3.5 h-3.5" /> Pendientes
                    </span>
                    <span className="font-semibold text-primary">{stats.pending}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-primary flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5" /> En Proceso
                    </span>
                    <span className="font-semibold text-primary">{stats.inProgress}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-primary flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Entregadas
                    </span>
                    <span className="font-semibold text-primary">{stats.delivered}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-primary flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Rechazadas
                    </span>
                    <span className="font-semibold text-primary">{stats.rejected}</span>
                  </div>
                </div>

                {/* Filtros */}
                <div className="border-t border-border/50 pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Filtrar por Estado
                  </p>
                  <div className="space-y-1">
                    {(["all", "pending", "approved", "in_progress", "delivered", "rejected"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors",
                          statusFilter === status
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        )}
                      >
                        {status === "all" ? "Todos" : getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 mt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Filtrar por Urgencia
                  </p>
                  <div className="space-y-1">
                    {(["all", "critical", "high", "medium", "low"] as const).map((urgency) => (
                      <button
                        key={urgency}
                        onClick={() => { setUrgencyFilter(urgency); setCurrentPage(1); }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors",
                          urgencyFilter === urgency
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        )}
                      >
                        {urgency === "all" ? "Todas" : getUrgencyLabel(urgency)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border/50">
                  <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-lg p-3 border-l-4 border-primary">
                    <p className="text-xs text-foreground flex items-start gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Todas las solicitudes están registradas y tienen seguimiento</span>
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Panel principal */}
            <main className="h-full flex flex-col min-h-0">
              {/* Barra de herramientas */}
              <div className="flex flex-wrap items-center gap-2 mb-4 flex-shrink-0">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="text"
                    placeholder="Buscar solicitudes..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === "grid"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    )}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === "list"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="date">Fecha</option>
                  <option value="urgency">Urgencia</option>
                  <option value="status">Estado</option>
                  <option value="requester">Solicitante</option>
                </select>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nueva</span>
                </button>
              </div>

              {/* Selección masiva */}
              {selectedRequests.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-lg mb-3 flex-shrink-0">
                  <span className="text-sm text-foreground">
                    {selectedRequests.length} solicitud{selectedRequests.length !== 1 ? 'es' : ''} seleccionada{selectedRequests.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setSelectedRequests([])}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex-1"></div>
                  <button className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors text-primary">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Lista de solicitudes */}
              <div className={cn("flex-1 overflow-y-auto rounded-xl", scrollbarClasses)}>
                {paginatedRequests.length > 0 ? (
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-1">
                      {paginatedRequests.map(renderGridItem)}
                    </div>
                  ) : (
                    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                      <div 
                        className="flex items-center px-3 py-2 bg-muted/20 border-b border-border/50 text-xs text-muted-foreground font-medium cursor-pointer"
                        onClick={handleSelectAll}
                      >
                        <div className="flex-1">Equipo / Solicitante</div>
                        <div className="flex items-center gap-4">
                          <span className="w-20 text-center">Urgencia</span>
                          <span className="w-28 text-center">Estado</span>
                          <span className="w-20 text-center">Acciones</span>
                        </div>
                      </div>
                      {paginatedRequests.map(renderListItem)}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Package className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No hay solicitudes</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      {searchQuery || statusFilter !== "all" || urgencyFilter !== "all"
                        ? "No se encontraron solicitudes con esos filtros"
                        : "Crea tu primera solicitud de equipo para comenzar"}
                    </p>
                    {!searchQuery && statusFilter === "all" && urgencyFilter === "all" && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Nueva Solicitud
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Paginador */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-2 flex-shrink-0">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedRequests.length)} de {sortedRequests.length} solicitudes
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={cn(
                        "p-2 rounded-lg border border-border/50 transition-colors",
                        currentPage === 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-muted/30 hover:border-border/80 hover:text-primary"
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
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
                          onClick={() => goToPage(pageNum)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-sm transition-colors",
                            currentPage === pageNum
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted/30 hover:text-primary"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={cn(
                        "p-2 rounded-lg border border-border/50 transition-colors",
                        currentPage === totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-muted/30 hover:border-border/80 hover:text-primary"
                      )}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Modales */}
      <CreateRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {showDetailsModal && (
        <DetailsModal
          requestId={showDetailsModal}
          onClose={() => setShowDetailsModal(null)}
        />
      )}
    </div>
  );
};

export default EquipmentRequestManagement;
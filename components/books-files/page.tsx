"use client";

import React, { useState, useRef, useMemo } from "react";

import {
  File,
  FolderOpen,
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  Star,
  StarOff,
  Users,
  Building2,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  FileCode,
  FileCheck,
  X,
  Plus,
  Grid3x3,
  List,
  Share2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Shield,
  Folder,
  Cloud,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/context/AuthContext";

// ===== TIPOS =====

interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "xls" | "img" | "zip" | "code" | "other";
  size: string;
  category: string;
  uploadDate: string;
  lastModified: string;
  uploadedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  department: string;
  starred: boolean;
  shared: boolean;
  url: string;
  description?: string;
  tags: string[];
  version: number;
  status: "active" | "archived" | "draft";
}

interface Folder {
  id: string;
  name: string;
  icon: React.ReactNode;
  documentCount: number;
  color: string;
}

// ===== DATOS DE EJEMPLO =====

const mockFolders: Folder[] = [
  {
    id: "f1",
    name: "Políticas y Procedimientos",
    icon: <Building2 className="w-5 h-5 text-primary" />,
    documentCount: 24,
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "f2",
    name: "Contratos y Acuerdos",
    icon: <FileCheck className="w-5 h-5 text-primary" />,
    documentCount: 18,
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "f3",
    name: "Recursos Humanos",
    icon: <Users className="w-5 h-5 text-primary" />,
    documentCount: 32,
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "f4",
    name: "Finanzas y Contabilidad",
    icon: <Briefcase className="w-5 h-5 text-primary" />,
    documentCount: 15,
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "f5",
    name: "Documentación Técnica",
    icon: <FileCode className="w-5 h-5 text-primary" />,
    documentCount: 42,
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "f6",
    name: "Informes y Reportes",
    icon: <FileText className="w-5 h-5 text-primary" />,
    documentCount: 28,
    color: "from-primary/20 to-primary/5",
  },
];

const mockDocuments: Document[] = [
  {
    id: "d1",
    name: "Política de Seguridad Informática v3.2",
    type: "pdf",
    size: "2.4 MB",
    category: "Políticas",
    uploadDate: "2026-01-15",
    lastModified: "2026-01-15",
    uploadedBy: {
      id: "u1",
      name: "María González",
      avatar: "MG",
    },
    department: "Tecnología",
    starred: true,
    shared: true,
    url: "#",
    description: "Política actualizada de seguridad informática",
    tags: ["seguridad", "ti", "políticas"],
    version: 3.2,
    status: "active",
  },
  {
    id: "d2",
    name: "Contrato Marco de Proveedores 2026",
    type: "doc",
    size: "1.8 MB",
    category: "Contratos",
    uploadDate: "2026-01-10",
    lastModified: "2026-01-12",
    uploadedBy: {
      id: "u2",
      name: "Carlos Rodríguez",
      avatar: "CR",
    },
    department: "Legal",
    starred: false,
    shared: true,
    url: "#",
    tags: ["contratos", "legal", "proveedores"],
    version: 2.0,
    status: "active",
  },
  {
    id: "d3",
    name: "Manual de Bienvenida Empleados",
    type: "pdf",
    size: "5.2 MB",
    category: "Recursos Humanos",
    uploadDate: "2026-01-08",
    lastModified: "2026-01-08",
    uploadedBy: {
      id: "u3",
      name: "Laura Fernández",
      avatar: "LF",
    },
    department: "Recursos Humanos",
    starred: true,
    shared: false,
    url: "#",
    tags: ["rh", "bienvenida", "manual"],
    version: 4.1,
    status: "active",
  },
  {
    id: "d4",
    name: "Reporte Financiero Q4 2025",
    type: "xls",
    size: "3.6 MB",
    category: "Finanzas",
    uploadDate: "2026-01-05",
    lastModified: "2026-01-06",
    uploadedBy: {
      id: "u4",
      name: "Pedro Ramírez",
      avatar: "PR",
    },
    department: "Finanzas",
    starred: false,
    shared: true,
    url: "#",
    tags: ["finanzas", "reporte", "q4"],
    version: 1.2,
    status: "active",
  },
  {
    id: "d5",
    name: "Especificaciones Técnicas API v3",
    type: "code",
    size: "1.2 MB",
    category: "Tecnología",
    uploadDate: "2026-01-03",
    lastModified: "2026-01-04",
    uploadedBy: {
      id: "u5",
      name: "Ana Martínez",
      avatar: "AM",
    },
    department: "Tecnología",
    starred: false,
    shared: true,
    url: "#",
    tags: ["api", "desarrollo", "tech"],
    version: 3.0,
    status: "active",
  },
  {
    id: "d6",
    name: "Logo Corporativo y Branding",
    type: "img",
    size: "8.4 MB",
    category: "Marketing",
    uploadDate: "2025-12-28",
    lastModified: "2025-12-28",
    uploadedBy: {
      id: "u6",
      name: "Roberto Méndez",
      avatar: "RM",
    },
    department: "Marketing",
    starred: true,
    shared: true,
    url: "#",
    tags: ["branding", "logo", "marketing"],
    version: 5.0,
    status: "active",
  },
  {
    id: "d7",
    name: "Archivo Proyectos 2025",
    type: "zip",
    size: "45.2 MB",
    category: "Archivos",
    uploadDate: "2025-12-20",
    lastModified: "2025-12-20",
    uploadedBy: {
      id: "u2",
      name: "Carlos Rodríguez",
      avatar: "CR",
    },
    department: "Tecnología",
    starred: false,
    shared: false,
    url: "#",
    tags: ["archivo", "proyectos", "2025"],
    version: 1.0,
    status: "archived",
  },
  {
    id: "d8",
    name: "Política de Trabajo Remoto",
    type: "pdf",
    size: "1.6 MB",
    category: "Políticas",
    uploadDate: "2025-12-15",
    lastModified: "2025-12-18",
    uploadedBy: {
      id: "u3",
      name: "Laura Fernández",
      avatar: "LF",
    },
    department: "Recursos Humanos",
    starred: false,
    shared: true,
    url: "#",
    tags: ["remoto", "políticas", "rh"],
    version: 2.1,
    status: "active",
  },
  {
    id: "d9",
    name: "Presentación de Resultados Anuales",
    type: "doc",
    size: "12.8 MB",
    category: "Informes",
    uploadDate: "2025-12-10",
    lastModified: "2025-12-12",
    uploadedBy: {
      id: "u1",
      name: "María González",
      avatar: "MG",
    },
    department: "Dirección",
    starred: false,
    shared: true,
    url: "#",
    tags: ["presentación", "resultados", "anual"],
    version: 3.0,
    status: "active",
  },
  {
    id: "d10",
    name: "Plan de Capacitación 2026",
    type: "pdf",
    size: "3.2 MB",
    category: "Recursos Humanos",
    uploadDate: "2025-12-05",
    lastModified: "2025-12-08",
    uploadedBy: {
      id: "u6",
      name: "Roberto Méndez",
      avatar: "RM",
    },
    department: "Recursos Humanos",
    starred: false,
    shared: false,
    url: "#",
    tags: ["capacitación", "plan", "2026"],
    version: 1.0,
    status: "draft",
  },
];

// ===== FUNCIONES UTILITARIAS =====

const getFileIcon = (type: Document["type"]) => {
  switch (type) {
    case "pdf":
      return FileText;
    case "doc":
      return FileText;
    case "xls":
      return FileSpreadsheet;
    case "img":
      return FileImage;
    case "zip":
      return FileArchive;
    case "code":
      return FileCode;
    default:
      return File;
  }
};

const getFileColor = (type: Document["type"]) => {
  return "text-primary";
};

const getStatusColor = (status: Document["status"]) => {
  switch (status) {
    case "active":
      return "text-primary bg-primary/10";
    case "archived":
      return "text-muted-foreground bg-muted/50";
    case "draft":
      return "text-muted-foreground bg-muted/50";
    default:
      return "text-muted-foreground bg-muted/50";
  }
};

const getStatusLabel = (status: Document["status"]) => {
  switch (status) {
    case "active":
      return "Activo";
    case "archived":
      return "Archivado";
    case "draft":
      return "Borrador";
    default:
      return "Desconocido";
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

export const DocumentManagement: React.FC = () => {
  const { user, isLoading, isAdminOrLeader, hasRole } = useAuth();

  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [folders] = useState<Folder[]>(mockFolders);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">(
    "date",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log del usuario y roles
  console.log("Usuario actual:", user);
  console.log("Roles permitidos para subir: ADMIN, LEADER");
  console.log("Tiene permiso para subir:", hasRole(["ADMIN", "LEADER"]));

  // Verificar permisos - Usamos el rol directamente del usuario para más control
  // En tu DocumentManagement, haz la comparación insensible a mayúsculas:
   const canUpload = isAdminOrLeader();
  const canDelete = isAdminOrLeader();
  const canShare = hasRole(['ADMIN', 'LEADER', 'MANAGER']);

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-120px)] flex items-center justify-center bg-muted/20 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  // ===== FILTRAR DOCUMENTOS =====

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFolder = selectedFolder
        ? folders.find((f) => f.id === selectedFolder)?.name === doc.category
        : true;

      return matchesSearch && matchesFolder;
    });
  }, [documents, searchQuery, selectedFolder, folders]);

  // ===== ORDENAR DOCUMENTOS =====

  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return (
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
          );
        case "size":
          return parseFloat(a.size) - parseFloat(b.size);
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  }, [filteredDocuments, sortBy]);

  // ===== PAGINACIÓN =====

  const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedDocuments.slice(start, end);
  }, [sortedDocuments, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // ===== HANDLERS =====

  const handleStarDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, starred: !doc.starred } : doc,
      ),
    );
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const handleSelectDocument = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === paginatedDocuments.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(paginatedDocuments.map((d) => d.id));
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newDoc: Document = {
        id: `d${Date.now()}`,
        name: file.name,
        type: "pdf",
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        category: "Nuevos",
        uploadDate: new Date().toISOString().split("T")[0],
        lastModified: new Date().toISOString().split("T")[0],
        uploadedBy: {
          id: user?.id || "u1",
          name: user?.name || "Usuario Actual",
          avatar: user?.avatar || "UA",
        },
        department: "General",
        starred: false,
        shared: false,
        url: "#",
        tags: ["nuevo"],
        version: 1,
        status: "active",
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setShowUploadModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ===== ESTADÍSTICAS =====

  const totalDocuments = documents.length;
  const starredCount = documents.filter((d) => d.starred).length;
  const sharedCount = documents.filter((d) => d.shared).length;
  const recentCount = documents.filter((d) => {
    const date = new Date(d.uploadDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date > weekAgo;
  }).length;

  // ===== RENDERIZAR DOCUMENTO EN GRID =====

  const renderGridItem = (doc: Document) => {
    const FileIcon = getFileIcon(doc.type);
    const isSelected = selectedDocs.includes(doc.id);

    return (
      <div
        key={doc.id}
        className={cn(
          "group bg-card rounded-xl p-4 border transition-all hover:shadow-md cursor-pointer relative",
          isSelected
            ? "border-primary ring-2 ring-primary/20 bg-primary/5"
            : "border-border/50 hover:border-border/80 hover:bg-muted/10",
        )}
        onClick={() => handleSelectDocument(doc.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <FileIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground line-clamp-1">
                {doc.name}
              </h4>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span>{doc.size}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                <span>{doc.category}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStarDocument(doc.id);
              }}
              className="p-1 rounded-full hover:bg-muted/50 transition-colors"
            >
              {doc.starred ? (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              ) : (
                <StarOff className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`¿Estás seguro de eliminar "${doc.name}"?`)) {
                    handleDeleteDocument(doc.id);
                  }
                }}
                className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              getStatusColor(doc.status),
            )}
          >
            {getStatusLabel(doc.status)}
          </span>
          {doc.shared && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
              <Globe className="w-3 h-3" /> Compartido
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            v{doc.version}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[8px] flex-shrink-0">
            {doc.uploadedBy.avatar}
          </div>
          <span>{doc.uploadedBy.name}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
          <span>{new Date(doc.uploadDate).toLocaleDateString("es-ES")}</span>
        </div>
      </div>
    );
  };

  // ===== RENDERIZAR DOCUMENTO EN LISTA =====

  const renderListItem = (doc: Document) => {
    const FileIcon = getFileIcon(doc.type);
    const isSelected = selectedDocs.includes(doc.id);

    return (
      <div
        key={doc.id}
        className={cn(
          "group flex items-center gap-4 p-3 border-b border-border/50 hover:bg-muted/10 transition-all cursor-pointer",
          isSelected && "bg-primary/5",
        )}
        onClick={() => handleSelectDocument(doc.id)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-foreground truncate">
                {doc.name}
              </h4>
              {doc.starred && (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{doc.category}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
              <span>{doc.size}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
              <span>{doc.uploadedBy.name}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
              <span>
                {new Date(doc.uploadDate).toLocaleDateString("es-ES")}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              getStatusColor(doc.status),
            )}
          >
            {getStatusLabel(doc.status)}
          </span>
          {doc.shared && <Globe className="w-3.5 h-3.5 text-primary" />}
          <span className="text-xs text-muted-foreground">v{doc.version}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStarDocument(doc.id);
            }}
            className="p-1 rounded-full hover:bg-muted/50 transition-colors"
          >
            {doc.starred ? (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            ) : (
              <StarOff className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`¿Estás seguro de eliminar "${doc.name}"?`)) {
                  handleDeleteDocument(doc.id);
                }
              }}
              className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // ===== MODAL DE SUBIDA =====

  const UploadModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
    isOpen,
    onClose,
  }) => {
    const [dragOver, setDragOver] = useState(false);

    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-card rounded-2xl w-full max-w-lg mx-4 shadow-2xl border border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Subir Documento
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <div className="p-6">
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-border/80",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  const file = files[0];
                  const newDoc: Document = {
                    id: `d${Date.now()}`,
                    name: file.name,
                    type: "pdf",
                    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                    category: "Nuevos",
                    uploadDate: new Date().toISOString().split("T")[0],
                    lastModified: new Date().toISOString().split("T")[0],
                    uploadedBy: {
                      id: user?.id || "u1",
                      name: user?.name || "Usuario Actual",
                      avatar: user?.avatar || "UA",
                    },
                    department: "General",
                    starred: false,
                    shared: false,
                    url: "#",
                    tags: ["nuevo"],
                    version: 1,
                    status: "active",
                  };
                  setDocuments((prev) => [newDoc, ...prev]);
                  onClose();
                }
              }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground font-medium">
                Arrastra tus archivos aquí
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                o haz clic para seleccionar
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
                multiple
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Seleccionar archivos
              </button>
              <p className="text-xs text-muted-foreground mt-3">
                PDF, DOC, XLS, IMG, ZIP - Máx. 50MB
              </p>
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
            {/* <TokenLoader /> */}
            {/* Barra lateral izquierda - Folders */}
            <aside className="h-full overflow-hidden">
              <div className="bg-card rounded-xl shadow-sm p-5 h-full flex flex-col border border-border/50 hover:border-border/80 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-primary" />
                    Documentos
                  </h2>
                  {canUpload && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      title="Subir documento (Requiere rol ADMIN o LEADER)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-muted/20 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-foreground">
                      {totalDocuments}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-amber-500">
                      {starredCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Favoritos
                    </p>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-primary">
                      {sharedCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Compartidos
                    </p>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-primary">
                      {recentCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Recientes
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex-1 overflow-y-auto space-y-1",
                    scrollbarClasses,
                  )}
                >
                  <button
                    onClick={() => {
                      setSelectedFolder(null);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                      !selectedFolder
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                    )}
                  >
                    <Folder className="w-4 h-4 text-primary" />
                    <span className="flex-1 text-left">
                      Todos los documentos
                    </span>
                    <span className="text-xs bg-muted/30 px-2 py-0.5 rounded-full">
                      {totalDocuments}
                    </span>
                  </button>

                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setSelectedFolder(folder.id);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm group",
                        selectedFolder === folder.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                      )}
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-lg bg-gradient-to-br text-white",
                          folder.color,
                        )}
                      >
                        {folder.icon}
                      </div>
                      <span className="flex-1 text-left truncate">
                        {folder.name}
                      </span>
                      <span className="text-xs bg-muted/30 px-2 py-0.5 rounded-full group-hover:bg-muted/50 transition-colors">
                        {folder.documentCount}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-lg p-3 border-l-4 border-primary">
                    <p className="text-xs text-foreground flex items-start gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Todos los documentos están cifrados y seguros</span>
                    </p>
                    {user && (
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        Rol: {user.role}
                      </p>
                    )}
                    {!user && (
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-yellow-500"></span>
                        No autenticado
                      </p>
                    )}
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
                    placeholder="Buscar por nombre, categoría, departamento..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
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
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
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
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
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
                  <option value="name">Nombre</option>
                  <option value="size">Tamaño</option>
                  <option value="type">Tipo</option>
                </select>

                {canUpload && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Subir</span>
                  </button>
                )}
              </div>

              {/* Selección masiva */}
              {selectedDocs.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-lg mb-3 flex-shrink-0">
                  <span className="text-sm text-foreground">
                    {selectedDocs.length} documento
                    {selectedDocs.length !== 1 ? "s" : ""} seleccionado
                    {selectedDocs.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => setSelectedDocs([])}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex-1"></div>
                  {canShare && (
                    <button className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors text-primary">
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors text-primary">
                    <Download className="w-4 h-4" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `¿Estás seguro de eliminar ${selectedDocs.length} documento(s)?`,
                          )
                        ) {
                          setDocuments((prev) =>
                            prev.filter(
                              (doc) => !selectedDocs.includes(doc.id),
                            ),
                          );
                          setSelectedDocs([]);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Lista de documentos */}
              <div
                className={cn(
                  "flex-1 overflow-y-auto rounded-xl",
                  scrollbarClasses,
                )}
              >
                {paginatedDocuments.length > 0 ? (
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-1">
                      {paginatedDocuments.map(renderGridItem)}
                    </div>
                  ) : (
                    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                      <div
                        className="flex items-center px-3 py-2 bg-muted/20 border-b border-border/50 text-xs text-muted-foreground font-medium cursor-pointer"
                        onClick={handleSelectAll}
                      >
                        <div className="flex-1">Nombre</div>
                        <div className="flex items-center gap-6">
                          <span className="w-24 text-center">Estado</span>
                          <span className="w-20 text-center">Versión</span>
                          <span className="w-24 text-center">Acciones</span>
                        </div>
                      </div>
                      {paginatedDocuments.map(renderListItem)}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FolderOpen className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                      No hay documentos
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      {searchQuery
                        ? "No se encontraron documentos con esa búsqueda"
                        : "Sube tu primer documento para comenzar a organizar tus archivos"}
                    </p>
                    {!searchQuery && canUpload && (
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Subir documento
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Paginador */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-2 flex-shrink-0">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      sortedDocuments.length,
                    )}{" "}
                    de {sortedDocuments.length} documentos
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={cn(
                        "p-2 rounded-lg border border-border/50 transition-colors",
                        currentPage === 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-muted/30 hover:border-border/80 hover:text-primary",
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
                              : "text-muted-foreground hover:bg-muted/30 hover:text-primary",
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
                          : "hover:bg-muted/30 hover:border-border/80 hover:text-primary",
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

      {/* Modal de subida */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
};

export default DocumentManagement;

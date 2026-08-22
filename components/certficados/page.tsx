import React, { useState } from "react";
import {
  X,
  FileCheck,
  Download,
  Eye,
  Calendar,
  User,
  Building2,
  FileText,
  CheckCircle,
  Clock,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface Certificate {
  id: string;
  name: string;
  type: 'work' | 'income' | 'labor' | 'services' | 'other';
  issueDate: string;
  status: 'active' | 'expired' | 'pending';
  description: string;
  fileName: string;
  fileSize: string;
  pdfUrl?: string;
}

interface CertificatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockCertificates: Certificate[] = [
  {
    id: '1',
    name: 'Certificado Laboral',
    type: 'work',
    issueDate: '2026-01-15',
    status: 'active',
    description: 'Certificado laboral para trámites bancarios',
    fileName: 'Certificado_Laboral.pdf',
    fileSize: '245 KB',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '2',
    name: 'Certificado de Ingresos',
    type: 'income',
    issueDate: '2026-02-20',
    status: 'active',
    description: 'Comprobante de ingresos para crédito hipotecario',
    fileName: 'Certificado_Ingresos.pdf',
    fileSize: '189 KB',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '3',
    name: 'Certificado de Antigüedad',
    type: 'labor',
    issueDate: '2025-10-10',
    status: 'expired',
    description: 'Certificado de antigüedad laboral',
    fileName: 'Certificado_Antiguedad.pdf',
    fileSize: '312 KB',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '4',
    name: 'Certificado de Servicios',
    type: 'services',
    issueDate: '2026-03-05',
    status: 'active',
    description: 'Constancia de prestación de servicios',
    fileName: 'Certificado_Servicios.pdf',
    fileSize: '178 KB',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '5',
    name: 'Certificado de Buen Desempeño',
    type: 'other',
    issueDate: '2026-08-01',
    status: 'active',
    description: 'Certificado de buen desempeño laboral',
    fileName: 'Certificado_Desempeno.pdf',
    fileSize: '156 KB',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '6',
    name: 'Certificado de Ingresos 2025',
    type: 'income',
    issueDate: '2025-12-01',
    status: 'pending',
    description: 'Comprobante de ingresos anual 2025',
    fileName: 'Certificado_Ingresos_2025.pdf',
    fileSize: '234 KB',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];

const getInitials = (name: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
};

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

export const CertificatesModal: React.FC<CertificatesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const userName = user?.name || 'Usuario';
  const userPosition = user?.position || user?.role || 'Empleado';
  const userDepartment = user?.area || 'Sin departamento';
  const userInitials = getInitials(userName);

  const filteredCertificates = mockCertificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || cert.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeIcon = (type: Certificate['type']) => {
    switch(type) {
      case 'work': return <FileCheck className="w-4 h-4 text-blue-500" />;
      case 'income': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'labor': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'services': return <Building2 className="w-4 h-4 text-blue-500" />;
      default: return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: Certificate['type']) => {
    switch(type) {
      case 'work': return 'Laboral';
      case 'income': return 'Ingresos';
      case 'labor': return 'Antigüedad';
      case 'services': return 'Servicios';
      default: return 'Otro';
    }
  };

  const getStatusColor = (status: Certificate['status']) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: Certificate['status']) => {
    switch(status) {
      case 'active': return 'Activo';
      case 'expired': return 'Expirado';
      case 'pending': return 'Pendiente';
      default: return '';
    }
  };

  const getStatusIcon = (status: Certificate['status']) => {
    switch(status) {
      case 'active': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'expired': return <FileCheck className="w-3.5 h-3.5" />;
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleDownload = (certificate: Certificate) => {
    console.log(`Descargando: ${certificate.fileName}`);
    if (certificate.pdfUrl) {
      window.open(certificate.pdfUrl, '_blank');
    } else {
      alert(`Descargando ${certificate.fileName} (${certificate.fileSize})`);
    }
  };

  const handleView = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-card rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col shadow-2xl border border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Mis Certificados
                </h2>
                <p className="text-xs text-muted-foreground">
                  {filteredCertificates.length} certificado{filteredCertificates.length !== 1 ? 's' : ''} disponible{filteredCertificates.length !== 1 ? 's' : ''}
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

          <div className="p-4 border-b border-border flex-shrink-0 bg-muted/5">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={userName}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-background"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ring-2 ring-background">
                  {userInitials}
                </div>
              )}
              <div>
                <p className="font-semibold text-foreground">{userName}</p>
                <p className="text-sm text-muted-foreground">{userPosition}</p>
                <p className="text-xs text-muted-foreground">{userDepartment}</p>
                {user?.email && (
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative col-span-1 md:col-span-2">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar certificado..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="work">Laboral</option>
                  <option value="income">Ingresos</option>
                  <option value="labor">Antigüedad</option>
                  <option value="services">Servicios</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedCertificates.length > 0 ? (
                paginatedCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-card border border-border/50 rounded-xl p-4 hover:shadow-md transition-all hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/30">
                          {getTypeIcon(cert.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {cert.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getTypeLabel(cert.type)}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center gap-1",
                        getStatusColor(cert.status)
                      )}>
                        {getStatusIcon(cert.status)}
                        {getStatusLabel(cert.status)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      {cert.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>Emisión: {formatDate(cert.issueDate)}</span>
                      <span>{cert.fileSize}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(cert)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted transition-colors text-foreground text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver
                      </button>
                      <button
                        onClick={() => handleDownload(cert)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descargar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium">
                      No se encontraron certificados
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-shrink-0 bg-muted/5">
            <div className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCertificates.length)} de {filteredCertificates.length}
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

      {selectedCertificate && (
        <div
          className={cn(
            "fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300",
            isFullscreen && "bg-black/95"
          )}
          onClick={() => !isFullscreen && setSelectedCertificate(null)}
        >
          <div
            className={cn(
              "bg-card rounded-2xl shadow-2xl border border-border/50 transition-all duration-300",
              isFullscreen 
                ? "w-full h-full max-w-full max-h-full mx-0 rounded-none" 
                : "w-full max-w-4xl mx-4 max-h-[90vh]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  {getTypeIcon(selectedCertificate.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedCertificate.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedCertificate.fileName} • {selectedCertificate.fileSize}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                  title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>

            <div className={cn(
              "p-4 overflow-y-auto",
              isFullscreen ? "h-[calc(100vh-120px)]" : "h-[500px]"
            )}>
              {selectedCertificate.pdfUrl ? (
                <iframe
                  src={selectedCertificate.pdfUrl}
                  className="w-full h-full rounded-lg border border-border/50"
                  title={selectedCertificate.name}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium">Vista previa no disponible</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    El documento no se puede visualizar en el navegador
                  </p>
                  <button
                    onClick={() => handleDownload(selectedCertificate)}
                    className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/5">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Emisión:</span> {formatDate(selectedCertificate.issueDate)}
                {selectedCertificate.status === 'active' && (
                  <span className="ml-4">
                    <span className="font-medium">Estado:</span> 
                    <span className="ml-1 text-green-600 dark:text-green-400">Activo</span>
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDownload(selectedCertificate)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
'use client';

import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== TIPOS =====
export interface Publicacion {
  id: string;
  titulo: string;
  creador: string;
  estado: 'Pendiente' | 'Publicado' | 'Rechazado';
  fechaCreacion: string;
  fechaExpiracion: string;
  fechaPublicacion: string | null;
  contenido?: string;
}

interface PublicacionesPanelProps {
  publicacionesIniciales?: Publicacion[];
  onAprobar?: (id: string) => void;
  onRechazar?: (id: string) => void;
}

// ===== DATOS DE EJEMPLO =====
const publicacionesEjemplo: Publicacion[] = [
  {
    id: '1',
    titulo: 'Nuestro cliente: Recaudo',
    creador: 'Alexandra Santana Saenz',
    estado: 'Publicado',
    fechaCreacion: '29/06/2023 10:58',
    fechaExpiracion: '29/07/2023 23:59',
    fechaPublicacion: '29/06/2023 11:01',
    contenido: 'Contenido de la publicación...'
  },
  {
    id: '2',
    titulo: 'Nuevo título',
    creador: 'Alexandra Santana Saenz',
    estado: 'Pendiente',
    fechaCreacion: '30/06/2023 12:19',
    fechaExpiracion: '30/07/2023 23:59',
    fechaPublicacion: null,
  },
  {
    id: '3',
    titulo: 'Nuevo título',
    creador: 'Ana Isabel Aguilar Pinzon',
    estado: 'Pendiente',
    fechaCreacion: '30/06/2023 15:28',
    fechaExpiracion: '30/07/2023 23:59',
    fechaPublicacion: null,
  },
  {
    id: '4',
    titulo: 'Nuevo título',
    creador: 'Hugo Sánchez Cuervo',
    estado: 'Pendiente',
    fechaCreacion: '05/07/2023 12:38',
    fechaExpiracion: '05/08/2023 23:59',
    fechaPublicacion: null,
  },
  {
    id: '5',
    titulo: 'Nuevo título',
    creador: 'Adriana Mora',
    estado: 'Pendiente',
    fechaCreacion: '06/07/2023 14:32',
    fechaExpiracion: '06/08/2023 23:59',
    fechaPublicacion: null,
  },
  {
    id: '6',
    titulo: 'Nuevo último',
    creador: 'Pablo Gomez',
    estado: 'Pendiente',
    fechaCreacion: '12/07/2023 11:20',
    fechaExpiracion: '12/08/2023 23:59',
    fechaPublicacion: null,
  },
];

// ===== COMPONENTE PRINCIPAL =====
export const PublicacionesPanel: React.FC<PublicacionesPanelProps> = ({ 
  publicacionesIniciales,
  onAprobar,
  onRechazar 
}) => {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>(
    publicacionesIniciales || publicacionesEjemplo
  );
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [ordenAscendente, setOrdenAscendente] = useState<boolean>(true);
  const [campoOrden, setCampoOrden] = useState<keyof Publicacion>('fechaCreacion');

  // Manejador para aprobar publicación
  const handleAprobar = (id: string): void => {
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + fechaActual.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    setPublicaciones(prev => 
      prev.map(pub => 
        pub.id === id 
          ? { 
              ...pub, 
              estado: 'Publicado',
              fechaPublicacion: fechaFormateada
            }
          : pub
      )
    );

    if (onAprobar) onAprobar(id);
  };

  // Manejador para rechazar publicación
  const handleRechazar = (id: string): void => {
    if (window.confirm('¿Estás seguro de que deseas rechazar esta publicación?')) {
      setPublicaciones(prev => prev.filter(pub => pub.id !== id));
      if (onRechazar) onRechazar(id);
    }
  };

  // Manejar ordenamiento
  const handleOrdenar = (campo: keyof Publicacion) => {
    if (campo === campoOrden) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setCampoOrden(campo);
      setOrdenAscendente(true);
    }
  };

  // Filtrar y ordenar publicaciones
  const publicacionesFiltradas = publicaciones
    .filter(pub => {
      const matchEstado = filtroEstado === 'todos' || pub.estado === filtroEstado;
      const matchBusqueda = 
        pub.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        pub.creador.toLowerCase().includes(busqueda.toLowerCase());
      return matchEstado && matchBusqueda;
    })
    .sort((a, b) => {
      const valorA = a[campoOrden] || '';
      const valorB = b[campoOrden] || '';
      
      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return ordenAscendente 
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }
      return 0;
    });

  // Renderizar badge de estado 
  const renderEstadoBadge = (estado: Publicacion['estado']) => {
    const config = {
      'Publicado': {
        clase: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
        icono: CheckCircle,
        label: 'Publicado'
      },
      'Pendiente': {
        clase: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
        icono: Clock,
        label: 'Pendiente'
      },
      'Rechazado': {
        clase: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
        icono: XCircle,
        label: 'Rechazado'
      }
    };

    const { clase, icono: Icon, label } = config[estado];

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${clase}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  return (
    <div className="w-full h-full bg-background p-4">
      <div className="h-full max-w-7xl mx-auto">
        <div className="h-full bg-card rounded-2xl shadow-sm border border-border flex flex-col">
          
          {/* Header con filtros */}
          <div className="p-4 border-b border-border flex-shrink-0 bg-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Publicaciones
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({publicacionesFiltradas.length})
                </span>
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por título o creador..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Filtro de estado */}
                <div className="relative">
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="w-full sm:w-auto pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="Publicado">Publicado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de publicaciones */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-muted/30 border-b border-border sticky top-0 z-10">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleOrdenar('titulo')}
                  >
                    <div className="flex items-center gap-1">
                      Título
                      {campoOrden === 'titulo' && (
                        ordenAscendente ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleOrdenar('creador')}
                  >
                    <div className="flex items-center gap-1">
                      Creador
                      {campoOrden === 'creador' && (
                        ordenAscendente ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleOrdenar('estado')}
                  >
                    <div className="flex items-center gap-1">
                      Estado
                      {campoOrden === 'estado' && (
                        ordenAscendente ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleOrdenar('fechaCreacion')}
                  >
                    <div className="flex items-center gap-1">
                      Fecha creación
                      {campoOrden === 'fechaCreacion' && (
                        ordenAscendente ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleOrdenar('fechaExpiracion')}
                  >
                    <div className="flex items-center gap-1">
                      Fecha expiración
                      {campoOrden === 'fechaExpiracion' && (
                        ordenAscendente ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleOrdenar('fechaPublicacion')}
                  >
                    <div className="flex items-center gap-1">
                      Fecha publicación
                      {campoOrden === 'fechaPublicacion' && (
                        ordenAscendente ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {publicacionesFiltradas.length > 0 ? (
                  publicacionesFiltradas.map((pub) => (
                    <tr 
                      key={pub.id} 
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        pub.estado === 'Pendiente' && "bg-primary/5 dark:bg-primary/10"
                      )}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground max-w-[200px] truncate">
                        {pub.titulo}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          {pub.creador}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {renderEstadoBadge(pub.estado)}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {pub.fechaCreacion}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {pub.fechaExpiracion}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {pub.fechaPublicacion || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {pub.estado === 'Pendiente' ? (
                            <>
                              <button
                                onClick={() => handleAprobar(pub.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded-lg transition-all hover:shadow-md"
                                title="Aprobar publicación"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleRechazar(pub.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-lg transition-all hover:shadow-md"
                                title="Rechazar publicación"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Rechazar
                              </button>
                            </>
                          ) : (
                            <span className={cn(
                              "text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                              pub.estado === 'Publicado' 
                                ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30" 
                                : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
                            )}>
                              {pub.estado === 'Publicado' ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              {pub.estado === 'Publicado' ? 'Aprobado' : 'Rechazado'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-10 h-10 text-muted-foreground/30" />
                        <p className="text-sm font-medium">No hay publicaciones que coincidan con los filtros</p>
                        <p className="text-xs text-muted-foreground">Intenta ajustar los criterios de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex-shrink-0 bg-card">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  Mostrando <span className="font-medium text-foreground">{publicacionesFiltradas.length}</span> de{' '}
                  <span className="font-medium text-foreground">{publicaciones.length}</span> registros
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Publicados: {publicaciones.filter(p => p.estado === 'Publicado').length}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Pendientes: {publicaciones.filter(p => p.estado === 'Pendiente').length}
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                Última actualización: {new Date().toLocaleString('es-ES')}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PublicacionesPanel;
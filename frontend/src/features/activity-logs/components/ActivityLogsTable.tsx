import React from 'react';
import {
  Search,
  Eye,
  RefreshCw,
  ShieldCheck,
  Filter,
  Calendar,
  User,
  Clock,
} from 'lucide-react';
import {
  ActivityAction,
  ActivityLogItem,
  ActivityLogQueryParams,
} from '../types/activity-logs.types';

interface ActivityLogsTableProps {
  logs: ActivityLogItem[];
  total: number;
  page: number;
  totalPages: number;
  params: ActivityLogQueryParams;
  loading: boolean;
  onUpdateParams: (newParams: Partial<ActivityLogQueryParams>) => void;
  onRefresh: () => void;
  onSelectLog: (log: ActivityLogItem) => void;
}

export const ActivityLogsTable: React.FC<ActivityLogsTableProps> = ({
  logs,
  total,
  page,
  totalPages,
  params,
  loading,
  onUpdateParams,
  onRefresh,
  onSelectLog,
}) => {
  const getActionBadgeClass = (action: ActivityAction) => {
    switch (action) {
      case 'UPDATE_ATTENDANCE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'MARK_ATTENDANCE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'ACTIVATE_MODULE':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'IMPORT_STUDENTS':
      case 'IMPORT_SCHEDULES':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border-teal-300 dark:border-teal-800';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
      {/* Barra de Filtros */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Tipo de Acción */}
          <div className="relative min-w-[200px]">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <select
              value={params.action || 'ALL'}
              onChange={(e) =>
                onUpdateParams({ action: e.target.value as any })
              }
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Todas las acciones</option>
              <option value="UPDATE_ATTENDANCE">UPDATE_ATTENDANCE (Modificación manual)</option>
              <option value="MARK_ATTENDANCE">MARK_ATTENDANCE (Marcación de alumno)</option>
              <option value="LOGIN">LOGIN (Inicio de sesión)</option>
              <option value="ACTIVATE_MODULE">ACTIVATE_MODULE (Activación de módulo)</option>
              <option value="IMPORT_STUDENTS">IMPORT_STUDENTS (Carga de alumnos)</option>
              <option value="IMPORT_SCHEDULES">IMPORT_SCHEDULES (Carga de calendario)</option>
            </select>
          </div>

          {/* Buscador libre */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={params.search || ''}
              onChange={(e) => onUpdateParams({ search: e.target.value })}
              placeholder="Buscar por usuario o entidad..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Botón Refrescar */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            title="Refrescar auditoría"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-500' : ''}`}
            />
            <span>Actualizar</span>
          </button>
        </div>

        <div className="text-xs text-zinc-500 dark:text-zinc-400 text-right">
          Total eventos registrados: <strong className="text-zinc-900 dark:text-white font-mono">{total}</strong>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
          <thead className="bg-zinc-100 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-200 uppercase font-semibold text-[11px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-4">Fecha y Hora</th>
              <th className="py-3 px-4">Usuario / Identificador</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4">Acción Auditada</th>
              <th className="py-3 px-4">Entidad Afectada</th>
              <th className="py-3 px-4 text-center">Detalle / Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-400">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Cargando eventos de auditoría...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-400">
                  No se encontraron eventos de auditoría con los filtros aplicados.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  {/* Fecha */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-zinc-800 dark:text-zinc-200">
                      <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                  </td>

                  {/* Usuario */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-white">
                      <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{log.userIdentifier}</span>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {log.userRole}
                    </span>
                  </td>

                  {/* Acción */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold border ${getActionBadgeClass(
                        log.action,
                      )}`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {log.action}
                    </span>
                  </td>

                  {/* Entidad */}
                  <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                    {log.entityAffected}
                  </td>

                  {/* Acción Ver Diff */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onSelectLog(log)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold transition-colors cursor-pointer"
                      title="Ver diff detallado"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspeccionar</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50/40 dark:bg-zinc-900/40">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateParams({ page: Math.max(page - 1, 1) })}
              disabled={page === 1}
              className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              Anterior
            </button>
            <button
              onClick={() =>
                onUpdateParams({ page: Math.min(page + 1, totalPages) })
              }
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

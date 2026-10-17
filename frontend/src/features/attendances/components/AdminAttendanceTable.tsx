import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Search,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { MatrixRowItem } from '../types/admin-attendance.types';

interface AdminAttendanceTableProps {
  rows: MatrixRowItem[];
  onOpenOverride: (row: MatrixRowItem) => void;
  loading: boolean;
}

export const AdminAttendanceTable: React.FC<AdminAttendanceTableProps> = ({
  rows,
  onOpenOverride,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.studentName.toLowerCase().includes(term) ||
        r.registrationNumber.toLowerCase().includes(term) ||
        r.classDate.includes(term) ||
        (r.remarks && r.remarks.toLowerCase().includes(term)),
    );
  }, [rows, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
      {/* Header de la Tabla y Buscador */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Planilla de Asistencias del Módulo
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Mostrando {filteredRows.length} registros calculados
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por alumno o registro..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tabla Responsiva */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
          <thead className="bg-zinc-100 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-200 uppercase font-semibold text-[11px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-4">Estudiante</th>
              <th className="py-3 px-4">Registro</th>
              <th className="py-3 px-4">Fecha & Horario</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4">Hora / Origen</th>
              <th className="py-3 px-4">Observaciones / Justificación</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-400">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Cargando matriz de asistencias...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-400">
                  No se encontraron registros que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr
                  key={`${row.studentId}_${row.classScheduleId}_${idx}`}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  {/* Estudiante */}
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">
                    {row.studentName}
                  </td>

                  {/* Registro */}
                  <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                    {row.registrationNumber}
                  </td>

                  {/* Fecha y Horario */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">
                      {row.classDate}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {row.timeRange}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                        row.status === 'PRESENTE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {row.status === 'PRESENTE' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {row.status}
                    </span>
                  </td>

                  {/* Hora y Rol que marcó */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{formatTime(row.markedAt)}</span>
                    </div>
                    {row.markedByRole && (
                      <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-zinc-400">
                        {row.markedByRole === 'ADMIN' ? (
                          <ShieldAlert className="w-3 h-3 text-amber-500" />
                        ) : (
                          <UserCheck className="w-3 h-3 text-indigo-500" />
                        )}
                        Por {row.markedByRole}
                      </span>
                    )}
                  </td>

                  {/* Justificación / Observaciones */}
                  <td className="py-3 px-4 max-w-xs">
                    {row.remarks ? (
                      <span
                        className="text-xs text-zinc-700 dark:text-zinc-300 truncate block"
                        title={row.remarks}
                      >
                        {row.remarks}
                      </span>
                    ) : (
                      <span className="text-zinc-400 italic text-[11px]">
                        Sin observaciones
                      </span>
                    )}
                  </td>

                  {/* Botón Modificar (US-12) */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onOpenOverride(row)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      title="Modificar estado de asistencia (US-12)"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Modificar</span>
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
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
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

import React from 'react';
import { Calendar, Users, RefreshCw, Filter } from 'lucide-react';
import {
  MatrixScheduleItem,
  MatrixStudentItem,
} from '../types/admin-attendance.types';

interface AdminAttendanceFiltersProps {
  schedules: MatrixScheduleItem[];
  students: MatrixStudentItem[];
  selectedDate: string;
  selectedStudentId: string;
  onDateChange: (date: string) => void;
  onStudentChange: (studentId: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const AdminAttendanceFilters: React.FC<AdminAttendanceFiltersProps> = ({
  schedules,
  students,
  selectedDate,
  selectedStudentId,
  onDateChange,
  onStudentChange,
  onRefresh,
  loading,
}) => {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold text-sm">
          <Filter className="w-4 h-4 text-indigo-500" />
          <span>Filtros de Planilla:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-3">
          {/* Selector de Fecha */}
          <div className="relative min-w-[200px]">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <select
              value={selectedDate || 'ALL'}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
            >
              <option value="ALL">Todas las fechas de clase</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.classDate}>
                  {s.classDate} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Estudiante */}
          <div className="relative min-w-[220px]">
            <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <select
              value={selectedStudentId || 'ALL'}
              onChange={(e) => onStudentChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
            >
              <option value="ALL">Todos los estudiantes ({students.length})</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.registrationNumber} - {st.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Refrescar */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            title="Refrescar planilla"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`}
            />
            <span>Actualizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

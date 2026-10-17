import React from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { MatrixSummaryMetrics } from '../types/admin-attendance.types';

interface AdminAttendanceStatsCardsProps {
  summary: MatrixSummaryMetrics;
}

export const AdminAttendanceStatsCards: React.FC<
  AdminAttendanceStatsCardsProps
> = ({ summary }) => {
  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-500 dark:text-emerald-400';
    if (pct >= 70) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. % Asistencia */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Tasa Asistencia
          </span>
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={`text-3xl font-extrabold tracking-tight ${getPercentageColor(
              summary.attendancePercentage,
            )}`}
          >
            {summary.attendancePercentage.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Evaluada sobre asistencias y faltas
        </div>
      </div>

      {/* 2. Total Presentes */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Total Presentes
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {summary.totalPresent}
          </span>
        </div>
        <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Marcas registradas / aprobadas
        </div>
      </div>

      {/* 3. Total Ausentes */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Total Ausentes
          </span>
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {summary.totalAbsent}
          </span>
        </div>
        <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
          Faltas calculadas o registradas
        </div>
      </div>

      {/* 4. Total Estudiantes */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Estudiantes
          </span>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {summary.totalStudents}
          </span>
        </div>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Inscritos en nómina activa
        </div>
      </div>

      {/* 5. Total Sesiones */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Clases Módulo
          </span>
          <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {summary.totalClasses}
          </span>
        </div>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Fechas en cronograma
        </div>
      </div>
    </div>
  );
};

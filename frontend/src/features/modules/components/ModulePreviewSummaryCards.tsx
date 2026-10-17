'use client';

import React from 'react';
import { Users, CalendarDays, Clock, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

interface ModulePreviewSummaryCardsProps {
  totalStudents: number;
  totalSchedules: number;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  canActivate: boolean;
  hasErrors: boolean;
}

export const ModulePreviewSummaryCards: React.FC<ModulePreviewSummaryCardsProps> = ({
  totalStudents,
  totalSchedules,
  estimatedStartDate,
  estimatedEndDate,
  canActivate,
  hasErrors,
}) => {
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Sin definir';
    try {
      const [year, month, day] = isoString.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Tarjeta 1: Total Estudiantes */}
      <div className="bg-white p-5 rounded-2xl border-t-4 border-t-indigo-600 shadow-sm ring-1 ring-slate-900/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Estudiantes
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900">
              {totalStudents}
            </span>
            <span className="text-xs text-slate-500 font-medium">matriculados</span>
          </div>
        </div>
      </div>

      {/* Tarjeta 2: Clases Programadas */}
      <div className="bg-white p-5 rounded-2xl border-t-4 border-t-emerald-500 shadow-sm ring-1 ring-slate-900/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Sesiones de Clase
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900">
              {totalSchedules}
            </span>
            <span className="text-xs text-slate-500 font-medium">sesiones</span>
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Período Académico */}
      <div className="bg-white p-5 rounded-2xl border-t-4 border-t-blue-600 shadow-sm ring-1 ring-slate-900/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
          <Clock className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Período Académico
          </span>
          <p className="text-xs font-bold font-mono tabular-nums text-slate-800 mt-1 truncate">
            {estimatedStartDate ? formatDate(estimatedStartDate) : '--'} al{' '}
            {estimatedEndDate ? formatDate(estimatedEndDate) : '--'}
          </p>
        </div>
      </div>

      {/* Tarjeta 4: Estado de Activación */}
      <div
        className={`p-5 rounded-2xl border-t-4 shadow-sm ring-1 ring-slate-900/5 flex items-center gap-4 ${
          hasErrors
            ? 'bg-white border-t-rose-500'
            : canActivate
            ? 'bg-white border-t-emerald-500'
            : 'bg-white border-t-amber-500'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            hasErrors
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : canActivate
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {hasErrors ? (
            <AlertCircle className="w-6 h-6" />
          ) : canActivate ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Aptitud de Activación
          </span>
          <span
            className={`text-sm font-extrabold block mt-0.5 ${
              hasErrors
                ? 'text-rose-700'
                : canActivate
                ? 'text-emerald-700'
                : 'text-amber-700'
            }`}
          >
            {hasErrors
              ? 'Inconsistencias'
              : canActivate
              ? 'Listo para Activar'
              : 'Datos Incompletos'}
          </span>
        </div>
      </div>
    </div>
  );
};

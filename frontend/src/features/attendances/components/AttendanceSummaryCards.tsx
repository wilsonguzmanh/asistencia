'use client';

import React from 'react';
import { AttendanceSummaryMetrics } from '../types/attendance.types';
import {
  CheckCircle2,
  XCircle,
  CalendarDays,
  Percent,
} from 'lucide-react';

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummaryMetrics;
}

export function AttendanceSummaryCards({ summary }: AttendanceSummaryCardsProps) {
  const percentage = summary.attendancePercentage ?? 0;

  // Semáforo de porcentaje con borde superior temático
  const getPercentageTheme = (pct: number) => {
    if (pct >= 80) {
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        topBorder: 'border-t-emerald-500',
        bar: 'bg-emerald-500',
        label: 'Aprobado',
      };
    }
    if (pct >= 70) {
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        topBorder: 'border-t-amber-500',
        bar: 'bg-amber-500',
        label: 'En riesgo',
      };
    }
    return {
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      topBorder: 'border-t-rose-500',
      bar: 'bg-rose-500',
      label: 'Insuficiente',
    };
  };

  const statusTheme = getPercentageTheme(percentage);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Tarjeta % Asistencia */}
      <div className={`bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 border-t-4 ${statusTheme.topBorder} transition-all`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            % Asistencia
          </span>
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-extrabold font-mono tabular-nums ${statusTheme.text}`}>
            {percentage.toFixed(1)}%
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusTheme.bg} ${statusTheme.text} border ${statusTheme.border}`}>
            {statusTheme.label}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${statusTheme.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      </div>

      {/* 2. Tarjeta Presentes */}
      <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 border-t-4 border-t-emerald-500 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Asistencias
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
            {summary.attendedCount}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {summary.attendedCount === 1 ? 'clase asistida' : 'clases asistidas'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          Marcaciones registradas en horario
        </p>
      </div>

      {/* 3. Tarjeta Faltas */}
      <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 border-t-4 border-t-rose-500 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Inasistencias
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
            {summary.absentCount}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {summary.absentCount === 1 ? 'falta acumulada' : 'faltas acumuladas'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          Sesiones no registradas en horario
        </p>
      </div>

      {/* 4. Tarjeta Progreso del Calendario */}
      <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 border-t-4 border-t-indigo-600 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Progreso Módulo
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
            {summary.pastClasses}
          </span>
          <span className="text-xs font-medium text-slate-500">
            de {summary.totalClasses} clases
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          {summary.totalClasses - summary.pastClasses} clases futuras programadas
        </p>
      </div>
    </div>
  );
}

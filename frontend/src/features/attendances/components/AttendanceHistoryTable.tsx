'use client';

import React from 'react';
import { ClassSessionHistoryItem } from '../types/attendance.types';
import { formatDate } from '../../../lib/utils';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';

interface AttendanceHistoryTableProps {
  sessions: ClassSessionHistoryItem[];
}

export function AttendanceHistoryTable({ sessions }: AttendanceHistoryTableProps) {
  const formatTime = (timeString?: string | Date | null) => {
    if (!timeString) return '—';
    if (typeof timeString === 'string' && timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    return String(timeString);
  };

  const getStatusBadge = (status: ClassSessionHistoryItem['status']) => {
    switch (status) {
      case 'PRESENTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Presente
          </span>
        );
      case 'FALTA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Inasistencia
          </span>
        );
      case 'PENDIENTE_HOY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pendiente (Hoy)
          </span>
        );
      case 'PROGRAMADA':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Programada
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border-t-4 border-t-slate-800 shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Cronograma de Clases y Registro de Asistencias
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Registro cronológico oficial del módulo. Las clases concluidas sin marcación se computan como inasistencia.
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
          Total: {sessions.length} sesiones
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <th className="py-3.5 px-6">Fecha de Clase</th>
              <th className="py-3.5 px-6">Horario</th>
              <th className="py-3.5 px-6">Estado</th>
              <th className="py-3.5 px-6">Hora de Marcación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500 font-medium">
                  No hay clases registradas en este módulo académico.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-emerald-600" />
                      <span className="font-mono tabular-nums">{formatDate(session.classDate)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-700">
                    <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(session.status)}
                  </td>
                  <td className="py-4 px-6 text-xs font-mono tabular-nums text-slate-700 font-medium">
                    {formatTime(session.markedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

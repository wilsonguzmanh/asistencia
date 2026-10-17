'use client';

import React from 'react';
import { ScheduleRow } from '../types/schedule-import.types';
import { CalendarDays, CalendarCheck, Clock, CheckCircle2 } from 'lucide-react';

interface SchedulesTablePreviewProps {
  schedules: ScheduleRow[];
}

export const SchedulesTablePreview: React.FC<SchedulesTablePreviewProps> = ({
  schedules,
}) => {
  if (!schedules || schedules.length === 0) return null;

  const formatDate = (isoDate: string): string => {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  };

  const startDate = schedules[0]?.classDate;
  const endDate = schedules[schedules.length - 1]?.classDate;

  return (
    <div className="w-full space-y-5">
      {/* Tarjetas KPI de Resumen del Calendario con Top Accents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border-t-4 border-t-indigo-600 shadow-sm ring-1 ring-slate-900/5 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total de Clases</p>
            <p className="text-2xl font-extrabold font-mono tabular-nums text-slate-900">
              {schedules.length} <span className="text-xs font-semibold text-slate-500 font-sans">Sesiones</span>
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border-t-4 border-t-emerald-500 shadow-sm ring-1 ring-slate-900/5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fecha de Inicio</p>
            <p className="text-xl font-extrabold font-mono tabular-nums text-slate-900">
              {startDate ? formatDate(startDate) : '-'}
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border-t-4 border-t-blue-600 shadow-sm ring-1 ring-slate-900/5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fecha de Conclusión</p>
            <p className="text-xl font-extrabold font-mono tabular-nums text-slate-900">
              {endDate ? formatDate(endDate) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla Cronológica */}
      <div className="bg-white rounded-2xl border-t-4 border-t-emerald-500 overflow-hidden shadow-sm ring-1 ring-slate-900/5">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Calendario Cronológico Validado
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Fechas oficiales ordenadas cronológicamente para la marcación de asistencia de los estudiantes.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
            {schedules.length} Fechas Verificadas
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider sticky top-0">
              <tr>
                <th className="px-5 py-3.5 text-center w-16">Sesión #</th>
                <th className="px-5 py-3.5">Fecha de Clase</th>
                <th className="px-5 py-3.5">Horario Oficial</th>
                <th className="px-5 py-3.5">Ventana de Marcación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((item, idx) => (
                <tr
                  key={item.classDate}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-5 py-3.5 text-center text-slate-400 font-mono font-bold">
                    {idx + 1}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 font-mono tabular-nums">
                      {formatDate(item.classDate)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-mono tabular-nums font-semibold">
                    {item.startTime} — {item.endTime}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md text-[11px] font-medium border border-emerald-200">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      Jornada completa (00:00 - 23:59)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

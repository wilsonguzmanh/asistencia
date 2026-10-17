'use client';

import React from 'react';
import { RowValidationError } from '../types/module-import.types';

interface ScheduleErrorsTableProps {
  errors: RowValidationError[];
}

export const ScheduleErrorsTable: React.FC<ScheduleErrorsTableProps> = ({
  errors,
}) => {
  if (!errors || errors.length === 0) return null;

  const translateField = (field: string): string => {
    switch (field) {
      case 'classDate':
        return 'Fecha de clase';
      case 'startTime':
        return 'Hora de inicio';
      case 'endTime':
        return 'Hora de fin';
      default:
        return field;
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-rose-200 overflow-hidden shadow-sm">
      <div className="bg-rose-50/80 px-6 py-4 border-b border-rose-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-900">
              Se encontraron {errors.length} errores en el calendario de clases
            </h3>
            <p className="text-xs text-rose-700 mt-0.5">
              Corrija las filas indicadas para habilitar la programación del
              módulo.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-rose-200 text-rose-800 text-xs font-semibold rounded-full">
          Rechazado
        </span>
      </div>

      <div className="overflow-x-auto max-h-80">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider sticky top-0">
            <tr>
              <th className="px-4 py-3 text-center">Fila Excel</th>
              <th className="px-4 py-3">Columna</th>
              <th className="px-4 py-3">Valor Detectado</th>
              <th className="px-4 py-3">Motivo del Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {errors.map((err, idx) => (
              <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-slate-900 text-center">
                  Fila {err.row}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {translateField(err.field)}
                </td>
                <td className="px-4 py-3 text-slate-600 font-mono">
                  {err.value ? (
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-700 border border-slate-200">
                      {String(err.value)}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">(Vacío)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-rose-700 font-medium">
                  {err.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

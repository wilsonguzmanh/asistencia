'use client';

import React from 'react';
import { useAttendanceCheckIn } from '../hooks/useAttendanceCheckIn';
import { formatDate } from '../../../lib/utils';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarOff,
  ShieldCheck,
  Loader2,
  Check,
  Building2,
} from 'lucide-react';

interface TodayClassCardProps {
  moduleName?: string;
  moduleCode?: string;
}

export function TodayClassCard({
  moduleName = 'Módulo Activo',
  moduleCode = '',
}: TodayClassCardProps) {
  const {
    data,
    isLoading,
    isSubmitting,
    successMessage,
    errorMessage,
    executeCheckIn,
  } = useAttendanceCheckIn();

  const handleCheckIn = async () => {
    try {
      await executeCheckIn();
    } catch {
      // Error gestionado en el hook
    }
  };

  const formatTime = (timeString?: string | Date | null) => {
    if (!timeString) return '';
    if (typeof timeString === 'string' && timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return String(timeString);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-300/40 border border-slate-200/90 border-t-4 border-t-emerald-500 overflow-hidden transition-all">
      {/* Header institucional de la tarjeta */}
      <div className="bg-slate-900 p-6 sm:p-7 text-white border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono font-bold tracking-wider uppercase border border-slate-700 text-emerald-400">
            {moduleCode || 'Módulo Activo'}
          </span>
          <span className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Módulo Oficial en Curso</span>
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold leading-snug text-white mt-1">{moduleName}</h2>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Banner de Éxito */}
        {successMessage && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start space-x-3 shadow-2xs"
          >
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-900">{successMessage}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Tu asistencia ha sido auditada y almacenada de forma inmutable en el sistema.
              </p>
            </div>
          </div>
        )}

        {/* Banner de Error */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3 shadow-2xs"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Estado de carga */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Verificando calendario de clases oficial...</p>
          </div>
        ) : data?.hasClassToday ? (
          /* Hay clase programada hoy */
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                  Sesión Programada Hoy
                </span>
                <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <CalendarDays className="w-4 h-4 text-slate-500" />
                  <span className="font-mono">{formatDate(data.classSchedule?.classDate || '')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Horario: {data.classSchedule?.startTime} a {data.classSchedule?.endTime}</span>
                </div>
              </div>

              <div className="self-start sm:self-auto">
                {data.alreadyMarked ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Presente</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pendiente de Marcación</span>
                  </span>
                )}
              </div>
            </div>

            {/* Botón de Marcación Dinámico */}
            {data.alreadyMarked ? (
              <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-1 border border-emerald-200 shadow-2xs">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Asistencia Ya Registrada
                </h3>
                <p className="text-xs text-slate-600 font-mono">
                  Marcada a las {formatTime(data.attendance?.markedAt)}
                </p>
                <div className="w-full mt-2 py-3 px-4 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl border border-slate-200">
                  Marca Registrada para Esta Sesión
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleCheckIn}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base rounded-2xl shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                      <span>Guardando marca en base de datos...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Registrar Mi Asistencia Ahora</span>
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Solo se permite una marcación válida por estudiante por sesión de clase.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* No hay clase programada hoy (RN-04) */
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-500 mb-1 border border-slate-200">
              <CalendarOff className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Hoy no hay clase programada
              </h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto mt-1">
                La marcación sólo está habilitada en días hábiles de clase fijados en el calendario académico oficial.
              </p>
            </div>

            {data?.nextScheduledClass && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 inline-flex items-center gap-2 font-mono">
                <CalendarDays className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Próxima clase programada:</strong>{' '}
                  {formatDate(data.nextScheduledClass.classDate)} ({data.nextScheduledClass.startTime} a {data.nextScheduledClass.endTime})
                </span>
              </div>
            )}

            <div className="w-full py-3.5 px-4 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl border border-slate-200">
              Botón de Marcación Deshabilitado (Fuera de Calendario)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

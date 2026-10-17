'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStudentAuth } from '@/features/auth/hooks/useStudentAuth';
import { useAttendanceHistory } from '@/features/attendances/hooks/useAttendanceHistory';
import { AttendanceSummaryCards } from '@/features/attendances/components/AttendanceSummaryCards';
import { AttendanceHistoryTable } from '@/features/attendances/components/AttendanceHistoryTable';
import {
  GraduationCap,
  CalendarCheck,
  History,
  LogOut,
  Loader2,
  AlertCircle,
  RefreshCw,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';

export default function HistorialPage() {
  const router = useRouter();
  const { student, isLoading: isAuthLoading, logout } = useStudentAuth();
  const { history, isLoading: isHistoryLoading, errorMessage, refreshHistory } =
    useAttendanceHistory();

  useEffect(() => {
    if (!isAuthLoading && !student) {
      router.push('/login');
    }
  }, [isAuthLoading, student, router]);

  if (isAuthLoading || !student) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-sm font-medium text-slate-300">
            Cargando expediente del estudiante...
          </span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col relative transition-colors">
      {/* Fondo texturizado institucional (Lienzo Pizarra) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* 1. Barra de navegación superior (Navy Framing) */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">
                {student.fullName}
              </h1>
              <p className="text-xs text-slate-300">
                Matrícula:{' '}
                <strong className="text-emerald-400 font-mono font-bold">
                  {student.registrationNumber}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/asistencia"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Marcación Hoy</span>
            </Link>
            <Link
              href="/historial"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-xs cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Mi Historial</span>
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/60 border border-transparent hover:border-rose-900 transition ml-1 cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Contenido principal */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2 shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>{student.module?.code} • {student.module?.name}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Historial de Asistencia Personal
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Consulta el balance consolidado de clases asistidas, faltas registradas y porcentaje acumulado de asistencia.
            </p>
          </div>

          <button
            onClick={refreshHistory}
            disabled={isHistoryLoading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isHistoryLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar Registro</span>
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start space-x-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {isHistoryLoading && !history ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium text-slate-600">
              Calculando asistencias y cronograma oficial...
            </p>
          </div>
        ) : history ? (
          <div className="space-y-8 animate-fade-in">
            {/* Tarjetas de Resumen Superior */}
            <AttendanceSummaryCards summary={history.summary} />

            {/* Tabla Detallada de Clases */}
            <AttendanceHistoryTable sessions={history.sessions} />
          </div>
        ) : null}
      </main>

      {/* 3. Pie Institucional (Navy Framing) */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Dirección de Postgrado • Módulo Activo: {student.module?.code || 'En curso'}</span>
          </div>
          <span>Registro inmutable auditado con fecha y hora exacta.</span>
        </div>
      </footer>
    </div>
  );
}

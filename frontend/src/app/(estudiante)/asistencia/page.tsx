'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStudentAuth } from '@/features/auth/hooks/useStudentAuth';
import { TodayClassCard } from '@/features/attendances/components/TodayClassCard';
import {
  GraduationCap,
  CalendarCheck,
  History,
  LogOut,
  Loader2,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export default function AsistenciaPage() {
  const router = useRouter();
  const { student, isLoading, logout } = useStudentAuth();

  useEffect(() => {
    if (!isLoading && !student) {
      router.push('/login');
    }
  }, [isLoading, student, router]);

  if (isLoading || !student) {
    return (
      <main className="min-h-screen bg-slate-100/85 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-700">
            Cargando sesión del estudiante...
          </span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/85 text-slate-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
      {/* Textura sutil geométrica */}
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-xs cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Marcación Hoy</span>
            </Link>
            <Link
              href="/historial"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
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
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Control de Asistencia Diario</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Marcación de Asistencia en Tiempo Real
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            Verifique la sesión de clase activa y presione el botón para registrar su asistencia en el sistema.
          </p>
        </div>

        <TodayClassCard
          moduleName={student.module?.name}
          moduleCode={student.module?.code}
        />
      </main>

      {/* 3. Pie Institucional */}
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

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/services/auth.service';
import { AuthUser } from '@/features/auth/types/auth.types';
import { LogoutConfirmButton } from '@/features/auth/components/LogoutConfirmButton';
import { ModuleImportService } from '@/features/modules/services/module-import.service';
import {
  Building2,
  Users,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  UserCheck,
  FileSpreadsheet,
  Clock,
  ChevronRight,
  Loader2,
  PlusCircle,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeModule, setActiveModule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const token = authService.getStoredToken();

    if (!token) {
      router.push('/admin/login');
      return;
    }

    setUser(storedUser);
    setIsLoading(false);

    // Cargar módulo activo desde la API
    ModuleImportService.getActiveModule(token).then((mod) => {
      if (mod) setActiveModule(mod);
    });
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-sm font-medium text-slate-300">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/85 text-slate-900 flex flex-col relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Fondo texturizado institucional (Lienzo Pizarra) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.45] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* 1. Barra de navegación superior (Navy Framing) */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-indigo-500 transition-colors">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block leading-tight">
                  Control de Asistencia
                </span>
                <span className="text-[11px] text-slate-300 block leading-tight">
                  Panel de Administración
                </span>
              </div>
            </Link>

            {/* Enlaces de navegación principal */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              <Link
                href="/admin/dashboard"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-xs"
              >
                Panel General
              </Link>
              <Link
                href="/admin/estudiantes"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Directorio de Alumnos
              </Link>
              <Link
                href="/admin/asistencias"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Matriz de Asistencias
              </Link>
              <Link
                href="/admin/auditoria"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Bitácora de Auditoría
              </Link>
              <Link
                href="/admin/modulo/importar"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Configurar Módulo
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight">
                {user?.username || 'Coordinador'}
              </span>
              <span className="text-[11px] text-slate-300 font-mono leading-tight">
                {user?.email || 'admin@sistema.com'}
              </span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
              Coordinación
            </span>
            <LogoutConfirmButton
              role="ADMIN"
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg border border-transparent hover:border-rose-900 transition flex items-center gap-1.5 cursor-pointer"
            />
          </div>
        </div>
      </header>

      {/* 2. Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 relative z-10">
        {/* Banner Institucional Superior */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-200 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Sesión Institucional Activa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Panel de Gestión Académica y Asistencia
            </h1>
            <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
              Supervise el módulo activo en curso, consulte la nómina de estudiantes matriculados o inicie el asistente para configurar una nueva programación académica.
            </p>
          </div>
        </div>

        {/* Módulo Activo Actual */}
        {activeModule ? (
          <div className="rounded-2xl bg-white border-t-4 border-t-indigo-600 p-6 sm:p-8 shadow-sm ring-1 ring-slate-900/5 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Módulo Activo en Sistema
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {activeModule.code}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {activeModule.name}
                  </h3>
                  <div className="flex flex-wrap gap-5 text-xs text-slate-600 mt-3 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Estudiantes matriculados: <strong className="font-mono tabular-nums text-slate-900">{activeModule.students?.length ?? 0}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-emerald-600" />
                      Sesiones de clase: <strong className="font-mono tabular-nums text-slate-900">{activeModule.schedules?.length ?? 0}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Período: <strong className="font-mono tabular-nums text-slate-900">{activeModule.startDate}</strong> al <strong className="font-mono tabular-nums text-slate-900">{activeModule.endDate}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                <Link
                  href="/admin/estudiantes"
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Ver Nómina de Alumnos</span>
                </Link>
                <Link
                  href="/admin/modulo/importar"
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Configurar Nuevo Módulo</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border-t-4 border-t-amber-500 p-8 shadow-sm ring-1 ring-slate-900/5 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3 border border-amber-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No hay un módulo académico activo</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              Utilice el asistente de configuración para importar la nómina de alumnos y el calendario de clases.
            </p>
            <Link
              href="/admin/modulo/importar"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Iniciar Asistente de Configuración</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Sección de Asistente de Configuración (3 Pasos Oficiales) */}
        <div className="rounded-2xl bg-white border-t-4 border-t-slate-800 p-6 sm:p-8 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                Operaciones Académicas
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                Asistente de Carga y Activación de Módulo
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Flujo guiado en 3 fases para importar nómina de alumnos, calendario de clases y activar el módulo académico.
              </p>
            </div>

            <Link
              href="/admin/modulo/importar"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Iniciar Asistente Completo</span>
            </Link>
          </div>

          {/* Tarjetas de los 3 pasos con Top Accent Bands */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {/* Paso 1 */}
            <Link
              href="/admin/modulo/importar"
              className="group p-5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50/70 hover:bg-white transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                    1
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                    Paso 1
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition">
                  Nómina de Estudiantes
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Carga masiva y validación del archivo oficial Excel con los datos y matrícula de los estudiantes.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ir al Paso 1 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Paso 2 */}
            <Link
              href="/admin/modulo/importar/fechas"
              className="group p-5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-white transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
                    2
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                    Paso 2
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                  Calendario y Horarios
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Importación cronológica de sesiones de clase, rangos de fechas y horarios de inicio y conclusión.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ir al Paso 2 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Paso 3 */}
            <Link
              href="/admin/modulo/preview"
              className="group p-5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50/70 hover:bg-white transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                    3
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                    Paso 3
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition">
                  Vista Previa y Activación
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Revisión integral de datos consolidados y activación oficial en el sistema con preservación histórica.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ir al Paso 3 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* Módulos de Operación y Auditoría */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 border-t-4 border-t-indigo-600 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 border border-indigo-200">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Directorio de Alumnos</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Consulte la nómina completa de estudiantes matriculados en el módulo activo, con filtro de búsqueda en tiempo real por nombre y número de matrícula.
              </p>
            </div>
            <Link
              href="/admin/estudiantes"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition"
            >
              <span>Abrir Directorio de Alumnos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 border-t-4 border-t-emerald-500 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Control de Asistencia</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Supervisión del registro diario de asistencia de los estudiantes durante cada sesión programada con cálculo automático de asistencias y faltas.
              </p>
            </div>
            <Link
              href="/admin/asistencias"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition"
            >
              <span>Abrir Matriz de Asistencias</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 border-t-4 border-t-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 border border-slate-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Integridad y Auditoría</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Transacciones protegidas con registro histórico inmutable. Cada activación de módulo y registro de asistencia queda auditado en la base de datos.
              </p>
            </div>
            <Link
              href="/admin/auditoria"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
            >
              <span>Ver Bitácora de Auditoría</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* 3. Pie Institucional (Navy Framing) */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Dirección de Postgrado • Sistema Institucional de Control de Asistencia</span>
          </div>
          <span>Sesión administrativa protegida con cifrado institucional.</span>
        </div>
      </footer>
    </div>
  );
}

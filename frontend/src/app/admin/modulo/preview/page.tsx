'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useModuleImportWizard } from '@/features/modules/hooks/useModuleImportWizard';
import { ModuleMetadataForm } from '@/features/modules/components/ModuleMetadataForm';
import { ModulePreviewSummaryCards } from '@/features/modules/components/ModulePreviewSummaryCards';
import { ModulePreviewTabs } from '@/features/modules/components/ModulePreviewTabs';
import { ActivationModalConfirmation } from '@/features/modules/components/ActivationModalConfirmation';
import {
  Building2,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowRight,
} from 'lucide-react';

export default function ModulePreviewPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const {
    metadata,
    setMetadata,
    students,
    schedules,
    studentErrors,
    scheduleErrors,
    estimatedStartDate,
    estimatedEndDate,
    hasErrors,
    isFormComplete,
    canActivate,
    isConfirmationOpen,
    setIsConfirmationOpen,
    isActivating,
    activationSuccess,
    activatedModuleData,
    errorMessage,
    activateModule,
  } = useModuleImportWizard();

  useEffect(() => {
    const storedToken =
      localStorage.getItem('admin_token') ||
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('admin_token='))
        ?.split('=')[1];

    if (!storedToken) {
      router.push('/admin/login');
      return;
    }
    setToken(storedToken);
  }, [router]);

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
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/admin/modulo/importar/fechas"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Volver al Paso 2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Paso 2: Calendario</span>
            </Link>

            <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block leading-tight">
                  Configuración de Módulo
                </span>
                <span className="text-[10px] text-slate-300 block leading-tight">
                  Asistente de Carga • Fase 3 de 3
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xs">
              <span>Paso 3 de 3: Activación</span>
            </span>
            <Link
              href="/admin/dashboard"
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Salir
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Contenido principal */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 relative z-10">
        {/* Cabecera del Asistente */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Paso 3: Validación Consolidada</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Vista Previa y Activación del Módulo
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Revise la nómina consolidada y el cronograma de clases antes de confirmar la activación del ciclo académico.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/modulo/importar"
              className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition"
            >
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                ✓
              </span>
              <span className="text-xs font-semibold text-slate-700">Estudiantes</span>
            </Link>
            <span className="text-slate-300">→</span>
            <Link
              href="/admin/modulo/importar/fechas"
              className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition"
            >
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                ✓
              </span>
              <span className="text-xs font-semibold text-slate-700">Calendario</span>
            </Link>
            <span className="text-slate-300">→</span>
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                3
              </span>
              <span className="text-xs font-bold text-indigo-700">Activación</span>
            </div>
          </div>
        </div>

        {/* Notificación de Éxito al Activar */}
        {activationSuccess && (
          <div className="p-6 bg-emerald-50 rounded-2xl border-t-4 border-t-emerald-600 border border-emerald-200 text-emerald-950 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300 mt-0.5">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-extrabold text-emerald-950">
                  ¡Módulo Académico Activado Exitosamente!
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  El módulo &quot;{activatedModuleData?.name || metadata.name}&quot; (
                  <span className="font-mono font-bold text-emerald-950">
                    {activatedModuleData?.code || metadata.code}
                  </span>
                  ) ha quedado habilitado como el módulo activo oficial del sistema para el registro de asistencias.
                </p>
                <div className="text-xs text-emerald-900 font-semibold pt-1 flex flex-wrap gap-4">
                  <span>Estudiantes matriculados: <strong className="font-mono tabular-nums">{activatedModuleData?.studentsCount ?? students.length}</strong></span>
                  <span>Clases programadas: <strong className="font-mono tabular-nums">{activatedModuleData?.schedulesCount ?? schedules.length}</strong></span>
                  <span>Vigencia: <strong className="font-mono tabular-nums">{activatedModuleData?.startDate || estimatedStartDate}</strong> al <strong className="font-mono tabular-nums">{activatedModuleData?.endDate || estimatedEndDate}</strong></span>
                </div>
                {activatedModuleData?.archivedPreviousModuleInfo && (
                  <div className="mt-3 p-3 bg-emerald-100/80 rounded-xl border border-emerald-300 text-emerald-950 text-xs flex items-center gap-2">
                    <Archive className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span><strong>Preservación Histórica:</strong> {activatedModuleData.archivedPreviousModuleInfo}.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Ir al Panel de Administración</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Mensaje de Error si aplica */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-semibold flex items-center gap-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Advertencia si no hay datos cargados */}
        {students.length === 0 && schedules.length === 0 && (
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                No se encontraron datos cargados en la sesión. Comience cargando la nómina de estudiantes y el calendario de clases.
              </span>
            </div>
            <Link
              href="/admin/modulo/importar"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs whitespace-nowrap transition-all shadow-xs"
            >
              Iniciar en Paso 1
            </Link>
          </div>
        )}

        {/* Formulario de Metadatos del Módulo */}
        <ModuleMetadataForm
          metadata={metadata}
          onChange={setMetadata}
          disabled={activationSuccess}
        />

        {/* Tarjetas Resumen KPI */}
        <ModulePreviewSummaryCards
          totalStudents={students.length}
          totalSchedules={schedules.length}
          estimatedStartDate={estimatedStartDate}
          estimatedEndDate={estimatedEndDate}
          canActivate={canActivate}
          hasErrors={hasErrors}
        />

        {/* Pestañas de Visualización de Nómina y Cronograma */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border-t-4 border-t-slate-800 shadow-sm ring-1 ring-slate-900/5">
          <ModulePreviewTabs
            students={students}
            schedules={schedules}
            studentErrors={studentErrors}
            scheduleErrors={scheduleErrors}
          />
        </div>

        {/* Barra de Acciones de Activación */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
          <Link
            href="/admin/modulo/importar/fechas"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Paso 2 (Calendario)</span>
          </Link>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            {!canActivate && (
              <span className="text-xs text-rose-600 font-semibold text-center sm:text-right">
                {hasErrors
                  ? 'Debe corregir las inconsistencias antes de activar.'
                  : !isFormComplete
                  ? 'Complete el nombre, código y cargue ambos archivos.'
                  : ''}
              </span>
            )}

            <button
              type="button"
              disabled={!canActivate || activationSuccess}
              onClick={() => setIsConfirmationOpen(true)}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm shadow-xs transition-all ${
                canActivate && !activationSuccess
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Activar Módulo Académico</span>
            </button>
          </div>
        </div>

        {/* Modal de Confirmación */}
        <ActivationModalConfirmation
          isOpen={isConfirmationOpen}
          metadata={metadata}
          totalStudents={students.length}
          totalSchedules={schedules.length}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={() => activateModule(token || undefined)}
          isSubmitting={isActivating}
        />
      </main>

      {/* 3. Pie Institucional (Navy Framing) */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Dirección de Postgrado • Asistente de Configuración de Módulos</span>
          </div>
          <span>La activación establece la nómina inmutable y el cronograma del ciclo activo.</span>
        </div>
      </footer>
    </div>
  );
}

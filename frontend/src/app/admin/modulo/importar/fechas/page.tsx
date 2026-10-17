'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileDropzone } from '@/features/modules/components/FileDropzone';
import { ScheduleErrorsTable } from '@/features/modules/components/ScheduleErrorsTable';
import { SchedulesTablePreview } from '@/features/modules/components/SchedulesTablePreview';
import { ModuleImportService } from '@/features/modules/services/module-import.service';
import { RowValidationError } from '@/features/modules/types/module-import.types';
import { ScheduleRow } from '@/features/modules/types/schedule-import.types';
import {
  Building2,
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function ImportarFechasPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorsList, setErrorsList] = useState<RowValidationError[]>([]);
  const [validSchedules, setValidSchedules] = useState<ScheduleRow[]>([]);

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

  const handleFileSelected = async (file: File) => {
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);
    setErrorsList([]);
    setValidSchedules([]);

    const response = await ModuleImportService.importSchedules(file, token);
    setIsLoading(false);

    if (!response.success) {
      setErrorMessage(response.message);
      if (response.errorData && response.errorData.errors) {
        setErrorsList(response.errorData.errors);
      }
    } else if (response.data) {
      setValidSchedules(response.data.schedules);
      sessionStorage.setItem(
        'pending_schedules_import',
        JSON.stringify(response.data.schedules),
      );
    }
  };

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
              href="/admin/modulo/importar"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Volver al Paso 1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Paso 1: Estudiantes</span>
            </Link>

            <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block leading-tight">
                  Configuración de Módulo
                </span>
                <span className="text-[10px] text-slate-300 block leading-tight">
                  Asistente de Carga • Fase 2 de 3
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs">
              <span>Paso 2 de 3: Calendario</span>
            </span>
          </div>
        </div>
      </header>

      {/* 2. Contenido principal */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 relative z-10">
        {/* Cabecera del Asistente */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paso 2: Cronograma de Sesiones</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Importar Fechas y Horarios de Clase
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Cargue la planilla Excel con el cronograma y los horarios oficiales de cada sesión académica.
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
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                2
              </span>
              <span className="text-xs font-bold text-indigo-700">Calendario</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className="flex items-center gap-1.5 opacity-50">
              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-medium text-slate-500">Activación</span>
            </div>
          </div>
        </div>

        {/* Guía de Requisitos del Archivo */}
        <div className="bg-white p-6 rounded-2xl border-t-4 border-t-emerald-600 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Estructura Oficial del Archivo Excel de Calendario</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            El archivo debe contener exactamente las siguientes 3 columnas en la primera fila:
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1">1. Fecha de Clase</span>
              <span className="text-slate-600 text-[11px] leading-relaxed block">
                Formato DD/MM/YYYY. Define las jornadas en las que se computará la asistencia de los alumnos.
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1">
                2. Hora de Inicio
              </span>
              <span className="text-slate-600 text-[11px] leading-relaxed block">
                Formato de 24 horas (ej. 18:30). Horario oficial de inicio de la sesión.
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1">
                3. Hora de Conclusión
              </span>
              <span className="text-slate-600 text-[11px] leading-relaxed block">
                Formato de 24 horas (ej. 21:30). Horario oficial de cierre de la sesión.
              </span>
            </div>
          </div>
        </div>

        {/* Zona de Carga de Archivo */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm ring-1 ring-slate-900/5">
          <FileDropzone
            onFileSelected={handleFileSelected}
            isLoading={isLoading}
            title="Seleccionar archivo de fechas y horarios (.xlsx, .xls)"
            subtitle="Arrastre el archivo Excel de calendario o haga clic para examinar"
          />

          {isLoading && (
            <div className="mt-6 flex items-center justify-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-sm font-semibold">
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
              <span>Validando fechas, horarios y coherencia cronológica...</span>
            </div>
          )}
        </div>

        {/* Errores */}
        {errorsList.length > 0 && (
          <ScheduleErrorsTable errors={errorsList} />
        )}

        {/* Mensaje de Error General */}
        {errorMessage && errorsList.length === 0 && !isLoading && (
          <div
            role="alert"
            className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-sm flex items-center gap-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Vista previa de fechas válidas */}
        {validSchedules.length > 0 && (
          <div className="space-y-6">
            <SchedulesTablePreview schedules={validSchedules} />

            {/* Botón de Siguiente Paso */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <Link
                href="/admin/modulo/importar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Paso 1 (Estudiantes)</span>
              </Link>

              <Link
                href="/admin/modulo/preview"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Continuar a Paso 3: Vista Previa y Activación</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* 3. Pie Institucional (Navy Framing) */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Dirección de Postgrado • Asistente de Configuración de Módulos</span>
          </div>
          <span>Los horarios programados estructuran las jornadas oficiales del módulo académico.</span>
        </div>
      </footer>
    </div>
  );
}

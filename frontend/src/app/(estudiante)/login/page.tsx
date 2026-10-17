import Link from 'next/link';
import { StudentLoginForm } from '@/features/auth/components/StudentLoginForm';
import { Building2, ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Acceso de Estudiantes | Control de Asistencia',
  description: 'Portal de registro e historial de asistencia para estudiantes de postgrado',
};

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen bg-slate-100/85 text-slate-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
      {/* Patrón de textura geométrica sutil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.45] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* Halos ambientales suaves */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* 1. Barra Superior Institucional (Navy Framing) */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg px-1 py-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-emerald-500 transition-colors">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-tight text-white block leading-tight">
                Control de Asistencia
              </span>
              <span className="text-[10px] text-slate-300 block leading-tight">
                Portal de Estudiantes
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </header>

      {/* 2. Formulario Centrado */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 flex items-center justify-center relative z-10">
        <StudentLoginForm />
      </main>

      {/* 3. Pie Institucional */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acceso Seguro y Verificado para Alumnos Matriculados</span>
          </span>
          <span>© 2026 Dirección de Postgrado. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}

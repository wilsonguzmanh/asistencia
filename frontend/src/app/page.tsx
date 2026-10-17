import Link from 'next/link';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  CalendarDays,
  Building2,
  BookOpen,
  ChevronRight,
  Fingerprint,
} from 'lucide-react';

export const metadata = {
  title: 'Control de Asistencia Académica | Dirección de Postgrado',
  description:
    'Plataforma oficial para el registro, verificación e historial de asistencias académicas en programas de postgrado y educación continua.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100/85 text-slate-900 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
      {/* Patrón de textura geométrica sutil para romper la monotonía blanca */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.5] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* Halos ambientales en esquinas para calidez cromática */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 -left-32 w-96 h-96 bg-emerald-200/35 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* 1. Barra Superior Institucional (Azul Marino Profundo para Autoridad y Enmarcado) */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-indigo-400/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block leading-tight">
                Control de Asistencia
              </span>
              <span className="text-[11px] font-medium text-slate-300 block leading-tight">
                Dirección de Postgrado & Educación Continua
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-200 font-medium">
              <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ciclo Académico 2026</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistema Operativo</span>
            </span>
          </div>
        </div>
      </header>

      {/* 2. Contenido Principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 relative z-10">
        {/* Sección Hero: Dos Columnas con Presentación + Widget Demostrativo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: Mensaje Central */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold shadow-xs">
              <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
              <span>Plataforma Oficial de Verificación Curricular</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Registro y Control de Asistencia{' '}
              <span className="text-indigo-600 underline decoration-indigo-300 underline-offset-4">
                en Tiempo Real
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              Plataforma institucional para el registro transparente de asistencia a clases de postgrado, consulta de regularidad e historial auditado por sesión.
            </p>

            {/* Micro-puntos de valor con contraste elevado */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-white border border-slate-200/90 px-3.5 py-3 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Digital</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-white border border-slate-200/90 px-3.5 py-3 rounded-xl shadow-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Auditoría Inmutable</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-white border border-slate-200/90 px-3.5 py-3 rounded-xl shadow-xs">
                <Fingerprint className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Sin Contraseñas</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Widget Demostrativo con Marco Destacado */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-300/40 p-6 space-y-5 relative">
              {/* Encabezado del Widget */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    LIVE
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Demostración en Vivo</span>
                    <span className="text-[10px] text-slate-500 font-medium">Módulo Académico Activo</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                  MOD-2026-02
                </span>
              </div>

              {/* Tarjeta de Sesión Hoy */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Sesión de Clase
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Habilitada Hoy
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  Infraestructura como Código (IaC) & DevOps
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    19:00 - 22:00
                  </span>
                  <span>•</span>
                  <span>Aula Virtual Principal</span>
                </div>
              </div>

              {/* Estado de regularidad simulada */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Regularidad del módulo:</span>
                  <span className="text-emerald-700 font-bold">94% Asistencia Promedio</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-[94%]" />
                </div>
              </div>

              {/* Botón de marcación rápida hacia el login de estudiantes */}
              <Link
                href="/login"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Probar Marcación del Alumno</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Matriz de Accesos Principales (Con Banda de Color Superior para Enmarcar) */}
        <div className="space-y-5 pt-2">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Puntos de Entrada al Sistema
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Seleccione su perfil institucional para acceder al servicio correspondiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta 1: Portal de Estudiantes (Banda Esmeralda Superior) */}
            <Link
              href="/login"
              className="group relative p-7 rounded-3xl bg-white border border-slate-200/90 border-t-4 border-t-emerald-500 hover:border-emerald-500 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-200 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-150 shadow-xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
                    Acceso Rápido en Aula
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  Portal de Estudiantes
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  Ingreso sin contraseña mediante número de matrícula o correo institucional para registrar asistencia del día y revisar el historial de clases.
                </p>

                <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">✓ Marcación en 1-clic</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">✓ Historial de faltas</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">✓ Porcentaje acumulado</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-emerald-700 group-hover:text-emerald-800">
                <span>Ingresar como Estudiante</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-150" />
              </div>
            </Link>

            {/* Tarjeta 2: Portal Administrativo (Banda Índigo Superior) */}
            <Link
              href="/admin/login"
              className="group relative p-7 rounded-3xl bg-white border border-slate-200/90 border-t-4 border-t-indigo-600 hover:border-indigo-600 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-150 shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 bg-indigo-100/80 px-3 py-1 rounded-full border border-indigo-300">
                    Docentes & Coordinación
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                  Administración y Docencia
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  Inicio de sesión administrativo seguro para configurar módulos, importar listas Excel de estudiantes y auditar actas de asistencia.
                </p>

                <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">✓ Carga masiva Excel</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">✓ Calendarios</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">✓ Exportación</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-indigo-700 group-hover:text-indigo-800">
                <span>Acceder al Panel de Gestión</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-150" />
              </div>
            </Link>
          </div>
        </div>

        {/* 3. Franja del Ciclo de Asistencia (4 Fases Claras sobre Card Blanca) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Flujo Operativo</span>
            <h3 className="text-lg font-bold text-slate-900">¿Cómo opera el control de asistencias?</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-900">Programación Oficial</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Coordinación importa el calendario de fechas y nómina de estudiantes matriculados.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-900">Apertura Diaria</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                La marcación se habilita exclusivamente durante las fechas programadas en cronograma.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                3
              </div>
              <h4 className="text-xs font-bold text-slate-900">Marcación Inmediata</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                El alumno ingresa con su matrícula o correo y registra su asistencia en un solo clic.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                4
              </div>
              <h4 className="text-xs font-bold text-slate-900">Cierre & Auditoría</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Las clases concluidas sin registro computan falta automática de forma inmutable.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Pie Institucional (Azul Marino Oscuro para Anclaje y Enmarcado) */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-semibold text-slate-300">
            Dirección de Postgrado & Educación Continua
          </p>
          <p className="text-[11px] text-slate-500">
            © 2026 Sistema Institucional de Control y Regularidad de Asistencia Académica. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

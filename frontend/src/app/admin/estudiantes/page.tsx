'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/services/auth.service';
import { AuthUser } from '@/features/auth/types/auth.types';
import { StudentsService } from '@/features/students/services/students.service';
import {
  StudentFilterQuery,
  StudentListResponse,
} from '@/features/students/types/student.types';
import { StudentSearchBar } from '@/features/students/components/StudentSearchBar';
import { ActiveStudentsTable } from '@/features/students/components/ActiveStudentsTable';
import { LogoutConfirmButton } from '@/features/auth/components/LogoutConfirmButton';
import {
  Building2,
  Users,
  ArrowLeft,
  BookOpen,
  PlusCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export default function AdminStudentsDirectoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Estados de datos de estudiantes
  const [data, setData] = useState<StudentListResponse>({
    moduleName: 'Cargando módulo...',
    totalCount: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    students: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verificar autenticación administrativa
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const storedToken = authService.getStoredToken();

    if (!storedToken) {
      router.push('/admin/login');
      return;
    }

    setUser(storedUser);
    setToken(storedToken);
    setIsLoadingAuth(false);
  }, [router]);

  // Función para consultar los estudiantes de la API
  const fetchStudents = useCallback(
    async (query: StudentFilterQuery, authToken: string) => {
      setIsFetching(true);
      setErrorMessage(null);
      try {
        const response = await StudentsService.getActiveModuleStudents(
          query,
          authToken,
        );
        setData(response);
      } catch (err: any) {
        setErrorMessage(
          err.message || 'No fue posible cargar el directorio de estudiantes.',
        );
      } finally {
        setIsFetching(false);
      }
    },
    [],
  );

  // Ejecutar consulta cuando cambie la búsqueda, página o token
  useEffect(() => {
    if (!token) return;

    fetchStudents(
      {
        search: searchTerm,
        page: currentPage,
        limit,
      },
      token,
    );
  }, [token, searchTerm, currentPage, limit, fetchStudents]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-sm font-medium text-slate-300">Cargando directorio de estudiantes...</p>
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
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Panel General</span>
            </Link>

            <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block leading-tight">
                  Directorio de Alumnos
                </span>
                <span className="text-[10px] text-slate-300 block leading-tight">
                  Nómina Oficial del Módulo
                </span>
              </div>
            </div>
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
            <LogoutConfirmButton
              role="ADMIN"
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg border border-transparent hover:border-rose-900 transition flex items-center gap-1.5 cursor-pointer"
            />
          </div>
        </div>
      </header>

      {/* 2. Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        {/* Banner de Módulo y Métricas */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-slate-200">
                  Nómina Oficial
                </span>
                {data.moduleCode && (
                  <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-mono font-bold text-indigo-200">
                    {data.moduleCode}
                  </span>
                )}
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
                  Módulo Activo en Curso
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {data.moduleName}
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Directorio y búsqueda instantánea de estudiantes registrados para la toma oficial de asistencia de este módulo académico.
              </p>
            </div>

            {/* Métrica de Alumnos */}
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-300 block font-bold">
                  Total Matriculados
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-white">
                  {data.totalCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center gap-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Barra de Búsqueda y Acciones */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-xl">
              <StudentSearchBar
                value={searchTerm}
                onSearchChange={handleSearchChange}
                isLoading={isFetching}
                placeholder="Buscar por matrícula, nombre completo o correo..."
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              {searchTerm && (
                <span className="px-3 py-1 bg-slate-100 rounded-lg font-medium text-slate-700">
                  Filtro activo: <strong>&quot;{searchTerm}&quot;</strong>
                </span>
              )}
              <Link
                href="/admin/modulo/importar"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>Importar Planilla Excel</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabla de Estudiantes */}
        <ActiveStudentsTable
          students={data.students}
          totalCount={data.totalCount}
          currentPage={data.page}
          totalPages={data.totalPages}
          limit={data.limit}
          onPageChange={handlePageChange}
          searchTerm={searchTerm}
          onClearSearch={() => handleSearchChange('')}
          isLoading={isFetching}
        />
      </main>

      {/* 3. Pie Institucional (Navy Framing) */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Dirección de Postgrado • Nómina Oficial del Módulo: {data.moduleCode || 'En curso'}</span>
          </div>
          <span>Registro estudiantil auditado conforme a la reglamentación académica vigente.</span>
        </div>
      </footer>
    </div>
  );
}

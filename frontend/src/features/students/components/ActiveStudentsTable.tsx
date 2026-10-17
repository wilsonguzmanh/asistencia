'use client';

import React from 'react';
import { StudentItem } from '../types/student.types';
import { Users, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

interface ActiveStudentsTableProps {
  students: StudentItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  searchTerm?: string;
  onClearSearch?: () => void;
  isLoading?: boolean;
}

export const ActiveStudentsTable: React.FC<ActiveStudentsTableProps> = ({
  students,
  totalCount,
  currentPage,
  totalPages,
  limit,
  onPageChange,
  searchTerm = '',
  onClearSearch,
  isLoading = false,
}) => {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Contenedor de la tabla responsiva con Top Accent */}
      <div className="bg-white border-t-4 border-t-indigo-600 rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Matrícula Institucional</th>
                <th className="py-3.5 px-4">Nombre Completo</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4 text-right">Fecha de Alta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {isLoading ? (
                // Skeletons de carga
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 w-6 bg-slate-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-24 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-44 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-48 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                // Estado vacío
                <tr>
                  <td colSpan={5} className="py-14 px-4 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">
                          {searchTerm
                            ? `No se encontraron resultados para "${searchTerm}"`
                            : 'No hay estudiantes matriculados'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {searchTerm
                            ? 'Verifique el número de matrícula, nombre o correo ingresado.'
                            : 'El módulo académico activo aún no cuenta con estudiantes registrados.'}
                        </p>
                      </div>
                      {searchTerm && onClearSearch && (
                        <button
                          type="button"
                          onClick={onClearSearch}
                          className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition border border-indigo-200 cursor-pointer"
                        >
                          Limpiar filtro de búsqueda
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                // Filas de estudiantes
                students.map((student, idx) => {
                  const itemNumber = (currentPage - 1) * limit + idx + 1;
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                        {itemNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {student.registrationNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {student.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900">
                            {student.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={`mailto:${student.email}`}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-700 font-medium transition"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{student.email}</span>
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-slate-500 font-mono tabular-nums">
                        {formatDate(student.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Barra inferior de paginación */}
        {totalCount > 0 && (
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
            <div>
              Mostrando{' '}
              <span className="font-bold font-mono tabular-nums text-slate-900">
                {startItem}
              </span>{' '}
              a{' '}
              <span className="font-bold font-mono tabular-nums text-slate-900">
                {endItem}
              </span>{' '}
              de{' '}
              <span className="font-bold font-mono tabular-nums text-slate-900">
                {totalCount}
              </span>{' '}
              estudiantes
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              <span className="px-2 font-mono font-bold text-slate-800">
                Pág. {currentPage} de {totalPages || 1}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition cursor-pointer"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

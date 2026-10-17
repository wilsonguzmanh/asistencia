'use client';

import React, { useMemo, useState } from 'react';
import { StudentRow } from '../types/module-import.types';

interface StudentsTablePreviewProps {
  students: StudentRow[];
}

export const StudentsTablePreview: React.FC<StudentsTablePreviewProps> = ({
  students,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(term) ||
        s.registrationNumber.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term),
    );
  }, [students, searchTerm]);

  if (!students || students.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-xl border border-emerald-200 overflow-hidden shadow-sm">
      <div className="bg-emerald-50/80 px-6 py-4 border-b border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-900">
              Nómina validada correctamente
            </h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Se detectaron {students.length} estudiantes sin errores ni registros
              duplicados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o registro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs px-3 py-1.5 pl-8 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-60"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <span className="px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-semibold rounded-full whitespace-nowrap">
            {students.length} Estudiantes
          </span>
        </div>
      </div>

      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider sticky top-0">
            <tr>
              <th className="px-4 py-3 text-center">#</th>
              <th className="px-4 py-3">Número de Registro</th>
              <th className="px-4 py-3">Nombre Completo</th>
              <th className="px-4 py-3">Correo Electrónico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((st, idx) => (
                <tr
                  key={st.registrationNumber}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 text-center text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {st.registrationNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {st.fullName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono">
                    {st.email}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-slate-400 text-xs"
                >
                  No se encontraron estudiantes que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

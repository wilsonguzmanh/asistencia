'use client';

import React, { useState } from 'react';
import { useStudentAuth } from '../hooks/useStudentAuth';
import { GraduationCap, AlertCircle, ArrowRight, Loader2, CheckCircle2, Info } from 'lucide-react';

export function StudentLoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, isLoading, error } = useStudentAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setLocalError('Por favor ingrese su correo electrónico o su número de matrícula.');
      return;
    }

    try {
      await login(trimmed);
    } catch {
      // El error ya se gestiona en useStudentAuth
    }
  };

  const displayedError = localError || error;

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-300/40 border border-slate-200/90 border-t-4 border-t-emerald-500 p-8 sm:p-10 transition-all">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 mb-4 shadow-xs">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 mb-2">
          <span>Acceso Directo</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Portal del Estudiante
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Ingrese su identificación para marcar su asistencia en tiempo real o consultar su historial académico.
        </p>
      </div>

      {displayedError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3 shadow-2xs"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <span className="font-medium">{displayedError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="identifier"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
          >
            Matrícula o Correo Institucional
          </label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Ej. 1001 o estudiante@universidad.edu"
            disabled={isLoading}
            className={`w-full px-4 py-3.5 rounded-xl border text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition text-sm font-medium ${
              displayedError
                ? 'border-rose-400 focus:ring-rose-200'
                : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-600'
            } disabled:bg-slate-100 disabled:cursor-not-allowed`}
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Acceso sin contraseña mediante padrón del módulo activo.</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verificando matrícula en módulo activo...</span>
            </>
          ) : (
            <>
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-5 border-t border-slate-100">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Si tiene problemas para acceder, asegúrese de ingresar el número de matrícula o correo con el que fue registrado por la administración.
          </p>
        </div>
      </div>
    </div>
  );
}

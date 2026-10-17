'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
} from 'lucide-react';

export default function AdminLoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Por favor ingrese su usuario o correo electrónico.');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor ingrese su contraseña institucional.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.loginAdmin({
        identifier: identifier.trim(),
        password,
      });

      setSuccessMessage(response.message || 'Sesión iniciada exitosamente');

      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 600);
    } catch (err: unknown) {
      if (err && typeof err === 'object') {
        const errorObj = err as Record<string, unknown>;
        if (typeof errorObj.message === 'string') {
          setErrorMessage(errorObj.message);
        } else if (errorObj.code === 'INVALID_CREDENTIALS') {
          setErrorMessage('Credenciales de acceso incorrectas');
        } else {
          setErrorMessage('Error al conectar con el servidor. Intente nuevamente.');
        }
      } else {
        setErrorMessage('Ocurrió un error inesperado al iniciar sesión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemo = () => {
    setIdentifier('admin@sistema.com');
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md bg-white shadow-sm ring-1 ring-slate-900/5 rounded-2xl border-t-4 border-t-indigo-600 p-8 sm:p-10 transition-all">
      {/* Encabezado y Emblema Institucional */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xs mb-4">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-center">
          Acceso de Administración
        </h1>
        <p className="text-sm text-slate-600 text-center mt-1.5 leading-relaxed">
          Panel de control y gestión académica del sistema de asistencia de postgrado.
        </p>
      </div>

      {/* Alerta de Error */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-sm shadow-xs animate-fade-in"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-rose-950">Error de autenticación</span>
            <span className="font-medium">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Alerta de Éxito */}
      {successMessage && (
        <div
          role="status"
          className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-900 text-sm shadow-xs animate-fade-in"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-emerald-950">Acceso verificado</span>
            <span className="font-medium">{successMessage}. Redirigiendo al panel...</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo 1: Identificador */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Usuario o Correo Institucional
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@sistema.com o usuario"
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm font-medium transition"
            />
          </div>
        </div>

        {/* Campo 2: Contraseña */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Contraseña de Seguridad
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full pl-11 pr-12 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm font-medium transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Verificando credenciales...</span>
            </>
          ) : (
            <span>Ingresar al Panel de Control</span>
          )}
        </button>
      </form>

      {/* Acceso de Demostración Rápida */}
      <div className="mt-8 pt-5 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={handleUseDemo}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Cargar credenciales institucionales de prueba</span>
        </button>
      </div>
    </div>
  );
}

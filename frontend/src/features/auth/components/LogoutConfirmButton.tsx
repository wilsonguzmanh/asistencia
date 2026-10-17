'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { studentAuthService } from '../services/student-auth.service';

interface LogoutConfirmButtonProps {
  role?: 'ADMIN' | 'STUDENT';
  redirectTo?: string;
  className?: string;
  label?: string;
}

export const LogoutConfirmButton: React.FC<LogoutConfirmButtonProps> = ({
  role = 'ADMIN',
  redirectTo,
  className = '',
  label = 'Cerrar Sesión',
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const defaultRedirect = role === 'ADMIN' ? '/admin/login' : '/login';
  const targetRedirect = redirectTo || defaultRedirect;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (role === 'ADMIN') {
        await authService.logoutAdmin();
      } else {
        studentAuthService.clearSession();
      }
      setIsOpen(false);
      router.push(targetRedirect);
    } catch {
      // Forzar redirección en caso de error
      router.push(targetRedirect);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          'px-3.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900 transition flex items-center gap-1.5'
        }
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span>{label}</span>
      </button>

      {/* Modal de confirmación */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400 flex items-center justify-center shrink-0">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  ¿Cerrar Sesión?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Se revocarán los tokens de autenticación activos y deberás
                  ingresar nuevamente con tus credenciales.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoggingOut}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {isLoggingOut && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Confirmar Salida</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

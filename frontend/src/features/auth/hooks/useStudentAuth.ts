'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { studentAuthService } from '../services/student-auth.service';
import { StudentProfile } from '../types/auth.types';
import { ApiClientError } from '../../../lib/api-client';

export function useStudentAuth() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = studentAuthService.getStoredSession();
    if (session) {
      setStudent(session.student);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (identifier: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await studentAuthService.login(identifier);
        setStudent(response.student);
        router.push('/asistencia');
        return response;
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError('Ocurrió un error inesperado al intentar ingresar.');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    studentAuthService.clearSession();
    setStudent(null);
    router.push('/login');
  }, [router]);

  return {
    student,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!student,
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/attendance.service';
import { TodayStatusData } from '../types/attendance.types';
import { ApiClientError } from '../../../lib/api-client';

export function useAttendanceCheckIn() {
  const [data, setData] = useState<TodayStatusData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await attendanceService.getTodayStatus();
      setData(result);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Error al sincronizar el estado de la clase.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const executeCheckIn = useCallback(async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const attendance = await attendanceService.checkIn();
      setSuccessMessage('¡Asistencia registrada correctamente!');
      setData((prev) =>
        prev
          ? {
              ...prev,
              alreadyMarked: true,
              attendance,
            }
          : null,
      );
      return attendance;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('No se pudo registrar la marcación. Intente nuevamente.');
      }
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    data,
    isLoading,
    isSubmitting,
    successMessage,
    errorMessage,
    refreshStatus: fetchStatus,
    executeCheckIn,
  };
}

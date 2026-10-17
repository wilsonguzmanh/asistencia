'use client';

import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/attendance.service';
import { StudentHistoryResponse } from '../types/attendance.types';
import { ApiClientError } from '../../../lib/api-client';

export function useAttendanceHistory() {
  const [history, setHistory] = useState<StudentHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await attendanceService.getMyHistory();
      setHistory(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Error al cargar el historial de asistencias.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    errorMessage,
    refreshHistory: fetchHistory,
  };
}

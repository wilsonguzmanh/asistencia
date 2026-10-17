'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AttendanceMatrixFilterParams,
  AttendanceMatrixResponse,
} from '../types/admin-attendance.types';
import { AdminAttendanceService } from '../services/admin-attendance.service';

export function useAdminAttendanceMatrix(
  initialFilters: AttendanceMatrixFilterParams = {},
) {
  const [data, setData] = useState<AttendanceMatrixResponse | null>(null);
  const [filters, setFilters] =
    useState<AttendanceMatrixFilterParams>(initialFilters);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatrix = useCallback(
    async (currentFilters: AttendanceMatrixFilterParams = filters) => {
      setLoading(true);
      setError(null);
      try {
        const matrixData = await AdminAttendanceService.getMatrix(currentFilters);
        setData(matrixData);
      } catch (err: any) {
        setError(
          err.message ||
            'No se pudo cargar la matriz de asistencias. Asegúrese de haber iniciado sesión como Administrador.',
        );
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchMatrix(filters);
  }, [filters, fetchMatrix]);

  const updateFilters = (newFilters: Partial<AttendanceMatrixFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const refresh = () => fetchMatrix(filters);

  return {
    data,
    filters,
    loading,
    error,
    updateFilters,
    refresh,
  };
}

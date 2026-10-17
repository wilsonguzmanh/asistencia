'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ActivityLogItem,
  ActivityLogQueryParams,
  ActivityLogResponse,
} from '../types/activity-logs.types';
import { ActivityLogsService } from '../services/activity-logs.service';

export function useActivityLogs(initialParams: ActivityLogQueryParams = {}) {
  const [data, setData] = useState<ActivityLogResponse | null>(null);
  const [params, setParams] = useState<ActivityLogQueryParams>({
    page: 1,
    limit: 20,
    action: 'ALL',
    search: '',
    ...initialParams,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (currentParams: ActivityLogQueryParams = params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ActivityLogsService.getLogs(currentParams);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la bitácora de auditoría');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLogs(params);
  }, [params, fetchLogs]);

  const updateParams = (newParams: Partial<ActivityLogQueryParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      // Si cambia el filtro de búsqueda o acción, volver a la página 1
      ...(newParams.search !== undefined || newParams.action !== undefined
        ? { page: 1 }
        : {}),
    }));
  };

  const refresh = () => fetchLogs(params);

  return {
    logs: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    params,
    loading,
    error,
    updateParams,
    refresh,
  };
}

'use client';

import { useState } from 'react';
import { OverrideAttendancePayload } from '../types/admin-attendance.types';
import { AdminAttendanceService } from '../services/admin-attendance.service';

export function useAttendanceOverride(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const overrideAttendance = async (payload: OverrideAttendancePayload) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await AdminAttendanceService.overrideAttendance(payload);
      setSuccessMessage(res.message);
      if (onSuccess) {
        onSuccess();
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al modificar la asistencia');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearFeedback = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return {
    overrideAttendance,
    loading,
    error,
    successMessage,
    clearFeedback,
  };
}

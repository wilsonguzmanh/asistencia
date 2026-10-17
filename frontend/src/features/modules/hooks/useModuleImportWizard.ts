'use client';

import { useState, useEffect, useMemo } from 'react';
import { RowValidationError, StudentRow } from '../types/module-import.types';
import { ScheduleRow } from '../types/schedule-import.types';
import {
  ActivatedModuleResult,
  ModuleMetadata,
} from '../types/module-preview.types';
import { ModuleImportService } from '../services/module-import.service';

export function useModuleImportWizard() {
  const [metadata, setMetadata] = useState<ModuleMetadata>({
    name: '',
    code: '',
    description: '',
  });

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [studentErrors, setStudentErrors] = useState<RowValidationError[]>([]);
  const [scheduleErrors, setScheduleErrors] = useState<RowValidationError[]>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [activatedModuleData, setActivatedModuleData] =
    useState<ActivatedModuleResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carga inicial desde sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedStudents = sessionStorage.getItem('pending_students_import');
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      }

      const storedSchedules = sessionStorage.getItem('pending_schedules_import');
      if (storedSchedules) {
        setSchedules(JSON.parse(storedSchedules));
      }

      const storedMetadata = sessionStorage.getItem('pending_module_metadata');
      if (storedMetadata) {
        setMetadata(JSON.parse(storedMetadata));
      }
    } catch (e) {
      console.error('Error al recuperar datos del asistente:', e);
    }
  }, []);

  // Guardar metadata en sessionStorage ante cambios
  const handleMetadataChange = (newMeta: ModuleMetadata) => {
    setMetadata(newMeta);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pending_module_metadata', JSON.stringify(newMeta));
    }
  };

  const estimatedStartDate = useMemo(() => {
    return schedules.length > 0 ? schedules[0].classDate : '';
  }, [schedules]);

  const estimatedEndDate = useMemo(() => {
    return schedules.length > 0
      ? schedules[schedules.length - 1].classDate
      : '';
  }, [schedules]);

  const hasErrors = useMemo(() => {
    return studentErrors.length > 0 || scheduleErrors.length > 0;
  }, [studentErrors, scheduleErrors]);

  const isFormComplete = useMemo(() => {
    return (
      metadata.name.trim().length > 0 &&
      metadata.code.trim().length > 0 &&
      students.length > 0 &&
      schedules.length > 0
    );
  }, [metadata, students, schedules]);

  const canActivate = useMemo(() => {
    return isFormComplete && !hasErrors;
  }, [isFormComplete, hasErrors]);

  const activateModule = async (token?: string) => {
    if (!canActivate) return;

    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('admin_token') ||
          document.cookie
            .split('; ')
            .find((row) => row.startsWith('admin_token='))
            ?.split('=')[1]
        : '');

    if (!authToken) {
      setErrorMessage(
        'Sesión no autorizada. Debe iniciar sesión nuevamente como administrador.',
      );
      return;
    }

    setIsActivating(true);
    setErrorMessage(null);

    try {
      const response = await ModuleImportService.activateModule(
        {
          name: metadata.name.trim(),
          code: metadata.code.trim(),
          description: metadata.description?.trim(),
          students,
          schedules,
        },
        authToken,
      );

      if (!response.success || !response.data) {
        setErrorMessage(
          response.message ||
            'Error al intentar activar el módulo académico en base de datos.',
        );
        setIsConfirmationOpen(false);
        return;
      }

      setActivatedModuleData(response.data);
      setActivationSuccess(true);
      setIsConfirmationOpen(false);

      // Limpiar los archivos pendientes de importación tras persistencia exitosa
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pending_students_import');
        sessionStorage.removeItem('pending_schedules_import');
        sessionStorage.removeItem('pending_module_metadata');
        sessionStorage.setItem(
          'active_module_summary',
          JSON.stringify(response.data),
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Error de conexión al activar el módulo académico.',
      );
      setIsConfirmationOpen(false);
    } finally {
      setIsActivating(false);
    }
  };

  return {
    metadata,
    setMetadata: handleMetadataChange,
    students,
    setStudents,
    schedules,
    setSchedules,
    studentErrors,
    setStudentErrors,
    scheduleErrors,
    setScheduleErrors,
    estimatedStartDate,
    estimatedEndDate,
    hasErrors,
    isFormComplete,
    canActivate,
    isConfirmationOpen,
    setIsConfirmationOpen,
    isActivating,
    activationSuccess,
    activatedModuleData,
    errorMessage,
    activateModule,
  };
}

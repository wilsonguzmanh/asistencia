import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  AttendanceStatus,
  MatrixRowItem,
} from '../types/admin-attendance.types';
import { useAttendanceOverride } from '../hooks/useAttendanceOverride';

interface AttendanceOverrideModalProps {
  row: MatrixRowItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AttendanceOverrideModal: React.FC<
  AttendanceOverrideModalProps
> = ({ row, isOpen, onClose, onSuccess }) => {
  const [targetStatus, setTargetStatus] = useState<AttendanceStatus>('PRESENTE');
  const [justification, setJustification] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { overrideAttendance, loading, error, successMessage, clearFeedback } =
    useAttendanceOverride(() => {
      setTimeout(() => {
        onSuccess();
        setJustification('');
        setValidationError(null);
        onClose();
      }, 900);
    });

  const handleClose = () => {
    setJustification('');
    setValidationError(null);
    clearFeedback();
    onClose();
  };

  // Inicializar estado sugerido contrario al actual
  React.useEffect(() => {
    if (row) {
      setTargetStatus(row.status === 'PRESENTE' ? 'FALTA' : 'PRESENTE');
      setJustification('');
      setValidationError(null);
      clearFeedback();
    }
  }, [row]);

  if (!isOpen || !row) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (justification.trim().length < 5) {
      setValidationError(
        'La justificación es obligatoria y debe tener al menos 5 caracteres descriptivos (RN-07).',
      );
      return;
    }

    setValidationError(null);
    await overrideAttendance({
      studentId: row.studentId,
      classScheduleId: row.classScheduleId,
      status: targetStatus,
      justification: justification.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Modificar Asistencia Administrativa
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Regla RN-06 / RN-07: Acción sujeta a auditoría obligatoria
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info del Registro */}
        <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Estudiante:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {row.studentName} ({row.registrationNumber})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Fecha de Clase:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {row.classDate} ({row.timeRange})
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
            <span className="text-zinc-500 dark:text-zinc-400">Estado Actual:</span>
            <span
              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                row.status === 'PRESENTE'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
              }`}
            >
              {row.status === 'PRESENTE' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              {row.status}
            </span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Selector de Nuevo Estado */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Nuevo Estado a Asignar:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetStatus('PRESENTE')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  targetStatus === 'PRESENTE'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Presente</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetStatus('FALTA')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  targetStatus === 'FALTA'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Falta</span>
              </button>
            </div>
          </div>

          {/* Campo de Justificación Obligatoria */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="justification"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Motivo / Justificación Obligatoria:
              </label>
              <span className="text-[11px] text-zinc-400">
                {justification.length}/200
              </span>
            </div>
            <textarea
              id="justification"
              rows={3}
              maxLength={200}
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Ej. Presentó justificante laboral firmado o certificado médico..."
              className="w-full p-3 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
            />
            {validationError && (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-medium">
                {validationError}
              </p>
            )}
          </div>

          {/* Mensajes de Feedback */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              {successMessage}
            </div>
          )}

          {/* Nota de Auditoría */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
            <FileText className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              Esta operación registrará una traza en la bitácora inmutable con
              el valor previo y posterior para fines de auditoría.
            </span>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(successMessage)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Confirmar Modificación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { ModuleMetadata } from '../types/module-preview.types';
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';

interface ActivationModalConfirmationProps {
  isOpen: boolean;
  metadata: ModuleMetadata;
  totalStudents: number;
  totalSchedules: number;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const ActivationModalConfirmation: React.FC<
  ActivationModalConfirmationProps
> = ({
  isOpen,
  metadata,
  totalStudents,
  totalSchedules,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-t-4 border-t-indigo-600 border-slate-200 transform transition-all animate-fade-in">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-200">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            ¿Confirmar Activación del Módulo?
          </h3>
          <p className="text-xs text-slate-600 mt-2">
            Verifique la información consolidada antes de proceder con el registro definitivo.
          </p>
        </div>

        {/* Resumen del Módulo a Activar */}
        <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Módulo Académico:</span>
            <span className="font-bold text-slate-900 text-right">
              {metadata.name || 'Sin especificar'}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Código Identificador:</span>
            <span className="font-mono font-bold text-indigo-700">
              {metadata.code || 'Sin código'}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Estudiantes a matricular:</span>
            <span className="font-bold font-mono tabular-nums text-slate-900">{totalStudents}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Clases programadas:</span>
            <span className="font-bold font-mono tabular-nums text-slate-900">{totalSchedules}</span>
          </div>
        </div>

        {/* Aviso Institucional */}
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-amber-900">Aviso de Exclusividad de Ciclo:</strong>
            Solo puede existir un módulo activo a la vez en el sistema. Al confirmar, este ciclo quedará habilitado para el control de asistencia y cualquier ciclo anterior pasará a resguardo histórico.
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-1/2 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-1/2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Activando Módulo...</span>
              </>
            ) : (
              <span>Confirmar y Activar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

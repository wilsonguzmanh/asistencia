import React from 'react';
import {
  X,
  ShieldCheck,
  Calendar,
  User,
  Database,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { ActivityLogItem } from '../types/activity-logs.types';

interface ActivityLogDetailModalProps {
  log: ActivityLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLogDetailModal: React.FC<ActivityLogDetailModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !log) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Detalle del Registro de Auditoría
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                UUID: {log.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto space-y-4 py-4 pr-1 text-xs">
          {/* Fila de Metadatos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                <User className="w-3.5 h-3.5" />
                <span>Ejecutado por:</span>
              </div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                {log.userIdentifier}
              </div>
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                Rol: {log.userRole}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>Fecha y Hora del Evento:</span>
              </div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                {formatDate(log.createdAt)}
              </div>
              {log.ipAddress && (
                <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <Globe className="w-3 h-3" />
                  <span>IP: {log.ipAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información de Acción y Entidad */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Tipo de Acción:</span>
              <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                {log.action}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Entidad Afectada:</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                {log.entityAffected} {log.entityId ? `(ID: ${log.entityId.slice(0, 8)}...)` : ''}
              </span>
            </div>
          </div>

          {/* Comparación Diff: Valor Anterior vs Valor Nuevo */}
          <div>
            <div className="flex items-center gap-2 mb-2 font-semibold text-zinc-700 dark:text-zinc-300">
              <span>Traza de Cambios Realizados:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Valor Previo */}
              <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
                <div className="font-semibold text-rose-700 dark:text-rose-400 mb-1.5 flex items-center gap-1">
                  <span>Valor Previo (Antes)</span>
                </div>
                <pre className="p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 font-mono text-[11px] overflow-x-auto border border-rose-100 dark:border-rose-900/40">
                  {log.previousValue
                    ? JSON.stringify(log.previousValue, null, 2)
                    : 'null (Sin registro anterior)'}
                </pre>
              </div>

              {/* Valor Nuevo */}
              <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Valor Posterior (Nuevo)</span>
                </div>
                <pre className="p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 font-mono text-[11px] overflow-x-auto border border-emerald-100 dark:border-emerald-900/40">
                  {log.newValue
                    ? JSON.stringify(log.newValue, null, 2)
                    : 'null'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

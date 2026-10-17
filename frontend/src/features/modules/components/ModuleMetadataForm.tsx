'use client';

import React from 'react';
import { ModuleMetadata } from '../types/module-preview.types';
import { Edit3 } from 'lucide-react';

interface ModuleMetadataFormProps {
  metadata: ModuleMetadata;
  onChange: (updated: ModuleMetadata) => void;
  disabled?: boolean;
}

export const ModuleMetadataForm: React.FC<ModuleMetadataFormProps> = ({
  metadata,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border-t-4 border-t-indigo-600 shadow-sm ring-1 ring-slate-900/5 space-y-5">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-indigo-600" />
          <span>Información General del Módulo Académico</span>
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Ingrese los datos oficiales que identificarán a este módulo en los registros de asistencia y credenciales estudiantiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nombre del Módulo <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej. Infraestructura como Código (IaC)"
            value={metadata.name}
            disabled={disabled}
            onChange={(e) => onChange({ ...metadata, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all disabled:opacity-60 disabled:bg-slate-50"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Código Identificador <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej. DCID-V1E1-M2"
            value={metadata.code}
            disabled={disabled}
            onChange={(e) => onChange({ ...metadata, code: e.target.value.toUpperCase() })}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all disabled:opacity-60 disabled:bg-slate-50 uppercase"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Descripción u Observaciones (Opcional)
        </label>
        <textarea
          rows={2}
          placeholder="Notas adicionales o descripción académica del módulo..."
          value={metadata.description || ''}
          disabled={disabled}
          onChange={(e) => onChange({ ...metadata, description: e.target.value })}
          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all disabled:opacity-60 disabled:bg-slate-50 resize-none"
        />
      </div>
    </div>
  );
};

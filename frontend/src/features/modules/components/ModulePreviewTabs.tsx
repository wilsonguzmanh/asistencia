'use client';

import React, { useState } from 'react';
import { RowValidationError, StudentRow } from '../types/module-import.types';
import { ScheduleRow } from '../types/schedule-import.types';
import { StudentsTablePreview } from './StudentsTablePreview';
import { SchedulesTablePreview } from './SchedulesTablePreview';
import { StudentErrorsTable } from './StudentErrorsTable';
import { ScheduleErrorsTable } from './ScheduleErrorsTable';
import { Users, CalendarDays, AlertCircle } from 'lucide-react';

interface ModulePreviewTabsProps {
  students: StudentRow[];
  schedules: ScheduleRow[];
  studentErrors: RowValidationError[];
  scheduleErrors: RowValidationError[];
}

export const ModulePreviewTabs: React.FC<ModulePreviewTabsProps> = ({
  students,
  schedules,
  studentErrors,
  scheduleErrors,
}) => {
  const hasErrors = studentErrors.length > 0 || scheduleErrors.length > 0;
  const [activeTab, setActiveTab] = useState<'students' | 'schedules' | 'errors'>(
    hasErrors ? 'errors' : 'students',
  );

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Nómina de Estudiantes</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono tabular-nums font-bold border border-slate-200">
            {students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'schedules'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Calendario de Clases</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono tabular-nums font-bold border border-slate-200">
            {schedules.length}
          </span>
        </button>

        {hasErrors && (
          <button
            type="button"
            onClick={() => setActiveTab('errors')}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'errors'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-rose-500 hover:text-rose-800'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Inconsistencias y Errores</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-800 font-bold font-mono tabular-nums border border-rose-300">
              {studentErrors.length + scheduleErrors.length}
            </span>
          </button>
        )}
      </div>

      {/* Contenido de la pestaña activa */}
      <div>
        {activeTab === 'students' && (
          <div>
            {students.length > 0 ? (
              <StudentsTablePreview students={students} />
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm font-medium">
                No hay nómina de estudiantes cargada. Por favor regrese al Paso 1 para importar el archivo Excel.
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedules' && (
          <div>
            {schedules.length > 0 ? (
              <SchedulesTablePreview schedules={schedules} />
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm font-medium">
                No hay fechas de clase cargadas. Por favor regrese al Paso 2 para importar el calendario.
              </div>
            )}
          </div>
        )}

        {activeTab === 'errors' && hasErrors && (
          <div className="space-y-6">
            {studentErrors.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Inconsistencias en Nómina de Estudiantes ({studentErrors.length})
                </h3>
                <StudentErrorsTable errors={studentErrors} />
              </div>
            )}

            {scheduleErrors.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Inconsistencias en Calendario de Clases ({scheduleErrors.length})
                </h3>
                <ScheduleErrorsTable errors={scheduleErrors} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

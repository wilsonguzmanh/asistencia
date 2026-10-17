'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarCheck2,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { useAdminAttendanceMatrix } from '@/features/attendances/hooks/useAdminAttendanceMatrix';
import { AdminAttendanceStatsCards } from '@/features/attendances/components/AdminAttendanceStatsCards';
import { AdminAttendanceFilters } from '@/features/attendances/components/AdminAttendanceFilters';
import { AdminAttendanceTable } from '@/features/attendances/components/AdminAttendanceTable';
import { AttendanceOverrideModal } from '@/features/attendances/components/AttendanceOverrideModal';
import { MatrixRowItem } from '@/features/attendances/types/admin-attendance.types';

export default function AdminAsistenciasPage() {
  const { data, filters, loading, error, updateFilters, refresh } =
    useAdminAttendanceMatrix();

  const [selectedRowForOverride, setSelectedRowForOverride] =
    useState<MatrixRowItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenOverride = (row: MatrixRowItem) => {
    setSelectedRowForOverride(row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRowForOverride(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Barra de Navegación Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Volver al panel"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-indigo-500" />
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Matriz y Control de Asistencias
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Supervisión general, cálculo de faltas y justificación administrativa
              </p>
            </div>
          </div>

          {data && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-xs font-semibold">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>{data.moduleName}</span>
            </div>
          )}
        </div>

        {/* Mensaje de Error si aplica */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-sm text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <div className="font-semibold">Error al cargar la información</div>
              <div className="text-xs mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Tarjetas de Estadísticas (US-11) */}
        {data && <AdminAttendanceStatsCards summary={data.summary} />}

        {/* Filtros de la Matriz (US-11) */}
        {data && (
          <AdminAttendanceFilters
            schedules={data.schedules}
            students={data.students}
            selectedDate={filters.classDate || 'ALL'}
            selectedStudentId={filters.studentId || 'ALL'}
            onDateChange={(date) => updateFilters({ classDate: date })}
            onStudentChange={(stId) => updateFilters({ studentId: stId })}
            onRefresh={refresh}
            loading={loading}
          />
        )}

        {/* Tabla de Asistencias con Acciones (US-11 y US-12) */}
        <AdminAttendanceTable
          rows={data?.rows || []}
          onOpenOverride={handleOpenOverride}
          loading={loading}
        />

        {/* Modal de Modificación de Asistencia Justificada (US-12) */}
        <AttendanceOverrideModal
          row={selectedRowForOverride}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={refresh}
        />
      </div>
    </div>
  );
}

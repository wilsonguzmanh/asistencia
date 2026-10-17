'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useActivityLogs } from '@/features/activity-logs/hooks/useActivityLogs';
import { ActivityLogsTable } from '@/features/activity-logs/components/ActivityLogsTable';
import { ActivityLogDetailModal } from '@/features/activity-logs/components/ActivityLogDetailModal';
import { ActivityLogItem } from '@/features/activity-logs/types/activity-logs.types';

export default function AdminAuditoriaPage() {
  const {
    logs,
    total,
    page,
    totalPages,
    params,
    loading,
    error,
    updateParams,
    refresh,
  } = useActivityLogs();

  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInspect = (log: ActivityLogItem) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Superior */}
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
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Bitácora de Auditoría del Sistema
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Registro inmutable de acciones críticas, modificaciones de asistencia e inicios de sesión
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de Error si aplica */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-sm text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <div className="font-semibold">Error al cargar la bitácora</div>
              <div className="text-xs mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Tabla de Eventos de Auditoría (US-15) */}
        <ActivityLogsTable
          logs={logs}
          total={total}
          page={page}
          totalPages={totalPages}
          params={params}
          loading={loading}
          onUpdateParams={updateParams}
          onRefresh={refresh}
          onSelectLog={handleInspect}
        />

        {/* Modal de Detalle y Diff */}
        <ActivityLogDetailModal
          log={selectedLog}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}

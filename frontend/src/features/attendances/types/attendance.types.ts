export interface ClassScheduleSummary {
  id: string;
  classDate: string;
  startTime: string;
  endTime: string;
}

export interface AttendanceRecord {
  id: string;
  markedAt: string;
  status: 'PRESENTE' | 'FALTA';
}

export interface TodayStatusData {
  hasClassToday: boolean;
  classSchedule: ClassScheduleSummary | null;
  alreadyMarked: boolean;
  attendance: AttendanceRecord | null;
  nextScheduledClass?: ClassScheduleSummary | null;
}

export interface AttendanceSummaryMetrics {
  totalClasses: number;
  pastClasses: number;
  attendedCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export interface ClassSessionHistoryItem {
  id: string;
  classDate: string;
  startTime: string;
  endTime: string;
  status: 'PRESENTE' | 'FALTA' | 'PROGRAMADA' | 'PENDIENTE_HOY';
  markedAt: string | null;
}

export interface StudentHistoryResponse {
  summary: AttendanceSummaryMetrics;
  sessions: ClassSessionHistoryItem[];
}

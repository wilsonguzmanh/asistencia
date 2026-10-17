import { RowValidationError } from './module-import.types';

export interface ScheduleRow {
  classDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  rowNumber: number;
}

export interface ScheduleValidationResult {
  totalSessions: number;
  hasErrors: boolean;
  errorCount: number;
  errors: RowValidationError[];
  schedules: ScheduleRow[];
}

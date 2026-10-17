import { RowValidationError, StudentRow } from './module-import.types';
import { ScheduleRow } from './schedule-import.types';

export interface ModulePreviewSummary {
  isValid: boolean;
  canActivate: boolean;
  totalStudents: number;
  totalSchedules: number;
  estimatedStartDate: string;
  estimatedEndDate: string;
  studentsPreview: StudentRow[];
  schedulesPreview: ScheduleRow[];
  validationErrors: {
    studentsErrors: RowValidationError[];
    schedulesErrors: RowValidationError[];
  };
}

export interface ModuleMetadata {
  name: string;
  code: string;
  description?: string;
}

export interface ActivateModulePayload {
  name: string;
  code: string;
  description?: string;
  students: StudentRow[];
  schedules: ScheduleRow[];
}

export interface ActivatedModuleResult {
  id: string;
  name: string;
  code: string;
  status: string;
  startDate: string;
  endDate: string;
  studentsCount: number;
  schedulesCount: number;
  archivedPreviousModuleInfo?: string | null;
  message: string;
}

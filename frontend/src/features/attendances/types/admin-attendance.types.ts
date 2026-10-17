export type AttendanceStatus = 'PRESENTE' | 'FALTA';
export type UserRole = 'ADMIN' | 'STUDENT';

export interface MatrixSummaryMetrics {
  totalStudents: number;
  totalClasses: number;
  totalPresent: number;
  totalAbsent: number;
  attendancePercentage: number;
}

export interface MatrixScheduleItem {
  id: string;
  classDate: string;
  startTime: string;
  endTime: string;
}

export interface MatrixStudentItem {
  id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
}

export interface MatrixRowItem {
  attendanceId: string | null;
  studentId: string;
  registrationNumber: string;
  studentName: string;
  classScheduleId: string;
  classDate: string;
  timeRange: string;
  status: AttendanceStatus;
  markedAt: string | null;
  markedByRole: UserRole | null;
  remarks: string | null;
}

export interface AttendanceMatrixResponse {
  moduleName: string;
  moduleId: string;
  summary: MatrixSummaryMetrics;
  schedules: MatrixScheduleItem[];
  students: MatrixStudentItem[];
  rows: MatrixRowItem[];
}

export interface AttendanceMatrixFilterParams {
  classDate?: string;
  studentId?: string;
}

export interface OverrideAttendancePayload {
  studentId: string;
  classScheduleId: string;
  status: AttendanceStatus;
  justification: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus, UserRole } from '../../../common/enums';

export class MatrixSummaryMetricsDto {
  @ApiProperty({ example: 30, description: 'Total de estudiantes inscritos en el módulo' })
  totalStudents: number;

  @ApiProperty({ example: 10, description: 'Total de fechas de clase del calendario' })
  totalClasses: number;

  @ApiProperty({ example: 28, description: 'Total de asistencias marcadas como presentes en la vista filtrada' })
  totalPresent: number;

  @ApiProperty({ example: 2, description: 'Total de ausencias (faltas) en la vista filtrada' })
  totalAbsent: number;

  @ApiProperty({ example: 93.3, description: 'Porcentaje de asistencia en la vista filtrada' })
  attendancePercentage: number;
}

export class MatrixScheduleItemDto {
  @ApiProperty({ example: 'uuid', description: 'ID de la fecha de clase' })
  id: string;

  @ApiProperty({ example: '2026-10-13', description: 'Fecha de la clase' })
  classDate: string;

  @ApiProperty({ example: '19:00', description: 'Hora de inicio' })
  startTime: string;

  @ApiProperty({ example: '22:00', description: 'Hora de finalización' })
  endTime: string;
}

export class MatrixStudentItemDto {
  @ApiProperty({ example: 'uuid', description: 'ID del estudiante' })
  id: string;

  @ApiProperty({ example: '1001', description: 'Número de registro académico' })
  registrationNumber: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo' })
  fullName: string;

  @ApiProperty({ example: 'juan@gmail.com', description: 'Correo electrónico' })
  email: string;
}

export class MatrixRowItemDto {
  @ApiProperty({ example: 'uuid', description: 'ID de la asistencia si ya existe' })
  attendanceId: string | null;

  @ApiProperty({ example: 'uuid', description: 'ID del estudiante' })
  studentId: string;

  @ApiProperty({ example: '1001', description: 'Registro del estudiante' })
  registrationNumber: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del estudiante' })
  studentName: string;

  @ApiProperty({ example: 'uuid', description: 'ID de la sesión de clase' })
  classScheduleId: string;

  @ApiProperty({ example: '2026-10-13', description: 'Fecha de la clase' })
  classDate: string;

  @ApiProperty({ example: '19:00 - 22:00', description: 'Horario de la clase' })
  timeRange: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENTE, description: 'Estado actual' })
  status: AttendanceStatus;

  @ApiProperty({ example: '2026-10-13T19:15:00.000Z', nullable: true, description: 'Fecha/hora de marcación' })
  markedAt: Date | null;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT, nullable: true, description: 'Rol que registró o modificó' })
  markedByRole: UserRole | null;

  @ApiProperty({ example: 'Justificación médica', nullable: true, description: 'Observaciones o justificación' })
  remarks: string | null;
}

export class AttendanceMatrixResponseDto {
  @ApiProperty({ example: 'Módulo Piloto DevOps', description: 'Nombre del módulo activo' })
  moduleName: string;

  @ApiProperty({ example: 'uuid', description: 'ID del módulo activo' })
  moduleId: string;

  @ApiProperty({ type: MatrixSummaryMetricsDto, description: 'Totales y estadísticas calculadas' })
  summary: MatrixSummaryMetricsDto;

  @ApiProperty({ type: [MatrixScheduleItemDto], description: 'Listado de fechas de clase del módulo' })
  schedules: MatrixScheduleItemDto[];

  @ApiProperty({ type: [MatrixStudentItemDto], description: 'Listado de estudiantes del módulo' })
  students: MatrixStudentItemDto[];

  @ApiProperty({ type: [MatrixRowItemDto], description: 'Filas de la matriz con estado calculado' })
  rows: MatrixRowItemDto[];
}

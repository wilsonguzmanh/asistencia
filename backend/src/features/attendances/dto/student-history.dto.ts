import { ApiProperty } from '@nestjs/swagger';

export class AttendanceSummaryMetricsDto {
  @ApiProperty({ example: 5, description: 'Total de clases programadas en el calendario del módulo' })
  totalClasses: number;

  @ApiProperty({ example: 3, description: 'Total de clases que ya han transcurrido a la fecha' })
  pastClasses: number;

  @ApiProperty({ example: 2, description: 'Total de asistencias marcadas como Presente' })
  attendedCount: number;

  @ApiProperty({ example: 1, description: 'Total de inasistencias calculadas como Falta' })
  absentCount: number;

  @ApiProperty({ example: 66.7, description: 'Porcentaje de asistencia acumulado' })
  attendancePercentage: number;
}

export class ClassSessionHistoryItemDto {
  @ApiProperty({ example: 'b5a6c382-9f37-4b71-b062-81523f66345e' })
  id: string;

  @ApiProperty({ example: '2026-10-13' })
  classDate: string;

  @ApiProperty({ example: '18:00' })
  startTime: string;

  @ApiProperty({ example: '21:00' })
  endTime: string;

  @ApiProperty({
    example: 'PRESENTE',
    enum: ['PRESENTE', 'FALTA', 'PROGRAMADA', 'PENDIENTE_HOY'],
    description: 'Estado de la sesión. Clases pasadas sin registro son automáticamente FALTA (RN-05).',
  })
  status: 'PRESENTE' | 'FALTA' | 'PROGRAMADA' | 'PENDIENTE_HOY';

  @ApiProperty({ example: '2026-10-13T22:17:54.000Z', nullable: true })
  markedAt: Date | string | null;
}

export class StudentHistoryResponseDto {
  @ApiProperty({ type: AttendanceSummaryMetricsDto })
  summary: AttendanceSummaryMetricsDto;

  @ApiProperty({ type: [ClassSessionHistoryItemDto] })
  sessions: ClassSessionHistoryItemDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { RowValidationError } from './import-validation-result.dto';
import { StudentRowDto } from './student-row.dto';
import { ScheduleRowDto } from './schedule-row.dto';

export class ModulePreviewErrorsDto {
  @ApiProperty({ type: [RowValidationError] })
  studentsErrors: RowValidationError[];

  @ApiProperty({ type: [RowValidationError] })
  schedulesErrors: RowValidationError[];
}

export class ModulePreviewSummaryDto {
  @ApiProperty({
    example: true,
    description: 'Indica si ambos archivos fueron procesados sin errores',
  })
  isValid: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si el módulo cumple todas las condiciones para ser activado',
  })
  canActivate: boolean;

  @ApiProperty({
    example: 30,
    description: 'Total de estudiantes validados en la nómina',
  })
  totalStudents: number;

  @ApiProperty({
    example: 10,
    description: 'Total de sesiones de clase programadas',
  })
  totalSchedules: number;

  @ApiProperty({
    example: '2026-10-05',
    description: 'Fecha de la primera sesión de clase detectada',
  })
  estimatedStartDate: string;

  @ApiProperty({
    example: '2026-11-15',
    description: 'Fecha de la última sesión de clase detectada',
  })
  estimatedEndDate: string;

  @ApiProperty({ type: [StudentRowDto] })
  studentsPreview: StudentRowDto[];

  @ApiProperty({ type: [ScheduleRowDto] })
  schedulesPreview: ScheduleRowDto[];

  @ApiProperty({ type: ModulePreviewErrorsDto })
  validationErrors: ModulePreviewErrorsDto;
}

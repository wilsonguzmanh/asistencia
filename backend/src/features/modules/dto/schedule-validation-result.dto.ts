import { ApiProperty } from '@nestjs/swagger';
import { RowValidationError } from './import-validation-result.dto';
import { ScheduleRowDto } from './schedule-row.dto';

export class ScheduleValidationResultDto {
  @ApiProperty({
    example: 10,
    description: 'Cantidad total de sesiones o fechas de clase detectadas',
  })
  totalSessions: number;

  @ApiProperty({
    example: false,
    description: 'Indica si se encontraron errores de formato o fechas repetidas',
  })
  hasErrors: boolean;

  @ApiProperty({
    example: 0,
    description: 'Cantidad total de errores encontrados',
  })
  errorCount: number;

  @ApiProperty({
    type: [RowValidationError],
    description: 'Listado detallado de errores por fila',
  })
  errors: RowValidationError[];

  @ApiProperty({
    type: [ScheduleRowDto],
    description: 'Listado de fechas y horarios válidos ordenados cronológicamente',
  })
  schedules: ScheduleRowDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class ScheduleRowDto {
  @ApiProperty({
    example: '2026-10-05',
    description: 'Fecha de la sesión de clase en formato ISO YYYY-MM-DD',
  })
  @IsString({ message: 'La fecha de clase debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La fecha de clase es obligatoria' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener formato YYYY-MM-DD',
  })
  classDate: string;

  @ApiProperty({
    example: '18:00',
    description: 'Hora programada de inicio informativa (formato HH:mm)',
  })
  @IsString({ message: 'La hora de inicio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora de inicio debe tener formato HH:mm de 24 horas',
  })
  startTime: string;

  @ApiProperty({
    example: '21:00',
    description: 'Hora programada de cierre informativa (formato HH:mm)',
  })
  @IsString({ message: 'La hora de fin debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora de fin debe tener formato HH:mm de 24 horas',
  })
  endTime: string;

  @ApiProperty({
    example: 2,
    description: 'Número de fila en el archivo Excel origen',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  rowNumber?: number;
}

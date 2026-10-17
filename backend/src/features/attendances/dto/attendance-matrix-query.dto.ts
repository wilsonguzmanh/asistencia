import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class AttendanceMatrixQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar asistencias por fecha específica de clase (formato YYYY-MM-DD)',
    example: '2026-10-13',
  })
  @IsOptional()
  @IsDateString()
  classDate?: string;

  @ApiPropertyOptional({
    description: 'Filtrar asistencias para un estudiante específico por su UUID',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @IsOptional()
  @IsUUID('4')
  studentId?: string;
}

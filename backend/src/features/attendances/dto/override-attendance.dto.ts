import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { AttendanceStatus } from '../../../common/enums';

export class OverrideAttendanceDto {
  @ApiProperty({
    description: 'UUID del estudiante a modificar',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @IsUUID('4')
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'UUID de la sesión de clase (ClassSchedule)',
    example: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
  })
  @IsUUID('4')
  @IsNotEmpty()
  classScheduleId: string;

  @ApiProperty({
    enum: AttendanceStatus,
    description: 'Nuevo estado de asistencia a asignar',
    example: AttendanceStatus.PRESENTE,
  })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

  @ApiProperty({
    description:
      'Motivo o justificación obligatoria del cambio administrativo (RN-06, RN-07)',
    example: 'Presentó justificante laboral por viaje oficial',
    minLength: 5,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, {
    message: 'La justificación debe tener al menos 5 caracteres descriptivos',
  })
  justification: string;
}

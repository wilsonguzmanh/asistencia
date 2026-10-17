import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ScheduleRowDto } from './schedule-row.dto';
import { StudentRowDto } from './student-row.dto';

export class ActivateModuleDto {
  @ApiProperty({
    example: 'Módulo 2: Infraestructura como Código (IaC)',
    description: 'Nombre descriptivo del módulo académico a activar',
  })
  @IsString({ message: 'El nombre del módulo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del módulo es obligatorio' })
  name: string;

  @ApiProperty({
    example: 'DCID-V1E1-M2',
    description: 'Código único identificador del módulo académico',
  })
  @IsString({ message: 'El código del módulo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código del módulo es obligatorio' })
  code: string;

  @ApiProperty({
    example: 'Módulo enfocado en Docker, Ansible y Terraform',
    description: 'Descripción u observaciones opcionales del módulo',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: [StudentRowDto],
    description: 'Lista de estudiantes a matricular en el nuevo módulo activo',
  })
  @IsArray({ message: 'La lista de estudiantes debe ser un arreglo' })
  @ArrayNotEmpty({
    message: 'Debe proporcionar al menos un estudiante para activar el módulo',
  })
  @ValidateNested({ each: true })
  @Type(() => StudentRowDto)
  students: StudentRowDto[];

  @ApiProperty({
    type: [ScheduleRowDto],
    description: 'Lista de fechas y horarios de clase del nuevo módulo activo',
  })
  @IsArray({ message: 'El calendario de clases debe ser un arreglo' })
  @ArrayNotEmpty({
    message: 'Debe proporcionar al menos una fecha de clase para activar el módulo',
  })
  @ValidateNested({ each: true })
  @Type(() => ScheduleRowDto)
  schedules: ScheduleRowDto[];
}

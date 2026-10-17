import { ApiProperty } from '@nestjs/swagger';
import { ModuleStatus } from '../../../common/enums';

export class ActivatedModuleResponseDto {
  @ApiProperty({
    example: 'd9b2d63d-a232-4458-8686-2ef1f63b4680',
    description: 'Identificador único (UUID) del nuevo módulo activo',
  })
  id: string;

  @ApiProperty({
    example: 'Módulo 2: Infraestructura como Código (IaC)',
    description: 'Nombre del módulo activado',
  })
  name: string;

  @ApiProperty({
    example: 'DCID-V1E1-M2',
    description: 'Código único del módulo activado',
  })
  code: string;

  @ApiProperty({
    enum: ModuleStatus,
    example: ModuleStatus.ACTIVE,
    description: 'Estado del módulo (ACTIVE)',
  })
  status: ModuleStatus;

  @ApiProperty({
    example: '2026-10-05',
    description: 'Fecha de inicio del módulo calculada a partir del calendario',
  })
  startDate: string;

  @ApiProperty({
    example: '2026-11-15',
    description: 'Fecha de fin del módulo calculada a partir del calendario',
  })
  endDate: string;

  @ApiProperty({
    example: 32,
    description: 'Cantidad de estudiantes matriculados en el nuevo módulo',
  })
  studentsCount: number;

  @ApiProperty({
    example: 12,
    description: 'Cantidad de sesiones de clase programadas para el módulo',
  })
  schedulesCount: number;

  @ApiProperty({
    example: 'Módulo Piloto DevOps archivado correctamente',
    description:
      'Información sobre el archivado del módulo previo (RN-01, RN-08)',
    required: false,
    nullable: true,
  })
  archivedPreviousModuleInfo?: string | null;

  @ApiProperty({
    example: 'Módulo académico activado exitosamente.',
    description: 'Mensaje de confirmación de la operación',
  })
  message: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class StudentItemDto {
  @ApiProperty({
    example: 'd9b2d63d-a232-4458-8686-2ef1f63b4680',
    description: 'Identificador único (UUID) del estudiante',
  })
  id: string;

  @ApiProperty({
    example: '1001',
    description: 'Número de registro o matrícula del estudiante',
  })
  registrationNumber: string;

  @ApiProperty({
    example: 'María Pérez Gómez',
    description: 'Nombre completo del estudiante',
  })
  fullName: string;

  @ApiProperty({
    example: 'maria.perez@uagrm.edu.bo',
    description: 'Correo electrónico del estudiante',
  })
  email: string;

  @ApiProperty({
    example: '2026-10-01T12:00:00.000Z',
    description: 'Fecha y hora de registro del estudiante',
  })
  createdAt: Date;
}

export class StudentListResponseDto {
  @ApiProperty({
    example: 'Módulo 2: Infraestructura como Código (IaC)',
    description: 'Nombre del módulo académico actualmente activo',
  })
  moduleName: string;

  @ApiProperty({
    example: 'DCID-V1E1-M2',
    description: 'Código del módulo académico activo',
    required: false,
  })
  moduleCode?: string;

  @ApiProperty({
    example: 30,
    description: 'Total de estudiantes que coinciden con los criterios de búsqueda',
  })
  totalCount: number;

  @ApiProperty({
    example: 1,
    description: 'Número de página actual',
  })
  page: number;

  @ApiProperty({
    example: 20,
    description: 'Límite de estudiantes devueltos por página',
  })
  limit: number;

  @ApiProperty({
    example: 2,
    description: 'Total de páginas calculadas',
  })
  totalPages: number;

  @ApiProperty({
    type: [StudentItemDto],
    description: 'Listado de estudiantes encontrados',
  })
  students: StudentItemDto[];
}

import { Controller, Post, Query, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';
import { runSeed } from '../../database/seeds/seed';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Post('seed')
  @ApiOperation({
    summary: 'Poblar base de datos con datos de prueba (15 Estudiantes, Módulo, Fechas y Asistencias)',
    description:
      'Ejecuta la semilla de datos de prueba en la base de datos conectada. Puede ejecutarse directamente desde Swagger o mediante un POST con la clave opcional ?key=seed2026.',
  })
  @ApiQuery({
    name: 'key',
    required: false,
    description: 'Clave de seguridad opcional (por defecto seed2026)',
    example: 'seed2026',
  })
  @ApiResponse({
    status: 200,
    description: 'Base de datos inicializada exitosamente',
  })
  async seed(@Query('key') key?: string) {
    const requiredKey = process.env.SEED_KEY || 'seed2026';
    if (key && key !== requiredKey) {
      throw new UnauthorizedException('Clave de inicialización de semilla inválida');
    }

    const summary = await runSeed(this.dataSource);
    return {
      status: 'success',
      message: 'Base de datos inicializada exitosamente con datos de prueba',
      data: summary,
    };
  }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogQueryDto } from './dto/activity-log-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Activity Logs')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get('admin')
  @ApiOperation({
    summary:
      'Consultar y filtrar la bitácora de auditoría del sistema (RF-10, US-15)',
    description:
      'Permite al administrador consultar los eventos registrados en activity_logs con filtros por acción, búsqueda de usuario y paginación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de auditoría paginado obtenido exitosamente.',
  })
  async getLogs(@Query() query: ActivityLogQueryDto) {
    return this.activityLogsService.findLogsWithFilters(query);
  }
}

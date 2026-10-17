import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AttendancesService } from './attendances.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { AttendanceMatrixQueryDto } from './dto/attendance-matrix-query.dto';
import { AttendanceMatrixResponseDto } from './dto/attendance-matrix-response.dto';
import { OverrideAttendanceDto } from './dto/override-attendance.dto';

@ApiTags('Admin Attendances')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('attendances/admin')
export class AdminAttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Get('matrix')
  @ApiOperation({
    summary: 'Consultar matriz general de asistencias del módulo activo (RF-08, US-11)',
    description:
      'Retorna la planilla general de asistencias con filtros opcionales por fecha de clase o por estudiante, e incluye los contadores acumulados de presentes, faltas y tasa de asistencia.',
  })
  @ApiResponse({
    status: 200,
    description: 'Matriz de asistencias obtenida exitosamente.',
    type: AttendanceMatrixResponseDto,
  })
  async getMatrix(
    @Query() query: AttendanceMatrixQueryDto,
  ): Promise<AttendanceMatrixResponseDto> {
    return this.attendancesService.getAdminMatrix(query);
  }

  @Post('override')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Modificar manualmente el estado de asistencia con justificación y auditoría (RF-07, RN-06, RN-07, US-12)',
    description:
      'Permite al administrador cambiar el estado de asistencia de cualquier estudiante en cualquier fecha de clase. Exige justificación obligatoria y crea una traza inmutable en ActivityLog.',
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencia modificada y auditada exitosamente.',
  })
  async overrideAttendance(
    @Body() dto: OverrideAttendanceDto,
    @Req() req: any,
  ) {
    const adminUser = req.user || {
      id: req.user?.sub,
      username: 'admin',
      email: 'admin@asistencia.edu',
    };
    return this.attendancesService.overrideAttendance(dto, adminUser);
  }
}

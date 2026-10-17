import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AttendancesService } from './attendances.service';
import { StudentJwtGuard } from '../../common/guards/student-jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { TodayStatusResponseDto } from './dto/today-status.dto';

@ApiTags('Attendances')
@ApiBearerAuth('jwt-auth')
@Public()
@UseGuards(StudentJwtGuard)
@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Get('today-status')
  @ApiOperation({
    summary: 'Consultar el estado de clase y marcación del estudiante para hoy',
    description:
      'Retorna si hoy hay clase programada en el módulo activo, horarios, y si el estudiante ya registró asistencia (RF-03, US-08).',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la sesión de hoy obtenido correctamente.',
    type: TodayStatusResponseDto,
  })
  async getTodayStatus(@CurrentUser() user: any) {
    return this.attendancesService.getTodayStatus(user.sub, user.moduleId);
  }

  @Get('my-history')
  @ApiOperation({
    summary: 'Consultar historial personal de asistencias y faltas calculadas',
    description:
      'Retorna la relación de todas las clases del módulo activo, calculando automáticamente como FALTA las clases pasadas sin asistencia (RF-04, RF-05, RN-05, US-09).',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial y resumen de asistencias obtenido correctamente.',
  })
  async getMyHistory(@CurrentUser() user: any) {
    return this.attendancesService.getMyHistory(user.sub, user.moduleId);
  }

  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar marcación de asistencia en día de clase programada',
    description:
      'Permite al estudiante marcar su asistencia en la fecha y hora actuales. Valida obligatoriedad de fecha de clase (RN-04) y unicidad de marca (RN-03).',
  })
  @ApiResponse({
    status: 201,
    description: '¡Asistencia registrada correctamente!',
  })
  @ApiResponse({
    status: 400,
    description: 'Hoy no es un día de clase programado en el módulo activo (RN-04).',
  })
  @ApiResponse({
    status: 409,
    description: 'El estudiante ya registró su asistencia hoy (RN-03).',
  })
  async checkIn(@CurrentUser() user: any, @Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket?.remoteAddress ?? '127.0.0.1';

    return this.attendancesService.checkIn(
      user.sub,
      user.moduleId,
      {
        registrationNumber: user.registrationNumber,
        fullName: user.fullName,
        email: user.email,
      },
      ipAddress,
    );
  }
}

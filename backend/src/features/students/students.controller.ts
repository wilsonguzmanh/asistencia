import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../common/enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StudentFilterQueryDto } from './dto/student-filter-query.dto';
import { StudentListResponseDto } from './dto/student-list-response.dto';
import { StudentsService } from './services/students.service';

@ApiTags('Students')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar nómina y búsqueda de estudiantes del módulo activo (RF-06)',
    description:
      'Devuelve la nómina de estudiantes matriculados en el módulo académico actualmente activo con paginación y filtrado por nombre, matrícula o correo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Nómina de estudiantes obtenida exitosamente.',
    type: StudentListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Se requiere token JWT válido.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido. Se requieren privilegios de Administrador.',
  })
  async getActiveModuleStudents(
    @Query() query: StudentFilterQueryDto,
  ): Promise<StudentListResponseDto> {
    return this.studentsService.getActiveModuleStudents(query);
  }
}

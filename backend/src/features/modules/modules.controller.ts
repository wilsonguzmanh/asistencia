import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../common/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StudentImportValidationResultDto } from './dto/import-validation-result.dto';
import { ScheduleValidationResultDto } from './dto/schedule-validation-result.dto';
import { ModulePreviewSummaryDto } from './dto/module-preview-summary.dto';
import { ActivateModuleDto } from './dto/activate-module.dto';
import { ActivatedModuleResponseDto } from './dto/activated-module-response.dto';
import { ExcelValidationException } from './exceptions/excel-validation.exception';
import { ExcelParserService } from './services/excel-parser.service';
import { ScheduleParserService } from './services/schedule-parser.service';
import { ModulesService } from './services/modules.service';

@ApiTags('Modules')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('modules')
export class ModulesController {
  constructor(
    private readonly excelParserService: ExcelParserService,
    private readonly scheduleParserService: ScheduleParserService,
    private readonly modulesService: ModulesService,
  ) {}

  @Post('import/students')
  @ApiOperation({
    summary: 'Importar y validar archivo Excel de estudiantes (RF-11, RN-02)',
    description:
      'Procesa un archivo .xlsx con las columnas "Número de registro", "Nombre completo" y "Correo electrónico". Valida obligatoriedad, formatos y unicidad de registros. Si contiene errores, los detalla por número de fila.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Archivo Excel (.xlsx o .xls) con las columnas requeridas',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Archivo procesado y validado exitosamente sin errores.',
    type: StudentImportValidationResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'El archivo contiene errores de validación o duplicados.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado. Se requiere token JWT administrativo.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<StudentImportValidationResultDto> {
    if (!file || !file.buffer) {
      throw new ExcelValidationException(
        'Debe seleccionar un archivo Excel válido para procesar',
      );
    }

    const result = await this.excelParserService.parseStudentsExcel(file.buffer);

    if (result.hasErrors) {
      throw new ExcelValidationException(
        `Se encontraron ${result.errorCount} errores en el archivo Excel de estudiantes`,
        result,
      );
    }

    return result;
  }

  @Post('import/schedules')
  @ApiOperation({
    summary: 'Importar y validar calendario de clases vía Excel (RF-12, RN-04)',
    description:
      'Procesa un archivo .xlsx con las columnas "Fecha", "Hora inicio" y "Hora fin". Valida formato de fecha, horas de 24h, coherencia temporal y unicidad de fecha. Horarios son informativos.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Archivo Excel (.xlsx o .xls) con las columnas Fecha, Hora inicio y Hora fin',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Calendario procesado y validado exitosamente sin errores.',
    type: ScheduleValidationResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description:
      'El calendario contiene fechas repetidas o formatos de hora inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado. Se requiere token JWT administrativo.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async importSchedules(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ScheduleValidationResultDto> {
    if (!file || !file.buffer) {
      throw new ExcelValidationException(
        'Debe seleccionar un archivo Excel de calendario válido para procesar',
      );
    }

    const result = await this.scheduleParserService.parseSchedulesExcel(
      file.buffer,
    );

    if (result.hasErrors) {
      throw new ExcelValidationException(
        `Se encontraron ${result.errorCount} errores en el calendario de fechas de clase`,
        result,
      );
    }

    return result;
  }

  @Post('preview')
  @ApiOperation({
    summary:
      'Generar vista previa consolidada de estudiantes y calendario antes de activar (RF-16)',
    description:
      'Procesa simultáneamente ambos archivos Excel y retorna el resumen consolidado de estudiantes y clases, validando si el módulo puede activarse sin errores.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentsFile: {
          type: 'string',
          format: 'binary',
          description: 'Archivo Excel de estudiantes (.xlsx)',
        },
        schedulesFile: {
          type: 'string',
          format: 'binary',
          description: 'Archivo Excel de fechas de clase (.xlsx)',
        },
      },
      required: ['studentsFile', 'schedulesFile'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Vista previa consolidada generada con éxito.',
    type: ModulePreviewSummaryDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description:
      'Uno o ambos archivos contienen errores de validación.',
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'studentsFile', maxCount: 1 },
      { name: 'schedulesFile', maxCount: 1 },
    ]),
  )
  async previewModule(
    @UploadedFiles()
    files: {
      studentsFile?: Express.Multer.File[];
      schedulesFile?: Express.Multer.File[];
    },
  ): Promise<ModulePreviewSummaryDto> {
    const studentsBuffer = files?.studentsFile?.[0]?.buffer;
    const schedulesBuffer = files?.schedulesFile?.[0]?.buffer;

    const summary = await this.modulesService.previewModuleData(
      studentsBuffer,
      schedulesBuffer,
    );

    if (!summary.isValid) {
      throw new ExcelValidationException(
        'La vista previa contiene errores que deben subsanarse antes de activar el módulo',
        summary,
      );
    }

    return summary;
  }

  @Post('activate')
  @ApiOperation({
    summary:
      'Activar un nuevo módulo académico con transacción ACID y archivado histórico (RF-13, RF-14, RF-15, RN-01, RN-08)',
    description:
      'Archiva atómicamente el módulo activo anterior e inserta el nuevo módulo activo junto con sus estudiantes y calendario de fechas en una sola transacción reversible.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Módulo académico activado exitosamente.',
    type: ActivatedModuleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Datos inválidos, código de módulo duplicado o listas de estudiantes/fechas vacías.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado. Se requiere token JWT administrativo.',
  })
  async activateModule(
    @Body() dto: ActivateModuleDto,
    @CurrentUser() adminUser: any,
    @Req() req: any,
  ): Promise<ActivatedModuleResponseDto> {
    return this.modulesService.activateNewModule(dto, adminUser, req?.ip);
  }

  @Get('active')
  @ApiOperation({
    summary:
      'Obtener información del módulo académico actualmente activo (RN-01)',
    description:
      'Retorna los datos del módulo actualmente activo, incluyendo nómina de estudiantes matriculados y calendario de fechas de clase.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Módulo activo recuperado exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado. Se requiere token JWT administrativo.',
  })
  async getActiveModule() {
    return this.modulesService.getActiveModule();
  }
}

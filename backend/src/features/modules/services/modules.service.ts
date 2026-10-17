import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ActivityAction, ModuleStatus, UserRole } from '../../../common/enums';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { ClassSchedule } from '../../schedules/entities/class-schedule.entity';
import { Student } from '../../students/entities/student.entity';
import { AcademicModule } from '../entities/academic-module.entity';
import { ActivateModuleDto } from '../dto/activate-module.dto';
import { ActivatedModuleResponseDto } from '../dto/activated-module-response.dto';
import { ModulePreviewSummaryDto } from '../dto/module-preview-summary.dto';
import { ExcelValidationException } from '../exceptions/excel-validation.exception';
import { ExcelParserService } from './excel-parser.service';
import { ScheduleParserService } from './schedule-parser.service';

@Injectable()
export class ModulesService {
  private readonly logger = new Logger(ModulesService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AcademicModule)
    private readonly modulesRepository: Repository<AcademicModule>,
    private readonly excelParserService: ExcelParserService,
    private readonly scheduleParserService: ScheduleParserService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  /**
   * Consolida y valida simultáneamente los archivos de estudiantes y calendario para previsualización (RF-16, US-06)
   */
  async previewModuleData(
    studentsBuffer?: Buffer,
    schedulesBuffer?: Buffer,
  ): Promise<ModulePreviewSummaryDto> {
    this.logger.log(
      'Generando vista previa consolidada de nuevo módulo académico...',
    );

    if (!studentsBuffer || studentsBuffer.length === 0) {
      throw new ExcelValidationException(
        'El archivo de nómina de estudiantes es obligatorio para la vista previa',
      );
    }

    if (!schedulesBuffer || schedulesBuffer.length === 0) {
      throw new ExcelValidationException(
        'El archivo de calendario de clases es obligatorio para la vista previa',
      );
    }

    // 1. Procesar archivo de estudiantes
    const studentsResult = await this.excelParserService.parseStudentsExcel(
      studentsBuffer,
    );

    // 2. Procesar archivo de calendario de clases
    const schedulesResult =
      await this.scheduleParserService.parseSchedulesExcel(schedulesBuffer);

    const hasAnyError = studentsResult.hasErrors || schedulesResult.hasErrors;
    const canActivate =
      !hasAnyError &&
      studentsResult.validRowsCount > 0 &&
      schedulesResult.schedules.length > 0;

    const schedules = schedulesResult.schedules || [];
    const estimatedStartDate =
      schedules.length > 0 ? schedules[0].classDate : '';
    const estimatedEndDate =
      schedules.length > 0 ? schedules[schedules.length - 1].classDate : '';

    this.logger.log(
      `Vista previa generada: ${studentsResult.validRowsCount} estudiantes, ${schedules.length} clases. Habilitado para activar: ${canActivate}`,
    );

    return {
      isValid: !hasAnyError,
      canActivate,
      totalStudents: studentsResult.validRowsCount,
      totalSchedules: schedules.length,
      estimatedStartDate,
      estimatedEndDate,
      studentsPreview: studentsResult.data,
      schedulesPreview: schedules,
      validationErrors: {
        studentsErrors: studentsResult.errors,
        schedulesErrors: schedulesResult.errors,
      },
    };
  }

  /**
   * Activa un nuevo módulo académico con transacción ACID, archivando el anterior (US-07, RF-13, RF-14, RF-15, RN-01, RN-08)
   */
  async activateNewModule(
    dto: ActivateModuleDto,
    adminUser?: { id?: string; email?: string; username?: string },
    ipAddress?: string,
  ): Promise<ActivatedModuleResponseDto> {
    this.logger.log(
      `Iniciando activación transaccional del módulo "${dto.name}" (${dto.code})...`,
    );

    if (!dto.students || dto.students.length === 0) {
      throw new BadRequestException(
        'Debe proporcionar al menos un estudiante para matricular en el módulo',
      );
    }

    if (!dto.schedules || dto.schedules.length === 0) {
      throw new BadRequestException(
        'Debe proporcionar al menos una fecha de clase programada en el calendario',
      );
    }

    // Ordenar fechas cronológicamente para determinar inicio y fin exactos
    const sortedSchedules = [...dto.schedules].sort((a, b) =>
      a.classDate.localeCompare(b.classDate),
    );
    const startDate = sortedSchedules[0].classDate;
    const endDate = sortedSchedules[sortedSchedules.length - 1].classDate;

    // Iniciar transacción de base de datos con QueryRunner (ACID)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar que el código no exista previamente
      const normalizedCode = dto.code.trim().toUpperCase();
      const existingWithCode = await queryRunner.manager.findOne(
        AcademicModule,
        {
          where: { code: normalizedCode },
        },
      );

      if (existingWithCode) {
        throw new BadRequestException(
          `Ya existe un módulo académico con el código "${normalizedCode}". Ingrese un código único.`,
        );
      }

      // 2. Archivar el módulo actualmente activo si existe (RN-01, RN-08)
      const currentActiveModule = await queryRunner.manager.findOne(
        AcademicModule,
        {
          where: { status: ModuleStatus.ACTIVE },
        },
      );

      let archivedInfo: string | null = null;
      if (currentActiveModule) {
        await queryRunner.manager.update(
          AcademicModule,
          { id: currentActiveModule.id },
          { status: ModuleStatus.INACTIVE },
        );
        archivedInfo = `Módulo previo "${currentActiveModule.name}" (${currentActiveModule.code}) archivado como INACTIVE`;
        this.logger.log(`[RN-01 / RN-08] ${archivedInfo}`);
      }

      // 3. Crear el nuevo AcademicModule con estado ACTIVE
      const newModule = queryRunner.manager.create(AcademicModule, {
        name: dto.name.trim(),
        code: normalizedCode,
        status: ModuleStatus.ACTIVE,
        startDate,
        endDate,
      });
      const savedModule = await queryRunner.manager.save(
        AcademicModule,
        newModule,
      );

      // 4. Insertar estudiantes asociados al nuevo módulo en lote
      const studentEntities = dto.students.map((s) =>
        queryRunner.manager.create(Student, {
          moduleId: savedModule.id,
          registrationNumber: s.registrationNumber.trim(),
          fullName: s.fullName.trim(),
          email: s.email.trim().toLowerCase(),
        }),
      );
      await queryRunner.manager.save(Student, studentEntities);

      // 5. Insertar calendario asociado al nuevo módulo en lote
      const scheduleEntities = sortedSchedules.map((sch) =>
        queryRunner.manager.create(ClassSchedule, {
          moduleId: savedModule.id,
          classDate: sch.classDate,
          startTime: sch.startTime,
          endTime: sch.endTime,
        }),
      );
      await queryRunner.manager.save(ClassSchedule, scheduleEntities);

      // 6. Confirmar transacción
      await queryRunner.commitTransaction();

      // 7. Emitir registro inmutable de auditoría (RF-09, RN-07)
      try {
        await this.activityLogsService.createLog({
          moduleId: savedModule.id,
          userId: adminUser?.id ?? null,
          userIdentifier:
            adminUser?.email || adminUser?.username || 'admin@sistema.com',
          userRole: UserRole.ADMIN,
          action: ActivityAction.ACTIVATE_MODULE,
          entityAffected: 'AcademicModule',
          entityId: savedModule.id,
          previousValue: currentActiveModule
            ? {
                id: currentActiveModule.id,
                code: currentActiveModule.code,
                name: currentActiveModule.name,
              }
            : null,
          newValue: {
            id: savedModule.id,
            code: savedModule.code,
            name: savedModule.name,
            totalStudents: studentEntities.length,
            totalSchedules: scheduleEntities.length,
            startDate,
            endDate,
          },
          ipAddress: ipAddress ?? null,
        });
      } catch (auditErr: any) {
        this.logger.warn(
          `No se pudo registrar bitácora de auditoría: ${auditErr.message}`,
        );
      }

      this.logger.log(
        `Activación completada exitosamente: Módulo ${savedModule.code} activo con ${studentEntities.length} estudiantes y ${scheduleEntities.length} clases.`,
      );

      return {
        id: savedModule.id,
        name: savedModule.name,
        code: savedModule.code,
        status: savedModule.status,
        startDate: savedModule.startDate,
        endDate: savedModule.endDate,
        studentsCount: studentEntities.length,
        schedulesCount: scheduleEntities.length,
        archivedPreviousModuleInfo: archivedInfo,
        message: `El módulo "${savedModule.name}" (${savedModule.code}) ha sido activado exitosamente.`,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rollback ejecutado por error en activación: ${err.message}`,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene el módulo académico actualmente activo con sus estudiantes y calendario (RN-01)
   */
  async getActiveModule(): Promise<AcademicModule | null> {
    return this.modulesRepository.findOne({
      where: { status: ModuleStatus.ACTIVE },
      relations: {
        students: true,
        schedules: true,
      },
    });
  }
}

import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ModuleStatus } from '../../../common/enums';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { AcademicModule } from '../entities/academic-module.entity';
import { ExcelValidationException } from '../exceptions/excel-validation.exception';
import { ExcelParserService } from './excel-parser.service';
import { ModulesService } from './modules.service';
import { ScheduleParserService } from './schedule-parser.service';

describe('ModulesService', () => {
  let service: ModulesService;
  let excelParserService: ExcelParserService;
  let scheduleParserService: ScheduleParserService;
  let activityLogsService: ActivityLogsService;
  let mockQueryRunner: any;
  let mockDataSource: any;
  let mockModulesRepository: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        update: jest.fn(),
        create: jest.fn().mockImplementation((entityClass, data) => data),
        save: jest.fn().mockImplementation((entityClass, data) => {
          if (Array.isArray(data)) return data;
          return { id: 'new-module-id', ...data };
        }),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    mockModulesRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModulesService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(AcademicModule),
          useValue: mockModulesRepository,
        },
        {
          provide: ExcelParserService,
          useValue: {
            parseStudentsExcel: jest.fn(),
          },
        },
        {
          provide: ScheduleParserService,
          useValue: {
            parseSchedulesExcel: jest.fn(),
          },
        },
        {
          provide: ActivityLogsService,
          useValue: {
            createLog: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<ModulesService>(ModulesService);
    excelParserService = module.get<ExcelParserService>(ExcelParserService);
    scheduleParserService = module.get<ScheduleParserService>(
      ScheduleParserService,
    );
    activityLogsService = module.get<ActivityLogsService>(ActivityLogsService);
  });

  describe('previewModuleData', () => {
    it('debe lanzar excepción si falta alguno de los buffers', async () => {
      await expect(
        service.previewModuleData(undefined, Buffer.from('test')),
      ).rejects.toThrow(ExcelValidationException);

      await expect(
        service.previewModuleData(Buffer.from('test'), undefined),
      ).rejects.toThrow(ExcelValidationException);
    });

    it('debe generar vista previa consolidada exitosa cuando ambos archivos son correctos (RF-16)', async () => {
      const mockStudentsResult = {
        totalRows: 2,
        validRowsCount: 2,
        errorCount: 0,
        hasErrors: false,
        errors: [],
        data: [
          {
            registrationNumber: '1001',
            fullName: 'Juan Pérez',
            email: 'juan@gmail.com',
            rowNumber: 2,
          },
          {
            registrationNumber: '1002',
            fullName: 'María López',
            email: 'maria@gmail.com',
            rowNumber: 3,
          },
        ],
      };

      const mockSchedulesResult = {
        totalSessions: 2,
        hasErrors: false,
        errorCount: 0,
        errors: [],
        schedules: [
          {
            classDate: '2026-10-05',
            startTime: '18:00',
            endTime: '21:00',
            rowNumber: 2,
          },
          {
            classDate: '2026-10-07',
            startTime: '18:00',
            endTime: '21:00',
            rowNumber: 3,
          },
        ],
      };

      jest
        .spyOn(excelParserService, 'parseStudentsExcel')
        .mockResolvedValue(mockStudentsResult);
      jest
        .spyOn(scheduleParserService, 'parseSchedulesExcel')
        .mockResolvedValue(mockSchedulesResult);

      const result = await service.previewModuleData(
        Buffer.from('students'),
        Buffer.from('schedules'),
      );

      expect(result.isValid).toBe(true);
      expect(result.canActivate).toBe(true);
      expect(result.totalStudents).toBe(2);
      expect(result.totalSchedules).toBe(2);
      expect(result.estimatedStartDate).toBe('2026-10-05');
      expect(result.estimatedEndDate).toBe('2026-10-07');
      expect(result.studentsPreview).toHaveLength(2);
      expect(result.schedulesPreview).toHaveLength(2);
    });

    it('debe marcar canActivate como false si alguno de los archivos contiene errores', async () => {
      const mockStudentsResult = {
        totalRows: 2,
        validRowsCount: 1,
        errorCount: 1,
        hasErrors: true,
        errors: [
          {
            row: 3,
            field: 'registrationNumber',
            value: '1001',
            message: 'Duplicado',
          },
        ],
        data: [],
      };

      const mockSchedulesResult = {
        totalSessions: 1,
        hasErrors: false,
        errorCount: 0,
        errors: [],
        schedules: [
          {
            classDate: '2026-10-05',
            startTime: '18:00',
            endTime: '21:00',
            rowNumber: 2,
          },
        ],
      };

      jest
        .spyOn(excelParserService, 'parseStudentsExcel')
        .mockResolvedValue(mockStudentsResult);
      jest
        .spyOn(scheduleParserService, 'parseSchedulesExcel')
        .mockResolvedValue(mockSchedulesResult);

      const result = await service.previewModuleData(
        Buffer.from('students'),
        Buffer.from('schedules'),
      );

      expect(result.isValid).toBe(false);
      expect(result.canActivate).toBe(false);
      expect(result.validationErrors.studentsErrors).toHaveLength(1);
    });
  });

  describe('activateNewModule (US-07)', () => {
    const validDto = {
      name: 'Módulo 2: IaC',
      code: 'DCID-V1E1-M2',
      description: 'Pruebas de infraestructura',
      students: [
        {
          registrationNumber: '1001',
          fullName: 'Juan Pérez',
          email: 'juan@gmail.com',
          rowNumber: 2,
        },
      ],
      schedules: [
        {
          classDate: '2026-10-05',
          startTime: '18:00',
          endTime: '21:00',
          rowNumber: 2,
        },
        {
          classDate: '2026-10-12',
          startTime: '18:00',
          endTime: '21:00',
          rowNumber: 3,
        },
      ],
    };

    it('debe lanzar BadRequestException si la lista de estudiantes o calendario está vacía', async () => {
      await expect(
        service.activateNewModule({ ...validDto, students: [] }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.activateNewModule({ ...validDto, schedules: [] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si el código ya existe en otro módulo', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({
        id: 'existing-id',
        code: 'DCID-V1E1-M2',
      });

      await expect(service.activateNewModule(validDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debe activar el nuevo módulo y archivar el anterior con transacción ACID (RN-01, RN-08)', async () => {
      // 1er findOne: check code duplication -> null
      // 2do findOne: check current active module -> active module
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'prev-id',
          name: 'Módulo 1: Introducción',
          code: 'DCID-V1E1-M1',
          status: ModuleStatus.ACTIVE,
        });

      const response = await service.activateNewModule(validDto, {
        email: 'admin@sistema.com',
      });

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        AcademicModule,
        { id: 'prev-id' },
        { status: ModuleStatus.INACTIVE },
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(response.name).toBe('Módulo 2: IaC');
      expect(response.code).toBe('DCID-V1E1-M2');
      expect(response.status).toBe(ModuleStatus.ACTIVE);
      expect(response.startDate).toBe('2026-10-05');
      expect(response.endDate).toBe('2026-10-12');
      expect(response.studentsCount).toBe(1);
      expect(response.schedulesCount).toBe(2);
      expect(response.archivedPreviousModuleInfo).toContain('DCID-V1E1-M1');
      expect(activityLogsService.createLog).toHaveBeenCalled();
    });

    it('debe ejecutar rollback si la inserción de datos arroja error', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockQueryRunner.manager.save.mockRejectedValueOnce(
        new Error('DB Error connection'),
      );

      await expect(service.activateNewModule(validDto)).rejects.toThrow(
        'DB Error connection',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('getActiveModule', () => {
    it('debe retornar el módulo activo', async () => {
      const mockActive = {
        id: 'active-id',
        name: 'Módulo Activo',
        status: ModuleStatus.ACTIVE,
      };
      mockModulesRepository.findOne.mockResolvedValue(mockActive);

      const result = await service.getActiveModule();
      expect(result).toEqual(mockActive);
    });
  });
});

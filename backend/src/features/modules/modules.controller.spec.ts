import { Test, TestingModule } from '@nestjs/testing';
import { ModulesController } from './modules.controller';
import { ExcelParserService } from './services/excel-parser.service';
import { ScheduleParserService } from './services/schedule-parser.service';
import { ExcelValidationException } from './exceptions/excel-validation.exception';

import { ModulesService } from './services/modules.service';

describe('ModulesController', () => {
  let controller: ModulesController;
  let excelParserService: ExcelParserService;
  let scheduleParserService: ScheduleParserService;
  let modulesService: ModulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulesController],
      providers: [
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
          provide: ModulesService,
          useValue: {
            previewModuleData: jest.fn(),
            activateNewModule: jest.fn(),
            getActiveModule: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ModulesController>(ModulesController);
    excelParserService = module.get<ExcelParserService>(ExcelParserService);
    scheduleParserService = module.get<ScheduleParserService>(
      ScheduleParserService,
    );
    modulesService = module.get<ModulesService>(ModulesService);
  });

  describe('importStudents', () => {
    it('debe lanzar ExcelValidationException si no se envía ningún archivo', async () => {
      await expect(controller.importStudents(undefined)).rejects.toThrow(
        ExcelValidationException,
      );
    });

    it('debe retornar resultado si el archivo es válido y no contiene errores', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'estudiantes.xlsx',
      } as Express.Multer.File;

      const mockResult = {
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
        ],
      };

      jest
        .spyOn(excelParserService, 'parseStudentsExcel')
        .mockResolvedValue(mockResult);

      const response = await controller.importStudents(mockFile);
      expect(response).toEqual(mockResult);
    });

    it('debe lanzar ExcelValidationException si el archivo contiene errores por fila (RF-11)', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'estudiantes.xlsx',
      } as Express.Multer.File;

      const mockResult = {
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

      jest
        .spyOn(excelParserService, 'parseStudentsExcel')
        .mockResolvedValue(mockResult);

      await expect(controller.importStudents(mockFile)).rejects.toThrow(
        ExcelValidationException,
      );
    });
  });

  describe('importSchedules', () => {
    it('debe lanzar ExcelValidationException si no se envía archivo de calendario', async () => {
      await expect(controller.importSchedules(undefined)).rejects.toThrow(
        ExcelValidationException,
      );
    });

    it('debe procesar y retornar calendario válido (RF-12)', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'fechas.xlsx',
      } as Express.Multer.File;

      const mockResult = {
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
        ],
      };

      jest
        .spyOn(scheduleParserService, 'parseSchedulesExcel')
        .mockResolvedValue(mockResult);

      const response = await controller.importSchedules(mockFile);
      expect(response).toEqual(mockResult);
    });

    it('debe lanzar ExcelValidationException si el calendario contiene errores', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'fechas.xlsx',
      } as Express.Multer.File;

      const mockResult = {
        totalSessions: 2,
        hasErrors: true,
        errorCount: 1,
        errors: [
          {
            row: 3,
            field: 'classDate',
            value: '2026-10-05',
            message: 'Fecha repetida',
          },
        ],
        schedules: [],
      };

      jest
        .spyOn(scheduleParserService, 'parseSchedulesExcel')
        .mockResolvedValue(mockResult);

      await expect(controller.importSchedules(mockFile)).rejects.toThrow(
        ExcelValidationException,
      );
    });
  });

  describe('previewModule', () => {
    it('debe retornar ModulePreviewSummaryDto si ambos archivos son válidos (RF-16)', async () => {
      const mockFiles = {
        studentsFile: [
          {
            buffer: Buffer.from('students'),
            originalname: 'estudiantes.xlsx',
          } as Express.Multer.File,
        ],
        schedulesFile: [
          {
            buffer: Buffer.from('schedules'),
            originalname: 'fechas.xlsx',
          } as Express.Multer.File,
        ],
      };

      const mockSummary = {
        isValid: true,
        canActivate: true,
        totalStudents: 15,
        totalSchedules: 4,
        estimatedStartDate: '2026-10-05',
        estimatedEndDate: '2026-10-15',
        studentsPreview: [],
        schedulesPreview: [],
        validationErrors: {
          studentsErrors: [],
          schedulesErrors: [],
        },
      };

      jest
        .spyOn(modulesService, 'previewModuleData')
        .mockResolvedValue(mockSummary);

      const response = await controller.previewModule(mockFiles);
      expect(response).toEqual(mockSummary);
      expect(modulesService.previewModuleData).toHaveBeenCalledWith(
        mockFiles.studentsFile[0].buffer,
        mockFiles.schedulesFile[0].buffer,
      );
    });

    it('debe lanzar ExcelValidationException si el resumen tiene isValid false', async () => {
      const mockFiles = {
        studentsFile: [
          {
            buffer: Buffer.from('students'),
            originalname: 'estudiantes.xlsx',
          } as Express.Multer.File,
        ],
        schedulesFile: [
          {
            buffer: Buffer.from('schedules'),
            originalname: 'fechas.xlsx',
          } as Express.Multer.File,
        ],
      };

      const mockSummary = {
        isValid: false,
        canActivate: false,
        totalStudents: 0,
        totalSchedules: 0,
        estimatedStartDate: '',
        estimatedEndDate: '',
        studentsPreview: [],
        schedulesPreview: [],
        validationErrors: {
          studentsErrors: [
            {
              row: 2,
              field: 'email',
              value: '',
              message: 'Correo inválido',
            },
          ],
          schedulesErrors: [],
        },
      };

      jest
        .spyOn(modulesService, 'previewModuleData')
        .mockResolvedValue(mockSummary);

      await expect(controller.previewModule(mockFiles)).rejects.toThrow(
        ExcelValidationException,
      );
    });
  });

  describe('activateModule (US-07)', () => {
    it('debe activar el módulo y retornar ActivatedModuleResponseDto (RF-14)', async () => {
      const mockDto = {
        name: 'Módulo 2: IaC',
        code: 'DCID-V1E1-M2',
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
        ],
      };

      const mockResponse = {
        id: 'new-id',
        name: 'Módulo 2: IaC',
        code: 'DCID-V1E1-M2',
        status: 'ACTIVE' as any,
        startDate: '2026-10-05',
        endDate: '2026-10-05',
        studentsCount: 1,
        schedulesCount: 1,
        archivedPreviousModuleInfo: 'Módulo 1 archivado',
        message: 'Módulo activado exitosamente',
      };

      jest
        .spyOn(modulesService, 'activateNewModule')
        .mockResolvedValue(mockResponse);

      const adminUser = { id: 'admin-id', email: 'admin@sistema.com' };
      const req = { ip: '127.0.0.1' };

      const result = await controller.activateModule(mockDto, adminUser, req);
      expect(result).toEqual(mockResponse);
      expect(modulesService.activateNewModule).toHaveBeenCalledWith(
        mockDto,
        adminUser,
        req.ip,
      );
    });
  });

  describe('getActiveModule', () => {
    it('debe retornar el módulo activo', async () => {
      const mockActive = {
        id: 'active-id',
        name: 'Módulo Piloto',
        status: 'ACTIVE' as any,
      };

      jest
        .spyOn(modulesService, 'getActiveModule')
        .mockResolvedValue(mockActive as any);

      const result = await controller.getActiveModule();
      expect(result).toEqual(mockActive);
    });
  });
});

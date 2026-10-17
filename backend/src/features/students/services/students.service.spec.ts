import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ModuleStatus } from '../../../common/enums';
import { AcademicModule } from '../../modules/entities/academic-module.entity';
import { Student } from '../entities/student.entity';
import { StudentsService } from './students.service';

describe('StudentsService', () => {
  let service: StudentsService;
  let mockStudentsRepository: any;
  let mockModulesRepository: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    mockStudentsRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    mockModulesRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockStudentsRepository,
        },
        {
          provide: getRepositoryToken(AcademicModule),
          useValue: mockModulesRepository,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  describe('getActiveModuleStudents', () => {
    it('debe retornar lista vacía y aviso si no existe ningún módulo activo', async () => {
      mockModulesRepository.findOne.mockResolvedValue(null);

      const result = await service.getActiveModuleStudents({
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        moduleName: 'Ningún módulo activo',
        totalCount: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        students: [],
      });
      expect(mockStudentsRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('debe listar estudiantes del módulo activo ordenados por matrícula ascendentemente', async () => {
      const mockActiveModule = {
        id: 'mod-123',
        name: 'Módulo 2: IaC',
        code: 'DCID-M2',
        status: ModuleStatus.ACTIVE,
      };
      mockModulesRepository.findOne.mockResolvedValue(mockActiveModule);

      const mockStudents = [
        {
          id: 'stud-1',
          registrationNumber: '1001',
          fullName: 'Ana García',
          email: 'ana@example.com',
          createdAt: new Date('2026-10-01'),
        },
        {
          id: 'stud-2',
          registrationNumber: '1002',
          fullName: 'Bernardo López',
          email: 'bernardo@example.com',
          createdAt: new Date('2026-10-01'),
        },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockStudents, 2]);

      const result = await service.getActiveModuleStudents({
        page: 1,
        limit: 20,
      });

      expect(mockModulesRepository.findOne).toHaveBeenCalledWith({
        where: { status: ModuleStatus.ACTIVE },
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'student.moduleId = :moduleId',
        { moduleId: 'mod-123' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'student.registrationNumber',
        'ASC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(result.totalCount).toBe(2);
      expect(result.moduleName).toBe('Módulo 2: IaC');
      expect(result.moduleCode).toBe('DCID-M2');
      expect(result.students).toHaveLength(2);
      expect(result.totalPages).toBe(1);
    });

    it('debe aplicar filtro ILIKE cuando se suministra término de búsqueda (search)', async () => {
      const mockActiveModule = {
        id: 'mod-123',
        name: 'Módulo 2: IaC',
        code: 'DCID-M2',
        status: ModuleStatus.ACTIVE,
      };
      mockModulesRepository.findOne.mockResolvedValue(mockActiveModule);

      const mockStudents = [
        {
          id: 'stud-1',
          registrationNumber: '1001',
          fullName: 'Carlos Ruiz',
          email: 'carlos@example.com',
          createdAt: new Date('2026-10-01'),
        },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockStudents, 1]);

      const result = await service.getActiveModuleStudents({
        search: 'Carlos',
        page: 1,
        limit: 10,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(student.fullName ILIKE :term OR student.registrationNumber ILIKE :term OR student.email ILIKE :term)',
        { term: '%Carlos%' },
      );
      expect(result.totalCount).toBe(1);
      expect(result.students[0].fullName).toBe('Carlos Ruiz');
    });

    it('debe calcular correctamente totalPages para paginación', async () => {
      const mockActiveModule = {
        id: 'mod-123',
        name: 'Módulo 2: IaC',
        code: 'DCID-M2',
        status: ModuleStatus.ACTIVE,
      };
      mockModulesRepository.findOne.mockResolvedValue(mockActiveModule);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 45]);

      const result = await service.getActiveModuleStudents({
        page: 2,
        limit: 10,
      });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.totalPages).toBe(5);
      expect(result.totalCount).toBe(45);
      expect(result.page).toBe(2);
    });
  });
});

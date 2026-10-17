import { Inject } from '@nestjs/common';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: any) => Inject(`${entity.name}Repository`),
  getRepositoryToken: (entity: any) => `${entity.name}Repository`,
}));

import { Test, TestingModule } from '@nestjs/testing';
const getRepositoryToken = (entity: any) => `${entity.name}Repository`;
import { StudentAuthService } from './student-auth.service';
import { Student } from '../students/entities/student.entity';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { JwtService } from '../../common/services/jwt.service';
import { StudentNotFoundException } from './exceptions/student-not-found.exception';
import { ModuleStatus, UserRole } from '../../common/enums';

describe('StudentAuthService', () => {
  let service: StudentAuthService;
  let activityLogsService: ActivityLogsService;
  let jwtService: JwtService;

  const mockQueryBuilder = {
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockStudentRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockActivityLogsService = {
    createLog: jest.fn().mockResolvedValue({ id: 'log-1' }),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token-123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentAuthService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockStudentRepository,
        },
        {
          provide: ActivityLogsService,
          useValue: mockActivityLogsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<StudentAuthService>(StudentAuthService);
    activityLogsService = module.get<ActivityLogsService>(ActivityLogsService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('debe autenticar exitosamente por correo o registro si el estudiante pertenece a un módulo activo', async () => {
      const mockStudent = {
        id: 'student-uuid-1',
        registrationNumber: '1001',
        fullName: 'Juan Pérez',
        email: 'juan@gmail.com',
        moduleId: 'module-uuid-1',
        module: {
          id: 'module-uuid-1',
          name: 'Módulo Piloto DevOps',
          code: 'DCID-V1E1-M2',
          status: ModuleStatus.ACTIVE,
        },
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockStudent);

      const result = await service.login({ identifier: 'juan@gmail.com' });

      expect(result).toHaveProperty('token', 'mock-jwt-token-123');
      expect(result.student).toEqual({
        id: mockStudent.id,
        registrationNumber: mockStudent.registrationNumber,
        fullName: mockStudent.fullName,
        email: mockStudent.email,
        module: {
          id: mockStudent.module.id,
          name: mockStudent.module.name,
          code: mockStudent.module.code,
          status: mockStudent.module.status,
        },
      });
      expect(mockActivityLogsService.createLog).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockStudent.id,
          role: UserRole.STUDENT,
          registrationNumber: mockStudent.registrationNumber,
        }),
      );
    });

    it('debe lanzar StudentNotFoundException si el estudiante no existe o el módulo está inactivo', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.login({ identifier: 'inexistente@correo.com' }),
      ).rejects.toThrow(StudentNotFoundException);

      expect(mockActivityLogsService.createLog).not.toHaveBeenCalled();
    });
  });
});

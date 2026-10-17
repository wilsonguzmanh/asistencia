import { Inject } from '@nestjs/common';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: any) => Inject(`${entity.name}Repository`),
  getRepositoryToken: (entity: any) => `${entity.name}Repository`,
}));

import { Test, TestingModule } from '@nestjs/testing';
const getRepositoryToken = (entity: any) => `${entity.name}Repository`;
import { Repository } from 'typeorm';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityAction, UserRole } from '../../common/enums';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';

describe('ActivityLogsService', () => {
  let service: ActivityLogsService;
  let repository: Repository<ActivityLog>;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((log) =>
      Promise.resolve({
        id: 'mock-uuid-log-1',
        ...log,
        createdAt: new Date(),
      }),
    ),
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([
        [
          {
            id: 'log-1',
            action: ActivityAction.UPDATE_ATTENDANCE,
            userIdentifier: 'admin@test.com',
          },
        ],
        1,
      ]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityLogsService,
        {
          provide: getRepositoryToken(ActivityLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ActivityLogsService>(ActivityLogsService);
    repository = module.get<Repository<ActivityLog>>(getRepositoryToken(ActivityLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('debe crear y persistir un log de auditoría correctamente', async () => {
      const dto: CreateActivityLogDto = {
        moduleId: 'mock-module-id',
        userId: 'mock-user-id',
        userIdentifier: 'juan@gmail.com',
        userRole: UserRole.STUDENT,
        action: ActivityAction.MARK_ATTENDANCE,
        entityAffected: 'Attendance',
        entityId: 'mock-attendance-id',
        newValue: { status: 'PRESENTE' },
        ipAddress: '127.0.0.1',
      };

      const result = await service.createLog(dto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userIdentifier: 'juan@gmail.com',
          userRole: UserRole.STUDENT,
          action: ActivityAction.MARK_ATTENDANCE,
          entityAffected: 'Attendance',
        }),
      );
      expect(repository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'mock-uuid-log-1');
    });
  });

  describe('findByModule', () => {
    it('debe retornar logs filtrados por moduleId ordenados descendentemente', async () => {
      const moduleId = 'mock-module-id';
      await service.findByModule(moduleId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { moduleId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findLogsWithFilters (US-15)', () => {
    it('debe retornar resultados paginados y aplicar filtros de búsqueda', async () => {
      const result = await service.findLogsWithFilters({
        action: ActivityAction.UPDATE_ATTENDANCE,
        search: 'admin',
        page: 1,
        limit: 10,
      });

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });
});


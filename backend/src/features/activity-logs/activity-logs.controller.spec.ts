import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityAction } from '../../common/enums';

describe('ActivityLogsController', () => {
  let controller: ActivityLogsController;
  let service: any;

  const mockActivityLogsService = {
    findLogsWithFilters: jest.fn().mockResolvedValue({
      data: [
        {
          id: 'log-1',
          action: ActivityAction.UPDATE_ATTENDANCE,
          userIdentifier: 'admin@sistema.com',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityLogsController],
      providers: [
        {
          provide: ActivityLogsService,
          useValue: mockActivityLogsService,
        },
      ],
    }).compile();

    controller = module.get<ActivityLogsController>(ActivityLogsController);
    service = mockActivityLogsService;
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('getLogs debe invocar a findLogsWithFilters con los query params', async () => {
    const query = { action: ActivityAction.UPDATE_ATTENDANCE, page: 1, limit: 10 };
    const res = await controller.getLogs(query);

    expect(service.findLogsWithFilters).toHaveBeenCalledWith(query);
    expect(res.data).toHaveLength(1);
    expect(res.total).toBe(1);
  });
});

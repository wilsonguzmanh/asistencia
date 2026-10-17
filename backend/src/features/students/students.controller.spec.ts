import { Test, TestingModule } from '@nestjs/testing';
import { StudentFilterQueryDto } from './dto/student-filter-query.dto';
import { StudentListResponseDto } from './dto/student-list-response.dto';
import { StudentsController } from './students.controller';
import { StudentsService } from './services/students.service';

describe('StudentsController', () => {
  let controller: StudentsController;
  let studentsService: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: {
            getActiveModuleStudents: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    studentsService = module.get<StudentsService>(StudentsService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getActiveModuleStudents', () => {
    it('debe llamar a studentsService.getActiveModuleStudents con los parámetros query', async () => {
      const mockQuery: StudentFilterQueryDto = {
        search: '1001',
        page: 1,
        limit: 20,
      };

      const mockResponse: StudentListResponseDto = {
        moduleName: 'Módulo 2: IaC',
        moduleCode: 'DCID-M2',
        totalCount: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        students: [
          {
            id: 'uuid-1',
            registrationNumber: '1001',
            fullName: 'Carlos Ruiz',
            email: 'carlos@example.com',
            createdAt: new Date(),
          },
        ],
      };

      jest
        .spyOn(studentsService, 'getActiveModuleStudents')
        .mockResolvedValue(mockResponse);

      const result = await controller.getActiveModuleStudents(mockQuery);

      expect(studentsService.getActiveModuleStudents).toHaveBeenCalledWith(
        mockQuery,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

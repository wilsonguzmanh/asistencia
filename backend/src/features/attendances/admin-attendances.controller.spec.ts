import { Test, TestingModule } from '@nestjs/testing';
import { AdminAttendancesController } from './admin-attendances.controller';
import { AttendancesService } from './attendances.service';
import { AttendanceStatus, UserRole } from '../../common/enums';

describe('AdminAttendancesController', () => {
  let controller: AdminAttendancesController;
  let service: any;

  const mockAttendancesService = {
    getAdminMatrix: jest.fn().mockResolvedValue({
      moduleName: 'Módulo Piloto DevOps',
      moduleId: 'mod-1',
      summary: {
        totalStudents: 3,
        totalClasses: 1,
        totalPresent: 2,
        totalAbsent: 1,
        attendancePercentage: 66.7,
      },
      schedules: [],
      students: [],
      rows: [],
    }),
    overrideAttendance: jest.fn().mockResolvedValue({
      id: 'att-1',
      status: AttendanceStatus.PRESENTE,
      remarks: 'Justificado',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAttendancesController],
      providers: [
        {
          provide: AttendancesService,
          useValue: mockAttendancesService,
        },
      ],
    }).compile();

    controller = module.get<AdminAttendancesController>(
      AdminAttendancesController,
    );
    service = mockAttendancesService;
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('getMatrix debe llamar a AttendancesService.getAdminMatrix', async () => {
    const query = { classDate: '2026-10-13' };
    const result = await controller.getMatrix(query);

    expect(service.getAdminMatrix).toHaveBeenCalledWith(query);
    expect(result.moduleName).toBe('Módulo Piloto DevOps');
  });

  it('overrideAttendance debe llamar a AttendancesService.overrideAttendance con usuario autenticado', async () => {
    const dto = {
      studentId: 'st-1',
      classScheduleId: 'sch-1',
      status: AttendanceStatus.PRESENTE,
      justification: 'Justificado por trabajo',
    };
    const req = {
      user: { id: 'admin-1', username: 'admin', email: 'admin@test.com' },
    };

    const result = await controller.overrideAttendance(dto, req);

    expect(service.overrideAttendance).toHaveBeenCalledWith(dto, req.user);
    expect(result.status).toBe(AttendanceStatus.PRESENTE);
  });
});

import { Inject } from '@nestjs/common';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: any) => Inject(`${entity.name}Repository`),
  getRepositoryToken: (entity: any) => `${entity.name}Repository`,
}));

import { Test, TestingModule } from '@nestjs/testing';
const getRepositoryToken = (entity: any) => `${entity.name}Repository`;
import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';
import { ClassSchedule } from '../schedules/entities/class-schedule.entity';
import { AcademicModule } from '../modules/entities/academic-module.entity';
import { Student } from '../students/entities/student.entity';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { NotClassDayException } from './exceptions/not-class-day.exception';
import { AlreadyMarkedAttendanceException } from './exceptions/already-marked-attendance.exception';
import { AttendanceStatus, ModuleStatus, UserRole } from '../../common/enums';

describe('AttendancesService', () => {
  let service: AttendancesService;
  let attendanceRepo: any;
  let scheduleRepo: any;
  let moduleRepo: any;
  let studentRepo: any;
  let activityLogsService: any;

  const mockAttendanceRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((att) =>
      Promise.resolve({
        id: 'mock-att-uuid-1',
        ...att,
        markedAt: new Date(),
      }),
    ),
    createQueryBuilder: jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockScheduleRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockModuleRepo = {
    findOne: jest.fn(),
  };

  const mockStudentRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockActivityLogsService = {
    createLog: jest.fn().mockResolvedValue({ id: 'mock-log-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendancesService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockAttendanceRepo,
        },
        {
          provide: getRepositoryToken(ClassSchedule),
          useValue: mockScheduleRepo,
        },
        {
          provide: getRepositoryToken(AcademicModule),
          useValue: mockModuleRepo,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: mockStudentRepo,
        },
        {
          provide: ActivityLogsService,
          useValue: mockActivityLogsService,
        },
      ],
    }).compile();

    service = module.get<AttendancesService>(AttendancesService);
    attendanceRepo = mockAttendanceRepo;
    scheduleRepo = mockScheduleRepo;
    moduleRepo = mockModuleRepo;
    studentRepo = mockStudentRepo;
    activityLogsService = mockActivityLogsService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getTodayStatus', () => {
    it('debe indicar hasClassToday=true y alreadyMarked=false si hay clase hoy y el alumno aun no marco', async () => {
      const today = new Date().toISOString().split('T')[0];
      scheduleRepo.findOne.mockResolvedValue({
        id: 'schedule-today-id',
        classDate: today,
        startTime: '18:00',
        endTime: '21:00',
      });
      attendanceRepo.findOne.mockResolvedValue(null);

      const result = await service.getTodayStatus('student-1', 'module-1');

      expect(result.hasClassToday).toBe(true);
      expect(result.alreadyMarked).toBe(false);
      expect(result.classSchedule?.id).toBe('schedule-today-id');
    });

    it('debe indicar alreadyMarked=true si el alumno ya tiene registro previo hoy', async () => {
      const today = new Date().toISOString().split('T')[0];
      scheduleRepo.findOne.mockResolvedValue({
        id: 'schedule-today-id',
        classDate: today,
        startTime: '18:00',
        endTime: '21:00',
      });
      attendanceRepo.findOne.mockResolvedValue({
        id: 'attendance-id-1',
        markedAt: new Date(),
        status: AttendanceStatus.PRESENTE,
      });

      const result = await service.getTodayStatus('student-1', 'module-1');

      expect(result.hasClassToday).toBe(true);
      expect(result.alreadyMarked).toBe(true);
      expect(result.attendance?.status).toBe(AttendanceStatus.PRESENTE);
    });

    it('debe retornar hasClassToday=false si hoy no coincide con fecha de clase', async () => {
      scheduleRepo.findOne.mockResolvedValue(null);
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 'next-schedule-id',
        classDate: '2026-10-20',
        startTime: '18:00',
        endTime: '21:00',
      });

      const result = await service.getTodayStatus('student-1', 'module-1');

      expect(result.hasClassToday).toBe(false);
      expect(result.classSchedule).toBeNull();
      expect(result.nextScheduledClass?.classDate).toBe('2026-10-20');
    });
  });

  describe('checkIn', () => {
    it('debe registrar asistencia y auditar evento si hoy es dia de clase y no ha marcado previamente', async () => {
      const today = new Date().toISOString().split('T')[0];
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 'schedule-today-id',
        classDate: today,
      });
      attendanceRepo.findOne.mockResolvedValue(null);

      const result = await service.checkIn(
        'student-1',
        'module-1',
        { registrationNumber: '1001', fullName: 'Juan Pérez' },
        '127.0.0.1',
      );

      expect(attendanceRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 'student-1',
          classScheduleId: 'schedule-today-id',
          status: AttendanceStatus.PRESENTE,
        }),
      );
      expect(attendanceRepo.save).toHaveBeenCalled();
      expect(activityLogsService.createLog).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'mock-att-uuid-1');
    });

    it('debe lanzar NotClassDayException si hoy no hay clase en el modulo activo (RN-04)', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.checkIn('student-1', 'module-1', { registrationNumber: '1001' }),
      ).rejects.toThrow(NotClassDayException);
    });

    it('debe lanzar AlreadyMarkedAttendanceException si ya marco previamente (RN-03)', async () => {
      const today = new Date().toISOString().split('T')[0];
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 'schedule-today-id',
        classDate: today,
      });
      attendanceRepo.findOne.mockResolvedValue({
        id: 'already-marked-id',
        markedAt: new Date(),
      });

      await expect(
        service.checkIn('student-1', 'module-1', { registrationNumber: '1001' }),
      ).rejects.toThrow(AlreadyMarkedAttendanceException);
    });
  });

  describe('getMyHistory', () => {
    it('debe retornar historial con clases pasadas sin marca como FALTA (RN-05) y calcular metricas', async () => {
      const pastDate = '2026-10-01';
      const todayDate = new Date().toISOString().split('T')[0];
      const futureDate = '2026-10-25';

      scheduleRepo.find = jest.fn().mockResolvedValue([
        { id: 'sch-1', classDate: pastDate, startTime: '18:00', endTime: '21:00' },
        { id: 'sch-2', classDate: todayDate, startTime: '18:00', endTime: '21:00' },
        { id: 'sch-3', classDate: futureDate, startTime: '18:00', endTime: '21:00' },
      ]);

      attendanceRepo.find = jest.fn().mockResolvedValue([
        {
          classScheduleId: 'sch-2',
          status: AttendanceStatus.PRESENTE,
          markedAt: new Date(),
        },
      ]);

      const result = await service.getMyHistory('student-1', 'module-1');

      expect(result.summary.totalClasses).toBe(3);
      expect(result.summary.pastClasses).toBe(2);
      expect(result.summary.attendedCount).toBe(1);
      expect(result.summary.absentCount).toBe(1);
      expect(result.summary.attendancePercentage).toBe(50);

      // sch-1 es clase pasada sin marca -> FALTA (RN-05)
      expect(result.sessions[0].status).toBe('FALTA');
      // sch-2 es clase de hoy con marca -> PRESENTE
      expect(result.sessions[1].status).toBe('PRESENTE');
      // sch-3 es clase futura -> PROGRAMADA
      expect(result.sessions[2].status).toBe('PROGRAMADA');
    });
  });

  describe('getAdminMatrix (US-11)', () => {
    it('debe calcular correctamente los totales de presentes, faltas y matriz de estudiantes', async () => {
      const todayStr = new Date().toISOString().split('T')[0];

      moduleRepo.findOne.mockResolvedValue({
        id: 'mod-1',
        name: 'Módulo Piloto DevOps',
        status: ModuleStatus.ACTIVE,
      });

      scheduleRepo.find = jest.fn().mockResolvedValue([
        {
          id: 'sch-1',
          classDate: todayStr,
          startTime: '19:00',
          endTime: '22:00',
        },
      ]);

      studentRepo.find = jest.fn().mockResolvedValue([
        {
          id: 'st-1',
          registrationNumber: '1001',
          fullName: 'Juan Pérez',
          email: 'juan@gmail.com',
        },
        {
          id: 'st-2',
          registrationNumber: '1002',
          fullName: 'María López',
          email: 'maria@gmail.com',
        },
      ]);

      attendanceRepo.createQueryBuilder = jest.fn(() => ({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'att-1',
            studentId: 'st-1',
            classScheduleId: 'sch-1',
            status: AttendanceStatus.PRESENTE,
            markedAt: new Date(),
            markedByRole: UserRole.STUDENT,
            remarks: null,
          },
        ]),
      }));

      const matrix = await service.getAdminMatrix({});

      expect(matrix.moduleName).toBe('Módulo Piloto DevOps');
      expect(matrix.summary.totalStudents).toBe(2);
      expect(matrix.summary.totalClasses).toBe(1);
      expect(matrix.summary.totalPresent).toBe(1);
      expect(matrix.summary.totalAbsent).toBe(1);
      expect(matrix.summary.attendancePercentage).toBe(50);
      expect(matrix.rows).toHaveLength(2);
    });
  });

  describe('overrideAttendance (US-12)', () => {
    it('debe actualizar el estado de asistencia, registrar observaciones y auditar en ActivityLog', async () => {
      moduleRepo.findOne.mockResolvedValue({
        id: 'mod-1',
        status: ModuleStatus.ACTIVE,
      });

      studentRepo.findOne.mockResolvedValue({
        id: 'st-1',
        moduleId: 'mod-1',
        fullName: 'Juan Pérez',
      });

      scheduleRepo.findOne.mockResolvedValue({
        id: 'sch-1',
        moduleId: 'mod-1',
        classDate: '2026-10-10',
      });

      attendanceRepo.findOne.mockResolvedValue({
        id: 'att-1',
        studentId: 'st-1',
        classScheduleId: 'sch-1',
        status: AttendanceStatus.FALTA,
        remarks: null,
      });

      const result = await service.overrideAttendance(
        {
          studentId: 'st-1',
          classScheduleId: 'sch-1',
          status: AttendanceStatus.PRESENTE,
          justification: 'Certificado médico presentado',
        },
        { id: 'admin-1', username: 'admin', email: 'admin@test.com' },
      );

      expect(result.status).toBe(AttendanceStatus.PRESENTE);
      expect(result.remarks).toBe('Certificado médico presentado');
      expect(result.markedByRole).toBe(UserRole.ADMIN);

      expect(activityLogsService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE_ATTENDANCE',
          userRole: UserRole.ADMIN,
          entityAffected: 'Attendance',
        }),
      );
    });
  });
});

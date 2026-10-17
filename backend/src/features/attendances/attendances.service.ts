import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { ClassSchedule } from '../schedules/entities/class-schedule.entity';
import { AcademicModule } from '../modules/entities/academic-module.entity';
import { Student } from '../students/entities/student.entity';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { TodayStatusResponseDto } from './dto/today-status.dto';
import { AttendanceMatrixQueryDto } from './dto/attendance-matrix-query.dto';
import { AttendanceMatrixResponseDto } from './dto/attendance-matrix-response.dto';
import { OverrideAttendanceDto } from './dto/override-attendance.dto';
import { NotClassDayException } from './exceptions/not-class-day.exception';
import { AlreadyMarkedAttendanceException } from './exceptions/already-marked-attendance.exception';
import {
  ActivityAction,
  AttendanceStatus,
  ModuleStatus,
  UserRole,
} from '../../common/enums';

@Injectable()
export class AttendancesService {
  private readonly logger = new Logger(AttendancesService.name);

  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(ClassSchedule)
    private readonly scheduleRepository: Repository<ClassSchedule>,
    @InjectRepository(AcademicModule)
    private readonly moduleRepository: Repository<AcademicModule>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   */
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Consulta el estado de clase y marcación del estudiante para el día de hoy (RF-03, US-08)
   */
  async getTodayStatus(
    studentId: string,
    moduleId: string,
  ): Promise<TodayStatusResponseDto> {
    const today = this.getTodayString();

    // 1. Buscar si hay clase programada hoy para el módulo
    const todaySchedule = await this.scheduleRepository.findOne({
      where: { moduleId, classDate: today },
    });

    if (!todaySchedule) {
      // Buscar la próxima clase programada posterior a hoy
      const nextClass = await this.scheduleRepository
        .createQueryBuilder('schedule')
        .where('schedule.moduleId = :moduleId', { moduleId })
        .andWhere('schedule.classDate > :today', { today })
        .orderBy('schedule.classDate', 'ASC')
        .getOne();

      return {
        hasClassToday: false,
        classSchedule: null,
        alreadyMarked: false,
        attendance: null,
        nextScheduledClass: nextClass
          ? {
              id: nextClass.id,
              classDate: nextClass.classDate,
              startTime: nextClass.startTime,
              endTime: nextClass.endTime,
            }
          : null,
      };
    }

    // 2. Verificar si el estudiante ya registró asistencia para la clase de hoy
    const attendance = await this.attendanceRepository.findOne({
      where: {
        studentId,
        classScheduleId: todaySchedule.id,
      },
    });

    return {
      hasClassToday: true,
      classSchedule: {
        id: todaySchedule.id,
        classDate: todaySchedule.classDate,
        startTime: todaySchedule.startTime,
        endTime: todaySchedule.endTime,
      },
      alreadyMarked: !!attendance,
      attendance: attendance
        ? {
            id: attendance.id,
            markedAt: attendance.markedAt,
            status: attendance.status,
          }
        : null,
      nextScheduledClass: null,
    };
  }

  /**
   * Registra la asistencia en tiempo real para el estudiante en la fecha de hoy (RN-03, RN-04, US-08)
   */
  async checkIn(
    studentId: string,
    moduleId: string,
    userMeta: {
      registrationNumber?: string;
      fullName?: string;
      email?: string;
    },
    ipAddress?: string,
  ): Promise<Attendance> {
    const today = this.getTodayString();
    this.logger.log(
      `Intento de marcación para estudiante ${studentId} en fecha ${today}`,
    );

    // 1. Validar que la fecha actual corresponda a una clase programada del módulo activo (RN-04)
    const schedule = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.module', 'module')
      .where('module.id = :moduleId', { moduleId })
      .andWhere('module.status = :status', { status: ModuleStatus.ACTIVE })
      .andWhere('schedule.classDate = :today', { today })
      .getOne();

    if (!schedule) {
      this.logger.warn(
        `Marcación rechazada: Hoy (${today}) no es un día de clase programado en el módulo activo.`,
      );
      throw new NotClassDayException(today);
    }

    // 2. Validar que no exista marcación previa del estudiante hoy (RN-03)
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        studentId,
        classScheduleId: schedule.id,
      },
    });

    if (existingAttendance) {
      this.logger.warn(
        `Marcación rechazada: El estudiante ${studentId} ya tiene registro para la clase de hoy.`,
      );
      throw new AlreadyMarkedAttendanceException(existingAttendance.markedAt ?? today);
    }

    // 3. Registrar la asistencia con la hora exacta UTC del servidor
    const now = new Date();
    const attendance = this.attendanceRepository.create({
      studentId,
      classScheduleId: schedule.id,
      status: AttendanceStatus.PRESENTE,
      markedAt: now,
      markedByRole: UserRole.STUDENT,
    });

    const savedAttendance = await this.attendanceRepository.save(attendance);

    // 4. Registrar evento inmutable en el log de auditoría (RF-09, RN-07)
    const identifier = `${userMeta.registrationNumber || ''} - ${
      userMeta.fullName || userMeta.email || 'Estudiante'
    }`.trim();

    await this.activityLogsService.createLog({
      moduleId,
      userId: studentId,
      userIdentifier: identifier,
      userRole: UserRole.STUDENT,
      action: ActivityAction.MARK_ATTENDANCE,
      entityAffected: 'Attendance',
      entityId: savedAttendance.id,
      newValue: {
        classScheduleId: schedule.id,
        classDate: schedule.classDate,
        markedAt: savedAttendance.markedAt,
        status: savedAttendance.status,
      },
      ipAddress: ipAddress ?? null,
    });

    this.logger.log(
      `Asistencia registrada exitosamente para ${identifier} a las ${now.toISOString()}`,
    );

    return savedAttendance;
  }

  /**
   * Consulta el historial personal de asistencias del estudiante con cálculo automático de faltas (RF-04, RF-05, RN-05, US-09)
   */
  async getMyHistory(studentId: string, moduleId: string) {
    const today = this.getTodayString();

    // 1. Obtener todas las clases programadas del módulo
    const schedules = await this.scheduleRepository.find({
      where: { moduleId },
      order: { classDate: 'ASC' },
    });

    // 2. Obtener asistencias registradas del estudiante
    const attendances = await this.attendanceRepository.find({
      where: { studentId },
    });

    const attendanceMap = new Map<string, Attendance>();
    for (const att of attendances) {
      attendanceMap.set(att.classScheduleId, att);
    }

    let attendedCount = 0;
    let absentCount = 0;
    let pastClasses = 0;

    const sessions = schedules.map((schedule) => {
      const att = attendanceMap.get(schedule.id);
      let status: 'PRESENTE' | 'FALTA' | 'PROGRAMADA' | 'PENDIENTE_HOY';
      let markedAt: Date | string | null = null;

      if (att && att.status === AttendanceStatus.PRESENTE) {
        status = 'PRESENTE';
        markedAt = att.markedAt;
        attendedCount++;
        pastClasses++;
      } else if (schedule.classDate < today) {
        // Regla de Negocio RN-05: Fecha pasada sin registro es automáticamente FALTA
        status = 'FALTA';
        absentCount++;
        pastClasses++;
      } else if (schedule.classDate === today) {
        status = 'PENDIENTE_HOY';
      } else {
        status = 'PROGRAMADA';
      }

      return {
        id: schedule.id,
        classDate: schedule.classDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        status,
        markedAt,
      };
    });

    const totalClasses = schedules.length;
    const attendancePercentage =
      pastClasses > 0
        ? Math.round((attendedCount / pastClasses) * 1000) / 10
        : 100.0;

    return {
      summary: {
        totalClasses,
        pastClasses,
        attendedCount,
        absentCount,
        attendancePercentage,
      },
      sessions,
    };
  }

  /**
   * Consulta la planilla general y matriz de asistencias con filtros por fecha o estudiante (RF-08, US-11)
   */
  async getAdminMatrix(
    query: AttendanceMatrixQueryDto,
  ): Promise<AttendanceMatrixResponseDto> {
    const today = this.getTodayString();

    // 1. Obtener el módulo académico activo
    const activeModule = await this.moduleRepository.findOne({
      where: { status: ModuleStatus.ACTIVE },
    });

    if (!activeModule) {
      throw new NotFoundException(
        'No se encontró ningún módulo académico activo.',
      );
    }

    // 2. Obtener todas las fechas de clase del módulo
    const allSchedules = await this.scheduleRepository.find({
      where: { moduleId: activeModule.id },
      order: { classDate: 'ASC' },
    });

    // 3. Obtener todos los estudiantes inscritos
    const allStudents = await this.studentRepository.find({
      where: { moduleId: activeModule.id },
      order: { fullName: 'ASC' },
    });

    // 4. Aplicar filtros si fueron provistos
    let filteredSchedules = allSchedules;
    if (query.classDate && query.classDate !== 'ALL') {
      filteredSchedules = allSchedules.filter(
        (s) => s.classDate === query.classDate,
      );
    }

    let filteredStudents = allStudents;
    if (query.studentId && query.studentId !== 'ALL') {
      filteredStudents = allStudents.filter((s) => s.id === query.studentId);
    }

    // 5. Obtener todas las asistencias registradas para el módulo
    const attendances = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .innerJoin('attendance.classSchedule', 'schedule')
      .where('schedule.moduleId = :moduleId', { moduleId: activeModule.id })
      .getMany();

    const attendanceMap = new Map<string, Attendance>();
    for (const att of attendances) {
      attendanceMap.set(`${att.studentId}_${att.classScheduleId}`, att);
    }

    // 6. Construir filas de la matriz y calcular métricas agregadas
    let totalPresent = 0;
    let totalAbsent = 0;

    const rows = [];

    for (const student of filteredStudents) {
      for (const schedule of filteredSchedules) {
        const key = `${student.id}_${schedule.id}`;
        const att = attendanceMap.get(key);

        let status: AttendanceStatus;
        let markedAt: Date | null = null;
        let markedByRole: UserRole | null = null;
        let remarks: string | null = null;
        let attendanceId: string | null = null;

        if (att) {
          status = att.status;
          markedAt = att.markedAt;
          markedByRole = att.markedByRole;
          remarks = att.remarks;
          attendanceId = att.id;

          if (att.status === AttendanceStatus.PRESENTE) {
            totalPresent++;
          } else {
            totalAbsent++;
          }
        } else {
          // Si no hay registro físico:
          // RN-05: Si la fecha es pasada o hoy, se infiere FALTA
          status = AttendanceStatus.FALTA;
          if (schedule.classDate <= today) {
            totalAbsent++;
          }
        }

        rows.push({
          attendanceId,
          studentId: student.id,
          registrationNumber: student.registrationNumber,
          studentName: student.fullName,
          classScheduleId: schedule.id,
          classDate: schedule.classDate,
          timeRange: `${schedule.startTime} - ${schedule.endTime}`,
          status,
          markedAt,
          markedByRole,
          remarks,
        });
      }
    }

    const totalEvaluated = totalPresent + totalAbsent;
    const attendancePercentage =
      totalEvaluated > 0
        ? Math.round((totalPresent / totalEvaluated) * 1000) / 10
        : 0;

    return {
      moduleName: activeModule.name,
      moduleId: activeModule.id,
      summary: {
        totalStudents: allStudents.length,
        totalClasses: allSchedules.length,
        totalPresent,
        totalAbsent,
        attendancePercentage,
      },
      schedules: allSchedules.map((s) => ({
        id: s.id,
        classDate: s.classDate,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      students: allStudents.map((st) => ({
        id: st.id,
        registrationNumber: st.registrationNumber,
        fullName: st.fullName,
        email: st.email,
      })),
      rows,
    };
  }

  /**
   * Modificación manual de asistencia por un administrador con auditoría obligatoria (RF-07, RN-06, RN-07, US-12)
   */
  async overrideAttendance(
    dto: OverrideAttendanceDto,
    adminUser: { id?: string; sub?: string; email?: string; username?: string },
  ): Promise<Attendance> {
    const activeModule = await this.moduleRepository.findOne({
      where: { status: ModuleStatus.ACTIVE },
    });

    if (!activeModule) {
      throw new NotFoundException(
        'No se encontró ningún módulo académico activo.',
      );
    }

    const student = await this.studentRepository.findOne({
      where: { id: dto.studentId, moduleId: activeModule.id },
    });
    if (!student) {
      throw new NotFoundException(
        'El estudiante especificado no pertenece al módulo activo.',
      );
    }

    const schedule = await this.scheduleRepository.findOne({
      where: { id: dto.classScheduleId, moduleId: activeModule.id },
    });
    if (!schedule) {
      throw new NotFoundException(
        'La fecha de clase especificada no pertenece al módulo activo.',
      );
    }

    // Buscar si ya existía una marca
    let attendance = await this.attendanceRepository.findOne({
      where: {
        studentId: dto.studentId,
        classScheduleId: dto.classScheduleId,
      },
    });

    const previousValue = attendance
      ? { status: attendance.status, remarks: attendance.remarks }
      : { status: 'FALTA (INFERIDA)', remarks: null };

    const adminIdentifier =
      adminUser.email || adminUser.username || adminUser.sub || 'admin';
    const adminId = adminUser.id || adminUser.sub || null;

    if (attendance) {
      attendance.status = dto.status;
      attendance.remarks = dto.justification;
      attendance.markedByRole = UserRole.ADMIN;
      attendance.markedByUserId = adminId;
      attendance.markedAt = new Date();
    } else {
      attendance = this.attendanceRepository.create({
        studentId: dto.studentId,
        classScheduleId: dto.classScheduleId,
        status: dto.status,
        remarks: dto.justification,
        markedByRole: UserRole.ADMIN,
        markedByUserId: adminId,
        markedAt: new Date(),
      });
    }

    const savedAttendance = await this.attendanceRepository.save(attendance);

    // Registro inmutable en bitácora de auditoría (RN-07)
    await this.activityLogsService.createLog({
      moduleId: activeModule.id,
      userId: adminId,
      userIdentifier: adminIdentifier,
      userRole: UserRole.ADMIN,
      action: ActivityAction.UPDATE_ATTENDANCE,
      entityAffected: 'Attendance',
      entityId: savedAttendance.id,
      previousValue,
      newValue: {
        status: dto.status,
        remarks: dto.justification,
        studentName: student.fullName,
        classDate: schedule.classDate,
        modifiedBy: adminIdentifier,
      },
    });

    this.logger.log(
      `[AdminOverride] Asistencia de estudiante ${student.fullName} (${schedule.classDate}) actualizada a ${dto.status} por ${adminIdentifier}`,
    );

    return savedAttendance;
  }
}



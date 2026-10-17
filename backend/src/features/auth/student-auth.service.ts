import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { JwtService } from '../../common/services/jwt.service';
import { StudentLoginDto } from './dto/student-login.dto';
import { StudentNotFoundException } from './exceptions/student-not-found.exception';
import { ActivityAction, ModuleStatus, UserRole } from '../../common/enums';

@Injectable()
export class StudentAuthService {
  private readonly logger = new Logger(StudentAuthService.name);

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly activityLogsService: ActivityLogsService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Autenticación de estudiante sin contraseña para el módulo activo (RF-01, US-02)
   */
  async login(dto: StudentLoginDto, ipAddress?: string) {
    const rawIdentifier = dto.identifier.trim();
    this.logger.log(`Intento de login de estudiante con identificador: ${rawIdentifier}`);

    // Buscar estudiante vinculado a un módulo activo que coincida con email o registrationNumber
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoinAndSelect('student.module', 'module')
      .where('module.status = :status', { status: ModuleStatus.ACTIVE })
      .andWhere(
        '(LOWER(student.email) = LOWER(:id) OR student.registrationNumber = :id)',
        { id: rawIdentifier },
      )
      .getOne();

    if (!student) {
      this.logger.warn(
        `Login fallido: No se encontró estudiante para el identificador: ${rawIdentifier}`,
      );
      throw new StudentNotFoundException(rawIdentifier);
    }

    // Generar Token JWT con vigencia de 24 horas
    const token = this.jwtService.sign({
      sub: student.id,
      role: UserRole.STUDENT,
      moduleId: student.moduleId,
      moduleName: student.module.name,
      moduleCode: student.module.code,
      registrationNumber: student.registrationNumber,
      fullName: student.fullName,
      email: student.email,
    });

    // Registrar traza inmutable en la bitácora de auditoría (RF-09, US-14)
    await this.activityLogsService.createLog({
      moduleId: student.moduleId,
      userId: student.id,
      userIdentifier: `${student.registrationNumber} - ${student.fullName}`,
      userRole: UserRole.STUDENT,
      action: ActivityAction.LOGIN,
      entityAffected: 'Student',
      entityId: student.id,
      newValue: {
        registrationNumber: student.registrationNumber,
        email: student.email,
      },
      ipAddress: ipAddress ?? null,
    });

    this.logger.log(
      `Login exitoso: Estudiante ${student.fullName} (${student.registrationNumber}) autenticado en módulo ${student.module.code}`,
    );

    return {
      token,
      student: {
        id: student.id,
        registrationNumber: student.registrationNumber,
        fullName: student.fullName,
        email: student.email,
        module: {
          id: student.module.id,
          name: student.module.name,
          code: student.module.code,
          status: student.module.status,
        },
      },
    };
  }
}

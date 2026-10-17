import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleStatus } from '../../../common/enums';
import { AcademicModule } from '../../modules/entities/academic-module.entity';
import { Student } from '../entities/student.entity';
import { StudentFilterQueryDto } from '../dto/student-filter-query.dto';
import { StudentListResponseDto } from '../dto/student-list-response.dto';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(AcademicModule)
    private readonly modulesRepository: Repository<AcademicModule>,
  ) {}

  /**
   * Obtiene la nómina de estudiantes pertenecientes al módulo académico activo actual (RF-06),
   * permitiendo filtrado reactivo case-insensitive por número de matrícula, nombre completo o correo,
   * y paginación configurable.
   */
  async getActiveModuleStudents(
    query: StudentFilterQueryDto,
  ): Promise<StudentListResponseDto> {
    const { search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // 1. Obtener ID y metadatos del módulo académico activo actual (RN-01)
    const activeModule = await this.modulesRepository.findOne({
      where: { status: ModuleStatus.ACTIVE },
    });

    if (!activeModule) {
      this.logger.warn('No hay ningún módulo académico activo registrado.');
      return {
        moduleName: 'Ningún módulo activo',
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
        students: [],
      };
    }

    // 2. Construir consulta con QueryBuilder vinculada al módulo activo
    const qb = this.studentsRepository
      .createQueryBuilder('student')
      .where('student.moduleId = :moduleId', { moduleId: activeModule.id });

    // 3. Aplicar filtro ILIKE case-insensitive si se incluye término de búsqueda
    if (search && search.trim().length > 0) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        '(student.fullName ILIKE :term OR student.registrationNumber ILIKE :term OR student.email ILIKE :term)',
        { term },
      );
    }

    // 4. Ordenamiento por matrícula ascendente y paginación
    qb.orderBy('student.registrationNumber', 'ASC')
      .skip(skip)
      .take(limit);

    const [students, totalCount] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalCount / limit);

    return {
      moduleName: activeModule.name,
      moduleCode: activeModule.code,
      totalCount,
      page,
      limit,
      totalPages,
      students: students.map((s) => ({
        id: s.id,
        registrationNumber: s.registrationNumber,
        fullName: s.fullName,
        email: s.email,
        createdAt: s.createdAt,
      })),
    };
  }
}

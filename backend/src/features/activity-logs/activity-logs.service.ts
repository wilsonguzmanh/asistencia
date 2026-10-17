import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';

import { ActivityLogQueryDto } from './dto/activity-log-query.dto';

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  /**
   * Registra una acción inmutable en la bitácora de auditoría
   */
  async createLog(dto: CreateActivityLogDto): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({
      moduleId: dto.moduleId ?? null,
      userId: dto.userId ?? null,
      userIdentifier: dto.userIdentifier,
      userRole: dto.userRole,
      action: dto.action,
      entityAffected: dto.entityAffected,
      entityId: dto.entityId ?? null,
      previousValue: dto.previousValue ?? null,
      newValue: dto.newValue ?? null,
      ipAddress: dto.ipAddress ?? null,
    });

    const savedLog = await this.activityLogRepository.save(log);

    this.logger.log(
      `[Audit] Acción ${dto.action} registrada por ${dto.userIdentifier} (${dto.userRole}) sobre ${dto.entityAffected}`,
    );

    return savedLog;
  }

  /**
   * Consulta el historial de auditoría de un módulo específico
   */
  async findByModule(moduleId: string): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      where: { moduleId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Consulta paginada y filtrada de logs de auditoría (RF-10, US-15)
   */
  async findLogsWithFilters(query: ActivityLogQueryDto): Promise<{
    data: ActivityLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;

    const qb = this.activityLogRepository.createQueryBuilder('log');

    if (query.moduleId) {
      qb.andWhere('log.moduleId = :moduleId', { moduleId: query.moduleId });
    }

    if (query.action) {
      qb.andWhere('log.action = :action', { action: query.action });
    }

    if (query.search && query.search.trim().length > 0) {
      qb.andWhere(
        '(LOWER(log.userIdentifier) LIKE :search OR LOWER(log.entityAffected) LIKE :search)',
        { search: `%${query.search.trim().toLowerCase()}%` },
      );
    }

    qb.orderBy('log.createdAt', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}


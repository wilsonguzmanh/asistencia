import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ActivityAction, UserRole } from '../../common/enums';
import { ActivityLog } from '../activity-logs/entities/activity-log.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AuthResponseDataDto } from './dto/auth-response.dto';
import { AdminUser } from './entities/admin-user.entity';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    private readonly jwtService: JwtService,
  ) {}

  async loginAdmin(
    dto: AdminLoginDto,
    ipAddress?: string,
  ): Promise<AuthResponseDataDto> {
    const identifier = dto.identifier.trim();

    // 1. Buscar administrador por email o username (con passwordHash seleccionado)
    const admin = await this.adminUserRepository
      .createQueryBuilder('admin')
      .addSelect('admin.passwordHash')
      .where(
        'LOWER(admin.email) = LOWER(:identifier) OR LOWER(admin.username) = LOWER(:identifier)',
        { identifier },
      )
      .getOne();

    // 2. Si no existe o no está activo -> rechazar credenciales
    if (!admin || !admin.isActive) {
      this.logger.warn(
        `Intento de acceso fallido: usuario no encontrado o inactivo (${identifier})`,
      );
      throw new InvalidCredentialsException();
    }

    // 3. Verificar que tenga rol ADMIN
    if (admin.role !== UserRole.ADMIN) {
      this.logger.warn(
        `Intento de acceso administrativo denegado para rol no ADMIN (${identifier})`,
      );
      throw new InvalidCredentialsException();
    }

    // 4. Comparar hash de contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );
    if (!isPasswordValid) {
      this.logger.warn(
        `Intento de acceso fallido: contraseña inválida (${identifier})`,
      );
      throw new InvalidCredentialsException();
    }

    // 5. Generar token JWT con payload estandarizado
    const payload = {
      sub: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    };

    const token = this.jwtService.sign(payload);

    // 6. Auditoría inmutable de inicio de sesión
    try {
      const log = this.activityLogRepository.create({
        userId: admin.id,
        userIdentifier: admin.username,
        userRole: admin.role,
        action: ActivityAction.LOGIN,
        entityAffected: 'AdminUser',
        entityId: admin.id,
        newValue: {
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
        ipAddress: ipAddress ?? null,
      });
      await this.activityLogRepository.save(log);
    } catch (auditError) {
      this.logger.error('Error al registrar auditoría de login', auditError);
    }

    this.logger.log(`Administrador autenticado con éxito: ${admin.username}`);

    return {
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async getProfile(userId: string) {
    const admin = await this.adminUserRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!admin) {
      throw new InvalidCredentialsException();
    }

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    };
  }

  /**
   * Cierra la sesión activa y registra el evento inmutable de cierre de sesión (US-03, RF-02).
   */
  async logout(user?: any, ipAddress?: string): Promise<{ message: string }> {
    if (user?.userId || user?.sub) {
      try {
        const log = this.activityLogRepository.create({
          userId: user.userId || user.sub,
          userIdentifier: user.username || user.email || 'admin',
          userRole: user.role || UserRole.ADMIN,
          action: ActivityAction.LOGOUT,
          entityAffected: 'Session',
          entityId: user.userId || user.sub,
          ipAddress: ipAddress ?? null,
        });
        await this.activityLogRepository.save(log);
      } catch (auditError) {
        this.logger.error('Error al registrar auditoría de logout', auditError);
      }
    }

    return { message: 'Sesión cerrada exitosamente' };
  }
}


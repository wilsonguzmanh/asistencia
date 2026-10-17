import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { AcademicModule } from '../modules/entities/academic-module.entity';
import { ActivityLog } from '../activity-logs/entities/activity-log.entity';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { AdminUser } from './entities/admin-user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StudentAuthController } from './student-auth.controller';
import { StudentAuthService } from './student-auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtService as CustomJwtService } from '../../common/services/jwt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, Student, AcademicModule, ActivityLog]),
    ActivityLogsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'dev-secret-key-attendance-2026',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRATION') || '24h') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, StudentAuthController],
  providers: [
    AuthService,
    StudentAuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    CustomJwtService,
  ],
  exports: [
    AuthService,
    StudentAuthService,
    JwtAuthGuard,
    RolesGuard,
    JwtModule,
    CustomJwtService,
  ],
})
export class AuthModule {}

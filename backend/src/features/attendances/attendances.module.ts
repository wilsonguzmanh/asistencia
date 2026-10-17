import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { ClassSchedule } from '../schedules/entities/class-schedule.entity';
import { AcademicModule } from '../modules/entities/academic-module.entity';
import { Student } from '../students/entities/student.entity';
import { AttendancesService } from './attendances.service';
import { AttendancesController } from './attendances.controller';
import { AdminAttendancesController } from './admin-attendances.controller';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { StudentJwtGuard } from '../../common/guards/student-jwt.guard';
import { JwtService } from '../../common/services/jwt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      ClassSchedule,
      AcademicModule,
      Student,
    ]),
    ActivityLogsModule,
  ],
  controllers: [AttendancesController, AdminAttendancesController],
  providers: [AttendancesService, StudentJwtGuard, JwtService],
  exports: [AttendancesService],
})
export class AttendancesModule {}

import { AcademicModule } from '../features/modules/entities/academic-module.entity';
import { Student } from '../features/students/entities/student.entity';
import { ClassSchedule } from '../features/schedules/entities/class-schedule.entity';
import { Attendance } from '../features/attendances/entities/attendance.entity';
import { AdminUser } from '../features/auth/entities/admin-user.entity';
import { ActivityLog } from '../features/activity-logs/entities/activity-log.entity';

export const APP_ENTITIES = [
  AcademicModule,
  Student,
  ClassSchedule,
  Attendance,
  AdminUser,
  ActivityLog,
];

export {
  AcademicModule,
  Student,
  ClassSchedule,
  Attendance,
  AdminUser,
  ActivityLog,
};

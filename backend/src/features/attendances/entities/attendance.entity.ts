import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { AttendanceStatus, UserRole } from '../../../common/enums';
import { Student } from '../../students/entities/student.entity';
import { ClassSchedule } from '../../schedules/entities/class-schedule.entity';

@Entity('attendances')
@Unique(['studentId', 'classScheduleId'])
export class Attendance extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'student_id' })
  studentId: string;

  @ManyToOne(() => Student, (student) => student.attendances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ type: 'uuid', name: 'class_schedule_id' })
  classScheduleId: string;

  @ManyToOne(() => ClassSchedule, (schedule) => schedule.attendances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'class_schedule_id' })
  classSchedule: ClassSchedule;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENTE,
  })
  status: AttendanceStatus;

  @Column({
    type: 'timestamp with time zone',
    name: 'marked_at',
    nullable: true,
  })
  markedAt: Date | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
    name: 'marked_by_role',
  })
  markedByRole: UserRole;

  @Column({
    type: 'uuid',
    name: 'marked_by_user_id',
    nullable: true,
  })
  markedByUserId: string | null;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;
}

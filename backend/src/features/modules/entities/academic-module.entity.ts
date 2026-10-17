import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ModuleStatus } from '../../../common/enums';
import { Student } from '../../students/entities/student.entity';
import { ClassSchedule } from '../../schedules/entities/class-schedule.entity';

@Entity('academic_modules')
export class AcademicModule extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: ModuleStatus,
    default: ModuleStatus.ACTIVE,
  })
  status: ModuleStatus;

  @Column({ type: 'date', name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', name: 'end_date' })
  endDate: string;

  @OneToMany(() => Student, (student) => student.module)
  students: Student[];

  @OneToMany(() => ClassSchedule, (schedule) => schedule.module)
  schedules: ClassSchedule[];
}

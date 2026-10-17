import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { AcademicModule } from '../../modules/entities/academic-module.entity';
import { Attendance } from '../../attendances/entities/attendance.entity';

@Entity('class_schedules')
@Unique(['moduleId', 'classDate'])
export class ClassSchedule extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'module_id' })
  moduleId: string;

  @ManyToOne(() => AcademicModule, (module) => module.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'module_id' })
  module: AcademicModule;

  @Column({ type: 'date', name: 'class_date' })
  classDate: string;

  @Column({ type: 'varchar', length: 10, name: 'start_time' })
  startTime: string;

  @Column({ type: 'varchar', length: 10, name: 'end_time' })
  endTime: string;

  @OneToMany(() => Attendance, (attendance) => attendance.classSchedule)
  attendances: Attendance[];
}

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { AcademicModule } from '../../modules/entities/academic-module.entity';
import { Attendance } from '../../attendances/entities/attendance.entity';

@Entity('students')
@Unique(['moduleId', 'registrationNumber'])
@Index(['moduleId', 'email'])
export class Student extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'module_id' })
  moduleId: string;

  @ManyToOne(() => AcademicModule, (module) => module.students, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'module_id' })
  module: AcademicModule;

  @Column({ type: 'varchar', length: 50, name: 'registration_number' })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 200, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 150 })
  email: string;

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];
}

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ActivityAction, UserRole } from '../../../common/enums';
import { AcademicModule } from '../../modules/entities/academic-module.entity';

@Entity('activity_logs')
export class ActivityLog extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'module_id', nullable: true })
  moduleId: string | null;

  @ManyToOne(() => AcademicModule, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'module_id' })
  module: AcademicModule | null;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 150, name: 'user_identifier' })
  userIdentifier: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    name: 'user_role',
  })
  userRole: UserRole;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column({ type: 'varchar', length: 100, name: 'entity_affected' })
  entityAffected: string;

  @Column({ type: 'varchar', length: 100, name: 'entity_id', nullable: true })
  entityId: string | null;

  @Column({ type: 'jsonb', name: 'previous_value', nullable: true })
  previousValue: Record<string, any> | null;

  @Column({ type: 'jsonb', name: 'new_value', nullable: true })
  newValue: Record<string, any> | null;

  @Column({ type: 'varchar', length: 50, name: 'ip_address', nullable: true })
  ipAddress: string | null;
}

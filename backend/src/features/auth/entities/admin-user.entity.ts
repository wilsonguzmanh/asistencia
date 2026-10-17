import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { UserRole } from '../../../common/enums';

@Entity('admin_users')
export class AdminUser extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'password_hash',
    select: false,
  })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;
}

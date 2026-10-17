import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ActivityAction, UserRole } from '../../../common/enums';

export class CreateActivityLogDto {
  @IsUUID('4')
  @IsOptional()
  moduleId?: string | null;

  @IsUUID('4')
  @IsOptional()
  userId?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  userIdentifier: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  userRole: UserRole;

  @IsEnum(ActivityAction)
  @IsNotEmpty()
  action: ActivityAction;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  entityAffected: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  entityId?: string | null;

  @IsObject()
  @IsOptional()
  previousValue?: Record<string, any> | null;

  @IsObject()
  @IsOptional()
  newValue?: Record<string, any> | null;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  ipAddress?: string | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class AuthUserDto {
  @ApiProperty({
    description: 'Identificador único del usuario',
    example: 'c1f7a8b2-4d2a-4f5e-9a1b-123456789abc',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de usuario del administrador',
    example: 'admin',
  })
  username: string;

  @ApiProperty({
    description: 'Correo electrónico del administrador',
    example: 'admin@sistema.com',
  })
  email: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  role: UserRole;
}

export class AuthResponseDataDto {
  @ApiProperty({
    description: 'Token JWT firmado para autenticación de peticiones posteriores',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Datos del usuario autenticado',
    type: () => AuthUserDto,
  })
  user: AuthUserDto;
}

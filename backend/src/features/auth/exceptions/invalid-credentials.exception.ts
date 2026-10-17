import { HttpStatus } from '@nestjs/common';
import { AppBusinessException } from '../../../common/exceptions/app-business.exception';

export class InvalidCredentialsException extends AppBusinessException {
  constructor() {
    super(
      'Credenciales de acceso incorrectas',
      HttpStatus.UNAUTHORIZED,
      'INVALID_CREDENTIALS',
    );
  }
}

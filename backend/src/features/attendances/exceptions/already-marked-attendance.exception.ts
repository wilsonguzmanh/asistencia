import { HttpStatus } from '@nestjs/common';
import { AppBusinessException } from '../../../common/exceptions/app-business.exception';

export class AlreadyMarkedAttendanceException extends AppBusinessException {
  constructor(markedAt?: Date | string) {
    super(
      'Ya has registrado tu asistencia para la sesión de clase de hoy.',
      HttpStatus.CONFLICT,
      'ALREADY_MARKED_ATTENDANCE',
      { markedAt },
    );
  }
}

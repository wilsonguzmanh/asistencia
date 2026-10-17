import { HttpStatus } from '@nestjs/common';
import { AppBusinessException } from '../../../common/exceptions/app-business.exception';

export class NotClassDayException extends AppBusinessException {
  constructor(date?: string) {
    super(
      `Hoy no hay clase programada en el módulo académico activo${
        date ? ` (${date})` : ''
      }. La marcación sólo está permitida en días hábiles de clase.`,
      HttpStatus.BAD_REQUEST,
      'NOT_CLASS_DAY',
      { date },
    );
  }
}

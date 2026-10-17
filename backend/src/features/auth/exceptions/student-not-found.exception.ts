import { HttpStatus } from '@nestjs/common';
import { AppBusinessException } from '../../../common/exceptions/app-business.exception';

export class StudentNotFoundException extends AppBusinessException {
  constructor(identifier?: string) {
    super(
      `Estudiante no registrado en el módulo académico activo actual${
        identifier ? ` (identificador: ${identifier})` : ''
      }`,
      HttpStatus.NOT_FOUND,
      'STUDENT_NOT_FOUND',
      { identifier },
    );
  }
}

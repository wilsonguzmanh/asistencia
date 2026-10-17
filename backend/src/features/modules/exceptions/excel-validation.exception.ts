import { HttpStatus } from '@nestjs/common';
import { AppBusinessException } from '../../../common/exceptions/app-business.exception';

export class ExcelValidationException extends AppBusinessException {
  constructor(
    message = 'Se encontraron errores en el archivo Excel',
    details?: any,
  ) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'EXCEL_VALIDATION_ERROR',
      details,
    );
  }
}

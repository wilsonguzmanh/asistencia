import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class AppBusinessException extends HttpException {
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    status: HttpStatus,
    code: string,
    details?: any,
  ) {
    super(
      {
        status: 'fail',
        code,
        message,
        data: details ?? null,
      },
      status,
    );
    this.code = code;
    this.details = details;
  }
}
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppBusinessException } from '../exceptions/app-business.exception';
import { correlationContext } from '../middleware/correlation-id.middleware';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId =
      correlationContext.getStore() ||
      (response.getHeader('X-Correlation-Id') as string) ||
      (request.headers['x-correlation-id'] as string) ||
      null;

    // 1. Excepción de Negocio Controlada (AppBusinessException)
    if (exception instanceof AppBusinessException) {
      const status = exception.getStatus();

      this.logger.warn(
        `[${correlationId || 'N/A'}] Business Exception: ${exception.code} - ${exception.message} (${request.method} ${request.url})`,
      );

      return response.status(status).json({
        status: 'fail',
        code: exception.code,
        message: exception.message,
        correlationId,
        data: exception.details ?? null,
      });
    }

    // 2. Excepción HTTP Estándar de NestJS (ej. BadRequestException de ValidationPipe)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message = exception.message;
      let data: any = null;
      let code = 'HTTP_EXCEPTION';

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const respObj = exceptionResponse as any;
        if (Array.isArray(respObj.message)) {
          code = 'VALIDATION_ERROR';
          message = 'Error de validación en los datos enviados';
          data = respObj.message;
        } else if (respObj.message) {
          message = respObj.message;
        }
      }

      this.logger.warn(
        `[${correlationId || 'N/A'}] HTTP Exception (${status}): ${code} - ${message} (${request.method} ${request.url})`,
      );

      return response.status(status).json({
        status: 'fail',
        code,
        message,
        correlationId,
        data,
      });
    }

    // 3. Error No Controlado (500 Internal Server Error)
    const stackTrace =
      exception instanceof Error ? exception.stack : JSON.stringify(exception);

    this.logger.error(
      `[${correlationId || 'N/A'}] Unhandled Exception: ${request.method} ${request.url}`,
      stackTrace,
    );

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ha ocurrido un error interno en el servidor',
      correlationId,
      data: null,
    });
  }
}
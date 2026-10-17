import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        if (
          res !== null &&
          typeof res === 'object' &&
          'data' in res &&
          'message' in res
        ) {
          return {
            status: 'success',
            message: res.message,
            data: res.data,
          };
        }

        return {
          status: 'success',
          message: 'Operación realizada exitosamente',
          data: res ?? null,
        };
      }),
    );
  }
}
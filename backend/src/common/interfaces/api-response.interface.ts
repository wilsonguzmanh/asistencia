export type ResponseStatus = 'success' | 'fail' | 'error';

export interface SuccessResponse<T> {
  status: 'success';
  message: string;
  data: T;
}

export interface FailResponse<T = any> {
  status: 'fail';
  code: string;
  message: string;
  correlationId?: string | null;
  data?: T | null;
}

export interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  correlationId?: string | null;
  data: null;
}

export type ApiResponse<T> = SuccessResponse<T> | FailResponse<T> | ErrorResponse;
export type ApiResponseStatus = 'success' | 'fail' | 'error';

export interface ApiSuccessResponse<T> {
  status: 'success';
  message: string;
  data: T;
}

export interface ApiFailResponse<T = any> {
  status: 'fail';
  code: string;
  message: string;
  data?: T;
}

export interface ApiErrorResponse {
  status: 'error';
  code: string;
  message: string;
  data: null;
}

export type ApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiFailResponse
  | ApiErrorResponse;

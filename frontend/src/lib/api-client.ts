import { ApiResponse } from '../types/api-response';

export class ApiClientError extends Error {
  constructor(
    public readonly status: 'fail' | 'error',
    public readonly code: string,
    message: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
  ).replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  // Obtener token JWT si existe en el navegador
  let authToken: string | null = null;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('iac_student_token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let payload: ApiResponse<T>;
  try {
    payload = await response.json();
  } catch {
    throw new ApiClientError(
      'error',
      'INVALID_JSON',
      'Respuesta inesperada del servidor.',
    );
  }

  if (payload.status === 'success') {
    return payload.data;
  }

  throw new ApiClientError(
    payload.status,
    payload.code || 'UNKNOWN_ERROR',
    payload.message || 'Error en la petición al servidor',
    payload.data,
  );
}

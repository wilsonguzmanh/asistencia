# Regla: Cliente HTTP y Consumo del Sobre Estándar (Next.js)

Esta regla rige cómo el frontend debe interactuar con la API de NestJS, desempaquetar el sobre estándar de respuesta y propagar los errores de forma controlada a la UI.

---

## 1. Tipado del Sobre del Backend

Ubicación: `frontend/src/types/api-response.ts`

```typescript
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

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailResponse | ApiErrorResponse;
```

---

## 2. Cliente HTTP Centralizado (`api-client.ts`)

Ubicación: `frontend/src/lib/api-client.ts`

El cliente HTTP debe desempaquetar automáticamente las respuestas y lanzar errores estructurados para `fail` y `error`:

```typescript
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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json();

  if (payload.status === 'success') {
    return payload.data as T;
  }

  // Si el backend retornó 'fail' o 'error'
  throw new ApiClientError(
    payload.status,
    payload.code || 'UNKNOWN_ERROR',
    payload.message || 'Error en la petición',
    payload.data,
  );
}
```

---

## 3. Manejo de Errores en la Vista (UI)

* **Errores de tipo `fail` (Validación o Dominio):**
  - Mapear mensajes a los campos de formulario correspondientes o mostrar un toast/alerta descriptiva con el mensaje devuelto por el backend.
* **Errores de tipo `error` (5xx del servidor):**
  - Mostrar una alerta de error genérico invitando al usuario a reintentar más tarde o activar el `error.tsx` de Next.js.
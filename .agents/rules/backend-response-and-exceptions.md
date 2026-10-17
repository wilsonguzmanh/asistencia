# Regla: Respuestas Estándar y Excepciones por Feature (NestJS)

Esta regla define el estándar obligatorio para toda respuesta emitida por la API y la jerarquía de excepciones de negocio.

---

## 1. El Sobre Estándar (JSend Extendido)

Toda respuesta HTTP debe contener uno de los 3 estados:
* **`success` (2xx):** Operación completada exitosamente. Encapsulada automáticamente por `TransformResponseInterceptor`.
  ```json
  { "status": "success", "message": "Operación realizada exitosamente", "data": { ... } }
  ```
* **`fail` (4xx):** Error controlado de validación DTO o regla de negocio violada.
  ```json
  { "status": "fail", "code": "EMPLOYEE_NOT_FOUND", "message": "No se encontró el empleado", "data": { "id": "..." } }
  ```
* **`error` (5xx):** Error no controlado de servidor (crash, bug, fallo de BD). El `GlobalExceptionFilter` lo captura y emite un mensaje seguro sin exponer trazas técnicas en producción.
  ```json
  { "status": "error", "code": "INTERNAL_SERVER_ERROR", "message": "Ha ocurrido un error interno en el servidor", "data": null }
  ```

---

## 2. Jerarquía de Excepciones de Negocio

### 2.1 Excepción Base de Negocio
Toda excepción de dominio en el backend debe heredar de `AppBusinessException` (`backend/src/common/exceptions/app-business.exception.ts`):

```typescript
export abstract class AppBusinessException extends HttpException {
  public readonly code: string;
  public readonly details?: any;
  constructor(message: string, status: HttpStatus, code: string, details?: any) {
    super({ status: 'fail', code, message, data: details ?? null }, status);
    this.code = code;
    this.details = details;
  }
}
```

### 2.2 Excepciones Específicas en cada Feature
Cada módulo de negocio debe crear sus propias excepciones dentro de `features/<feature>/exceptions/`:

```typescript
// features/employees/exceptions/employee-not-found.exception.ts
export class EmployeeNotFoundException extends AppBusinessException {
  constructor(id: string) {
    super(`Empleado no encontrado con ID: ${id}`, HttpStatus.NOT_FOUND, 'EMPLOYEE_NOT_FOUND', { id });
  }
}
```

---

## 3. Directrices Obligatorias

1. **PROHIBIDO lanzar `throw new Error(...)` genérico.** Siempre lanzar excepciones que hereden de `AppBusinessException` o excepciones HTTP estándares de NestJS.
2. **PROHIBIDO retornar respuestas estructuradas manualmente en los Controllers.** Los controladores deben retornar directamente los datos o entidades resultantes; el `TransformResponseInterceptor` se encarga de envolverlos en el sobre `success`.
3. **El `GlobalExceptionFilter` es el único punto autorizado** para mapear excepciones a la estructura JSON final de `fail` o `error`.
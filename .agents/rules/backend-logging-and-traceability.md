# Regla: Logging Estructurado y Trazabilidad (NestJS)

Esta regla define los estándares de emisión de logs, trazabilidad de operaciones mediante **Correlation ID** y buenas prácticas de registro en el backend utilizando el `Logger` nativo de NestJS.

---

## 1. Uso Obligatorio del Logger Nativo de NestJS

* **PROHIBIDO el uso de `console.log()`, `console.warn()` o `console.error()`.** Todo registro debe realizarse mediante la clase `Logger` de `@nestjs/common`.
* Cada servicio o controlador debe instanciar su propio logger con su nombre de contexto:
  ```typescript
  import { Injectable, Logger } from '@nestjs/common';

  @Injectable()
  export class AttendanceService {
    private readonly logger = new Logger(AttendanceService.name);

    async registrarMarcacion(employeeId: string) {
      this.logger.log(`Registrando marcación para empleado: ${employeeId}`);
    }
  }
  ```

---

## 2. Niveles de Log y Criterios Estrictos

| Nivel | Método | Cuándo Usar |
| :--- | :--- | :--- |
| **`ERROR`** | `this.logger.error(msg, trace)` | Errores no controlados (500), fallos de conexión a BD o caídas de dependencias externas. **Obligatorio incluir el stacktrace (`error.stack`).** |
| **`WARN`** | `this.logger.warn(msg)` | Errores controlados de cliente (`fail`, 4xx), validaciones DTO fallidas, intentos de doble marcación o advertencias de rendimiento. |
| **`INFO`** | `this.logger.log(msg)` | Hitos clave de negocio (marcación completada, empleado registrado, usuario autenticado) y arranque de módulos. |
| **`DEBUG`** | `this.logger.debug(msg)` | Trazas de diagnóstico locales durante el desarrollo (desactivado en entornos de producción). |

---

## 3. Trazabilidad con Correlation ID (`X-Correlation-Id`)

* Toda solicitud HTTP debe contar con un **Correlation ID** (UUID v4) administrado mediante middleware y `AsyncLocalStorage`.
* **Propagación automática:** El Correlation ID se asocia al contexto de ejecución asíncrono y se incluye en la salida del logger:
  - En **Desarrollo**: Prefijado visualmente como `[corr:<uuid-corto>]` en la consola.
  - En **Producción**: Campo `"correlationId"` en el JSON estructurado.
* **Retorno al cliente:** La API debe devolver siempre el encabezado `X-Correlation-Id` en la respuesta y dentro del cuerpo ante respuestas de error `500` para que el usuario o soporte técnico pueda rastrear el incidente.

---

## 4. Comportamiento según Entorno (Dual Output)

1. **Entorno de Desarrollo (`NODE_ENV !== 'production'`):**
   * Salida visual con colores estándar de NestJS para facilitar la lectura inmediata del desarrollador en la terminal local.
2. **Entorno de Producción (`NODE_ENV === 'production'`):**
   * Salida JSON estructurada (NDJSON en una sola línea por log) para permitir su indexación y búsqueda en sistemas centralizados (Datadog, CloudWatch, Loki, ELK).

---

## 5. Sanitización de Datos Sensibles (PII)

* **PROHIBIDO registrar contraseñas, hashes, tokens JWT, claves privadas ni datos bancarios.**
* Si se registra el cuerpo o metadatos de una petición, aplicar enmascaramiento sobre las claves sensibles:
  - Campos a sanitizar: `password`, `token`, `secret`, `authorization`, `creditCard`.
  - Valor de sustitución: `[REDACTED]`.
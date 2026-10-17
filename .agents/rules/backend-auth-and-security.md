# Regla: Autenticación, Autorización y Seguridad en Desarrollo (NestJS)

Esta regla define los estándares de seguridad a nivel de código para la gestión de identidades, protección de rutas y manejo de datos sensibles.

---

## 1. Protección de Rutas mediante Guards

* **Políticas cerradas por defecto:** Si se implementa autenticación global, registrar `JwtAuthGuard` como guard global y usar un decorador `@Public()` para liberar rutas públicas (login, registro).
* **Guards de Roles y Permisos (`RolesGuard`):** Proteger endpoints según el perfil del usuario (`ADMIN`, `SUPERVISOR`, `EMPLEADO`):
  ```typescript
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('reportes')
  getReportes() { ... }
  ```

---

## 2. Inyección del Usuario Autenticado (`@CurrentUser`)

Crear y utilizar un decorador de parámetros personalizado en `backend/src/common/decorators/current-user.decorator.ts`:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

---

## 3. Manejo de Contraseñas y Credenciales

* **Hashing:** Utilizar siempre librerías criptográficas probadas (`bcrypt` o `argon2`) con un mínimo de 10 rondas de salt para contraseñas.
* **Exclusión de campos sensibles en Entidades:**
  ```typescript
  @Column({ type: 'varchar', select: false }) // select: false evita que se devuelva en queries por defecto
  password: string;
  ```
* **Limpieza de DTOs de salida:** Jamás retornar hashes de contraseñas, tokens de refresco sin firmar ni datos confidenciales en los payloads devueltos al cliente.
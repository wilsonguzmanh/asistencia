# Plan Técnico de Implementación: US-01 - Acceso de Administrador con Credenciales

Este documento detalla el plan de implementación end-to-end (Backend NestJS + Frontend Next.js) para la historia de usuario **US-01**, correspondiente al **Programador 1 (Fase 1)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-01` |
| **Título** | Acceso de Administrador con Credenciales Propias |
| **Rol** | Administrador |
| **Requerimientos Funcionales** | `RF-02` (*Acceso del administrador*), `RF-18` (*Mensajes de confirmación y error*) |
| **Reglas de Negocio** | Restricción de acceso administrativo a rol `ADMIN` |
| **Estimación** | 3 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-01-admin-auth` |

---

## 2. Alcance y Objetivos Técnicos

El Administrador debe poder autenticarse mediante usuario o correo electrónico y contraseña (`admin123` en el seed), recibiendo un token JWT que identifique su sesión con rol `ADMIN`. El frontend debe almacenar el token de forma segura, permitir la navegación al panel de administración y proteger las rutas administrativas.

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/auth/
│   ├── dto/
│   │   ├── admin-login.dto.ts               # Validación de username/email y password
│   │   └── auth-response.dto.ts             # DTO de respuesta con token y usuario
│   ├── exceptions/
│   │   └── invalid-credentials.exception.ts # Extiende AppBusinessException (401)
│   ├── guards/
│   │   ├── jwt-auth.guard.ts                # Guard de validación de JWT
│   │   └── roles.guard.ts                   # Guard de validación de roles (ADMIN)
│   ├── strategies/
│   │   └── jwt.strategy.ts                  # Estrategia Passport JWT
│   ├── auth.controller.ts                   # Endpoint POST /api/v1/auth/admin/login
│   ├── auth.service.ts                      # Validación bcrypt y generación de JWT
│   └── auth.module.ts                       # JwtModule, PassportModule y TypeOrmModule(AdminUser)

frontend/src/
├── app/
│   └── admin/
│       ├── login/
│       │   └── page.tsx                     # Formulario de login de administrador
│       └── dashboard/
│           └── page.tsx                     # Landing administrativa post-login
├── features/auth/
│   ├── components/
│   │   └── AdminLoginForm.tsx               # Componente formulario con react-hook-form / Tailwind
│   ├── services/
│   │   └── auth.service.ts                  # Llamada HTTP al backend via api-client
│   └── types/
│       └── auth.types.ts                    # Interfaces TypeScript de sesión y login
└── middleware.ts                            # Protección de rutas /admin/* vía cookie/token
```

---

## 4. Especificación del Backend (NestJS)

### 4.1 Dependencias Necesarias
Instalar en `backend`:
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

### 4.2 DTO de Entrada (`admin-login.dto.ts`)
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Nombre de usuario o correo electrónico institucional',
    example: 'admin@sistema.com',
  })
  @IsString({ message: 'El identificador debe ser texto' })
  @IsNotEmpty({ message: 'El usuario o correo es obligatorio' })
  identifier: string;

  @ApiProperty({
    description: 'Contraseña en texto plano',
    example: 'admin123',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
```

### 4.3 Excepción Personalizada (`invalid-credentials.exception.ts`)
```typescript
import { HttpStatus } from '@nestjs/common';
import { AppBusinessException } from '../../../common/exceptions/app-business.exception';

export class InvalidCredentialsException extends AppBusinessException {
  constructor() {
    super(
      'Credenciales de acceso incorrectas',
      'INVALID_CREDENTIALS',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
```

### 4.4 Lógica de Negocio (`auth.service.ts`)
1. Inyectar `Repository<AdminUser>` y `JwtService`.
2. Buscar en `admin_users` por `email = identifier OR username = identifier`, con `.addSelect('admin.passwordHash')` (ya que tiene `select: false`).
3. Si no existe o `isActive == false` -> lanzar `InvalidCredentialsException`.
4. Comparar contraseñas con `bcrypt.compare(dto.password, admin.passwordHash)`. Si no coincide -> lanzar `InvalidCredentialsException`.
5. Generar token JWT con payload:
   ```json
   {
     "sub": "uuid-del-admin",
     "username": "admin",
     "email": "admin@sistema.com",
     "role": "ADMIN"
   }
   ```
6. Retornar token y datos del usuario (sin el hash).

### 4.5 Controlador y Swagger (`auth.controller.ts`)
* **Ruta:** `POST /api/v1/auth/admin/login`
* **Swagger Tag:** `Auth`
* **Respuestas Documentadas:**
  * `200 OK`: Login exitoso con token JWT y datos de usuario.
  * `400 Bad Request`: Error de validación en campos del DTO.
  * `401 Unauthorized`: Credenciales inválidas.

```json
// Respuesta exitosa (200 OK)
{
  "status": "success",
  "message": "Sesión iniciada exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c1f7a8b2-4d2a-4f5e-9a1b-123456789abc",
      "username": "admin",
      "email": "admin@sistema.com",
      "role": "ADMIN"
    }
  }
}
```

---

## 5. Especificación del Frontend (Next.js)

### 5.1 Pantalla de Login (`/admin/login`)
* **Diseño:**
  * Tarjeta centrada con logotipo institucional, encabezado *"Acceso Administrativo"*.
  * Campo 1: Identificador (Usuario o Correo) con icono.
  * Campo 2: Contraseña con botón para mostrar/ocultar texto.
  * Botón primario: *"Iniciar Sesión"* con spinner de carga durante el dispatch.
  * Alertas visuales con mensajes amigables de error (`fail`/`error`) o éxito (`success`) (**RF-18**).
* **Gestión de Sesión:**
  * Guardar el JWT en Cookie (`admin_token`) o `localStorage`.
  * Redirección inmediata a `/admin/dashboard`.

### 5.2 Middleware de Protección (`src/middleware.ts`)
* Interceptar rutas que comiencen con `/admin/*` (excepto `/admin/login`).
* Si no existe token administrativo válido -> redirigir automáticamente a `/admin/login`.

---

## 6. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Login exitoso de administrador con correo sembrado
  Dado que la base de datos cuenta con el admin sembrado (admin@sistema.com / admin123)
  Cuando se envía POST a "/api/v1/auth/admin/login" con:
    | identifier        | password |
    | admin@sistema.com | admin123 |
  Entonces el código de respuesta es 200 OK
  Y el cuerpo contiene "status": "success" y un token JWT válido
  Y el payload decodificado del JWT contiene "role": "ADMIN".

Escenario: Rechazo por contraseña equivocada
  Cuando se envía POST con identifier "admin@sistema.com" y password "incorrecta"
  Entonces el código de respuesta es 401 Unauthorized
  Y el cuerpo contiene "code": "INVALID_CREDENTIALS".
```

---

## 7. Checklist de Implementación para Programador 1

- [x] **Paso 1:** Instalar paquetes JWT en backend (`@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`).
- [x] **Paso 2:** Crear carpeta `backend/src/features/auth/` con sus DTOs y excepciones.
- [x] **Paso 3:** Implementar `AuthService.loginAdmin()` y la estrategia `JwtStrategy`.
- [x] **Paso 4:** Implementar `AuthController` con anotaciones Swagger `@ApiTags('Auth')`.
- [x] **Paso 5:** Probar login en Swagger UI (`http://localhost:3000/api/docs`), pruebas unitarias y e2e.
- [x] **Paso 6:** Implementar la página `/admin/login` en Next.js con Tailwind CSS y manejo de estado.
- [x] **Paso 7:** Probar flujo end-to-end desde el navegador verificando redirección a `/admin/dashboard`.

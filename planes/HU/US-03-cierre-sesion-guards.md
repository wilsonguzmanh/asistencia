# Plan Técnico de Implementación: US-03 - Cierre de Sesión y Control de Acceso por Roles (Guards Globales)

Este documento define el plan de desarrollo técnico detallado para la historia **US-03**, asignada al **Programador 1 (Fase 2)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-03` |
| **Título** | Cierre de Sesión y Control de Acceso por Roles (Guards Globales) |
| **Rol** | Administrador / Estudiante |
| **Requerimientos Funcionales** | `RF-02` (*Seguridad de sesiones y control por rol*) |
| **Estimación** | 2 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-03-global-auth-guards-logout` |

---

## 2. Alcance y Objetivos Técnicos

Esta historia unifica y robustece la capa de seguridad en todo el sistema:
1. **Cierre de sesión seguro y unificado:** Invalida la sesión activa en cliente y servidor, eliminando cookies y tokens locales, y redirigiendo al portal de inicio correspondiente.
2. **Guards globales en NestJS:** Registro global de `JwtAuthGuard` y `RolesGuard` con decoradores públicos (`@Public()`), garantizando que por defecto ningún endpoint quede expuesto sin autorización explícita.
3. **Middleware de Next.js (`middleware.ts`):** Verificación automática en el borde del navegador para:
   * Redirigir a `/admin/login` si un usuario no autenticado intenta entrar a `/admin/*`.
   * Bloquear con `403 Forbidden` a usuarios con rol `STUDENT` que intenten acceder a rutas administrativas.
   * Redirigir a `/` si un usuario sin sesión intenta entrar a `/estudiante/*`.

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/auth/
│   ├── auth.controller.ts                   # Endpoint POST /api/v1/auth/logout
│   ├── decorators/
│   │   ├── public.decorator.ts              # Decorador @Public() para bypass de guards
│   │   └── roles.decorator.ts               # Decorador @Roles(UserRole...)
│   └── guards/
│       ├── jwt-auth.guard.ts                # Guard JWT global con validación @Public()
│       └── roles.guard.ts                   # Guard RBAC por rol
├── app.module.ts                            # Proveedores globales APP_GUARD

frontend/src/
├── middleware.ts                            # Middleware de rutas protegidas Next.js
├── features/auth/
│   ├── services/
│   │   └── auth.service.ts                  # Métodos logoutAdmin() y logoutStudent()
│   └── components/
│       └── LogoutConfirmButton.tsx          # Botón reutilizable con confirmación
```

---

## 4. Especificación del Backend (NestJS)

### 4.1 Decorador `@Public()` y `JwtAuthGuard`
```typescript
// public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
```

### 4.2 Endpoint de Logout
* **Ruta:** `POST /api/v1/auth/logout`
* **Método:** `POST`
* **Descripción:** Endpoint seguro para revocación de cookies o tokens de sesión.

---

## 5. Especificación del Frontend (Next.js)

### 5.1 Middleware de Seguridad (`frontend/src/middleware.ts`)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get('admin_token')?.value;
  const studentToken = request.cookies.get('student_token')?.value;

  // 1. Proteger rutas administrativas
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. Proteger rutas de estudiantes
  if (pathname.startsWith('/estudiante')) {
    if (!studentToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/estudiante/:path*'],
};
```

---

## 6. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Cierre de sesión voluntario del administrador
  Dado que el administrador está autenticado en "/admin/dashboard"
  Cuando hace clic en "Cerrar Sesión"
  Entonces el sistema remueve el token de sesión y las cookies
  Y redirige de inmediato a "/admin/login"
  Y si intenta retroceder con el navegador, el sistema no permite el reingreso sin credenciales.

Escenario: Bloqueo de acceso de estudiantes a paneles administrativos
  Dado que un estudiante tiene una sesión abierta
  Cuando intenta navegar a "/admin/estudiantes" o "/admin/modulo/preview"
  Entonces el middleware detecta rol no autorizado y deniega el acceso
  Y redirige al login administrativo o a su vista de estudiante.

Escenario: Bloqueo de usuario anónimo en endpoints backend protegidos
  Dado que una petición externa intenta llamar "POST /api/v1/modules/activate" sin token
  Cuando la petición llega al servidor
  Entonces el JwtAuthGuard global retorna de inmediato HTTP 401 Unauthorized.
```

---

## 7. Checklist de Implementación para Programador 1

- [ ] **Paso 1:** Implementar decorador `@Public()` y habilitar `JwtAuthGuard` y `RolesGuard` como `APP_GUARD` en `app.module.ts`.
- [ ] **Paso 2:** Crear endpoint `POST /api/v1/auth/logout`.
- [ ] **Paso 3:** Implementar `middleware.ts` en `frontend/src/` con redirecciones por rol.
- [ ] **Paso 4:** Actualizar `auth.service.ts` para garantizar la limpieza sincronizada de cookies y `localStorage`.
- [ ] **Paso 5:** Pruebas automatizadas de guards y endpoints protegidos en Jest.
- [ ] **Paso 6:** Verificar en navegador el flujo de logout y reintento de navegación hacia rutas privadas.

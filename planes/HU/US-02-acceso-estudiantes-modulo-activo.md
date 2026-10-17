# Plan Técnico de Implementación: US-02 - Acceso de Estudiantes al Módulo Activo

Este documento define el plan de desarrollo técnico detallado para la historia **US-02**, asignada al **Programador 2 (Fase 1)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-02` |
| **Título** | Acceso de Estudiantes al Módulo Activo |
| **Rol** | Estudiante |
| **Requerimientos Funcionales** | `RF-01` (*Ingreso de estudiantes sin contraseña*) |
| **Reglas de Negocio** | Restringido exclusivamente a estudiantes matriculados en el módulo con estado `ACTIVE` |
| **Estimación** | 3 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-02-student-auth` |

---

## 2. Alcance y Objetivos Técnicos

El estudiante no requiere contraseña para ingresar al sistema (**RF-01**). Debe poder autenticarse ingresando únicamente su correo electrónico o su número de registro:
1. El sistema busca al estudiante en la base de datos vinculado obligatoriamente a un módulo académico con estado `ACTIVE`.
2. Si los datos coinciden con un estudiante activo, se emite un token JWT de rol `STUDENT` con vigencia de 24 horas y se registra el evento en `ActivityLog`.
3. Si los datos no coinciden o el módulo no está activo, se rechaza la petición con HTTP 404 (`StudentNotFoundException`) y un mensaje informativo.
4. En el frontend, el formulario valida el formato, guarda la sesión en `localStorage` y en cookies para el middleware, y redirige a `/asistencia`.

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── common/guards/
│   └── student-jwt.guard.ts                 # Guard JWT para rol STUDENT
├── features/auth/
│   ├── dto/
│   │   └── student-login.dto.ts             # DTO { identifier: string }
│   ├── exceptions/
│   │   └── student-not-found.exception.ts   # HTTP 404
│   ├── student-auth.controller.ts           # Endpoint POST /api/v1/auth/student/login
│   ├── student-auth.service.ts              # Consulta en BD, emisión de JWT y log
│   └── student-auth.service.spec.ts         # Pruebas unitarias completas

frontend/src/
├── app/
│   └── login/
│       └── page.tsx                         # Formulario de acceso del estudiante
├── features/auth/
│   ├── services/
│   │   └── student-auth.service.ts          # Cliente HTTP y gestión de sesión en localStorage y cookies
│   └── types/
│       └── auth.types.ts                    # Interfaces StudentSession, StudentLoginResponse
```

---

## 4. Especificación del Backend (NestJS)

### 4.1 Endpoint de Login de Estudiante
* **Ruta:** `POST /api/v1/auth/student/login`
* **Método:** `POST`
* **Público:** Decorador `@Public()`
* **Body:**
  ```json
  {
    "identifier": "1001"
  }
  ```
* **Lógica en `StudentAuthService`:**
  ```typescript
  const student = await this.studentRepository
    .createQueryBuilder('student')
    .innerJoinAndSelect('student.module', 'module')
    .where('module.status = :status', { status: ModuleStatus.ACTIVE })
    .andWhere(
      '(LOWER(student.email) = LOWER(:id) OR student.registrationNumber = :id)',
      { id: rawIdentifier },
    )
    .getOne();

  if (!student) {
    throw new StudentNotFoundException(rawIdentifier);
  }
  ```
* **JWT Payload:**
  ```json
  {
    "sub": "student-uuid",
    "role": "STUDENT",
    "moduleId": "module-uuid",
    "moduleName": "Módulo 2: IaC",
    "moduleCode": "DCID-M2",
    "registrationNumber": "1001",
    "fullName": "Juan Pérez",
    "email": "juan@gmail.com"
  }
  ```

---

## 5. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Ingreso exitoso de estudiante por correo electrónico
  Dado que existe un módulo activo y el estudiante "juan@gmail.com" está matriculado en él
  Cuando el estudiante ingresa su correo en "/login" y pulsa "Ingresar"
  Entonces el sistema emite el token JWT y los datos del estudiante
  Y el frontend lo redirige a "/asistencia".

Escenario: Ingreso exitoso por número de registro
  Dado que el estudiante ingresa "1001"
  Cuando envía el formulario
  Entonces el sistema valida la matrícula activa y permite el acceso.

Escenario: Estudiante no registrado o perteneciente a módulo archivado
  Dado que un usuario escribe "9999" o un correo inexistente
  Cuando pulsa "Ingresar"
  Entonces el sistema responde con error 404: "Estudiante no registrado en el módulo académico activo actual"
  Y no permite el acceso.
```

---

## 6. Checklist de Implementación para Programador 2

- [x] **Paso 1:** Crear `student-login.dto.ts` y excepción `StudentNotFoundException`.
- [x] **Paso 2:** Implementar `StudentAuthService` con consulta filtrada por `module.status = ACTIVE`.
- [x] **Paso 3:** Crear `StudentAuthController` con endpoint `POST /auth/student/login` decorado con `@Public()`.
- [x] **Paso 4:** Crear `StudentJwtGuard` para protección de endpoints de alumno.
- [x] **Paso 5:** Implementar pantalla `/login` y servicio `studentAuthService` en Next.js.
- [x] **Paso 6:** Pruebas unitarias en `student-auth.service.spec.ts`.

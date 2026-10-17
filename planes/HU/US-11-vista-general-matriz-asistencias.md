# Plan Técnico de Implementación: US-11 - Vista General y Matriz de Asistencias con Totales

Este documento define el plan de desarrollo técnico detallado para la historia **US-11**, asignada al **Programador 2 (Fase 2)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-11` |
| **Título** | Vista General y Matriz de Asistencias con Totales |
| **Rol** | Administrador |
| **Requerimientos Funcionales** | `RF-08` (*Planilla general de asistencias con filtros y totales*) |
| **Reglas de Negocio** | Filtrado contextual sobre el módulo activo actual |
| **Estimación** | 5 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-11-attendance-matrix-overview` |

---

## 2. Alcance y Objetivos Técnicos

El Administrador debe disponer de una pantalla dedicada dentro del panel de administración (`/admin/asistencias`) para supervisar el cumplimiento global de asistencia de los estudiantes del módulo activo:
1. **Filtro por Fecha de Clase:** Seleccionar una fecha específica del calendario activo para ver la lista completa de matriculados con su estado (`Presente` o `Falta`) en esa fecha.
2. **Filtro por Estudiante:** Seleccionar un estudiante particular para consultar su desglose individual fecha a fecha.
3. **Métricas en Tiempo Real:** Total de presentes y ausentes calculados dinámicamente según el filtro aplicado.
4. **Matriz Cruzada / Grid General:** Vista consolidada tipo planilla donde las filas corresponden a los estudiantes y las columnas a las fechas de clase transcurridas y futuras.
5. Acceso exclusivo para administradores (`@Roles(UserRole.ADMIN)`).

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/attendances/
│   ├── dto/
│   │   ├── attendance-matrix-query.dto.ts   # Parámetros date, studentId, page, limit
│   │   └── attendance-matrix-response.dto.ts# DTO de matriz, totales de presentes y ausentes
│   ├── attendances.controller.ts            # Endpoint GET /api/v1/attendances/matrix
│   └── attendances.service.ts               # Lógica de agregación cruzada de asistencias

frontend/src/
├── app/
│   └── admin/
│       └── asistencias/
│           └── page.tsx                     # Pantalla de matriz y control de asistencia
├── features/attendances/
│   ├── components/
│   │   ├── AttendanceMatrixFilters.tsx      # Selectores de fecha y estudiante con buscador
│   │   ├── AttendanceMatrixTable.tsx        # Grilla general con celdas P / F y badges
│   │   └── AttendanceTotalsBanner.tsx       # KPIs: Presentes, Faltas, % General del módulo
│   └── services/
│       └── attendance-admin.service.ts      # Cliente API para consultas administrativas
```

---

## 4. Especificación del Backend (NestJS + TypeORM)

### 4.1 Endpoint de Matriz de Asistencias
* **Ruta:** `GET /api/v1/attendances/matrix`
* **Método:** `GET`
* **Autenticación:** `@UseGuards(JwtAuthGuard, RolesGuard)` con `@Roles(UserRole.ADMIN)`
* **Parámetros Query:**
  * `date` (opcional, string YYYY-MM-DD): Filtra por una sesión de clase.
  * `studentId` (opcional, UUID): Filtra por un alumno específico.
* **Estructura de Respuesta:**
  ```json
  {
    "moduleId": "mod-uuid",
    "moduleName": "Módulo 2: IaC",
    "totalStudents": 32,
    "totalSessions": 12,
    "filterSummary": {
      "selectedDate": "2026-10-05",
      "totalPresent": 30,
      "totalAbsent": 2,
      "attendanceRate": 93.75
    },
    "matrix": [
      {
        "studentId": "std-1",
        "registrationNumber": "1001",
        "fullName": "Juan Pérez",
        "email": "juan@gmail.com",
        "records": [
          { "scheduleId": "sch-1", "date": "2026-10-05", "status": "PRESENTE", "markedAt": "18:05:00" },
          { "scheduleId": "sch-2", "date": "2026-10-07", "status": "FALTA", "markedAt": null }
        ],
        "totalPresent": 1,
        "totalAbsent": 1
      }
    ]
  }
  ```

---

## 5. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Consulta de matriz por fecha específica
  Dado que el administrador selecciona la fecha de clase "05/10/2026"
  Cuando aplica el filtro en "/admin/asistencias"
  Entonces observa la lista de todos los estudiantes con su marca ("Presente" o "Falta")
  Y el panel superior muestra: "Total Presentes: 28 | Total Ausentes: 4".

Escenario: Filtrado por estudiante específico
  Dado que el administrador busca a "María López"
  Cuando filtra por dicho estudiante
  Entonces la tabla muestra todas las fechas del módulo con el estado de asistencia exclusivo de María.

Escenario: Protección de ruta para estudiantes
  Dado que un usuario con sesión de estudiante intenta ingresar a "/admin/asistencias"
  Cuando el middleware o el backend evalúan la petición
  Entonces se bloquea el acceso con HTTP 403 Forbidden o redirección al panel de estudiante.
```

---

## 6. Checklist de Implementación para Programador 2

- [ ] **Paso 1:** Crear `attendance-matrix-query.dto.ts` y `attendance-matrix-response.dto.ts`.
- [ ] **Paso 2:** Implementar método `getAttendanceMatrix()` en `AttendancesService` consultando el módulo activo.
- [ ] **Paso 3:** Exponer `GET /api/v1/attendances/matrix` protegido con `@Roles(UserRole.ADMIN)`.
- [ ] **Paso 4:** Crear componentes `AttendanceMatrixFilters.tsx`, `AttendanceMatrixTable.tsx` y `AttendanceTotalsBanner.tsx`.
- [ ] **Paso 5:** Implementar la página `/admin/asistencias/page.tsx` en Next.js.
- [ ] **Paso 6:** Crear pruebas unitarias para el controlador y servicio en Jest.

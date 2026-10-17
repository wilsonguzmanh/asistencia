# Plan Técnico de Implementación: US-10 - Consulta y Búsqueda de Estudiantes Activos

Este documento define el plan de desarrollo técnico detallado para la historia **US-10**, asignada al **Programador 1 (Fase 2)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-10` |
| **Título** | Consulta y Búsqueda de Estudiantes del Módulo Activo |
| **Rol** | Administrador |
| **Requerimientos Funcionales** | `RF-06` (*Búsqueda dinámica y nómina de estudiantes*) |
| **Estimación** | 3 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-10-students-search-directory` |

---

## 2. Alcance y Objetivos Técnicos

El Administrador debe contar con una pantalla dedicada dentro del panel de administración (`/admin/estudiantes`) para consultar la nómina completa de estudiantes pertenecientes al módulo académico activo actual.
Debe incluir:
1. Vista paginada de estudiantes con sus columnas clave: **Número de registro**, **Nombre completo**, **Correo electrónico** y **Fecha de registro**.
2. Barra de búsqueda reactiva en tiempo real (con debounce de 300 ms) que filtre por:
   * Número de registro (ej. `"1001"`).
   * Nombre o apellido (ej. `"Pérez"` o `"María"`).
   * Correo electrónico (ej. `"@gmail.com"`).
3. Indicador del total de estudiantes matriculados en el módulo activo.
4. Estado vacío informativo cuando la búsqueda no devuelva coincidencias.

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/students/
│   ├── dto/
│   │   ├── student-filter-query.dto.ts      # Parámetros search, page, limit
│   │   └── student-list-response.dto.ts     # DTO con array de estudiantes y metadatos de paginación
│   ├── services/
│   │   └── students.service.ts              # Consulta con TypeORM filtrando por módulo activo
│   ├── students.controller.ts               # Endpoint GET /api/v1/students
│   ├── students.module.ts                   # Registro del módulo de estudiantes
│   └── students.controller.spec.ts          # Pruebas unitarias

frontend/src/
├── app/
│   └── admin/
│       └── estudiantes/
│           └── page.tsx                     # Pantalla de gestión y nómina de alumnos
├── features/students/
│   ├── components/
│   │   ├── StudentSearchBar.tsx             # Input con debounce y botón limpiar
│   │   └── ActiveStudentsTable.tsx          # Tabla responsiva con badges y paginador
│   ├── services/
│   │   └── students.service.ts              # Consumo de la API con token administrativo
│   └── types/
│       └── student.types.ts                 # Interfaces TypeScript
```

---

## 4. Especificación del Backend (NestJS + TypeORM)

### 4.1 Endpoint de Consulta de Estudiantes
* **Ruta:** `GET /api/v1/students`
* **Método:** `GET`
* **Autenticación:** Bearer Token JWT (`@Roles(UserRole.ADMIN)`)
* **Parámetros Query:**
  * `search` (opcional, string): Término a buscar.
  * `page` (opcional, número, default 1).
  * `limit` (opcional, número, default 20).
* **Swagger Tag:** `Students`

### 4.2 Lógica de Consulta en `StudentsService`
```typescript
async getActiveModuleStudents(query: StudentFilterQueryDto): Promise<StudentListResponseDto> {
  const { search, page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  // 1. Obtener ID del módulo activo actual (RN-01)
  const activeModule = await this.modulesRepository.findOne({
    where: { status: ModuleStatus.ACTIVE },
  });

  if (!activeModule) {
    return {
      moduleName: 'Ningún módulo activo',
      totalCount: 0,
      page,
      limit,
      students: [],
    };
  }

  // 2. Construir consulta con QueryBuilder
  const qb = this.studentsRepository.createQueryBuilder('student')
    .where('student.module_id = :moduleId', { moduleId: activeModule.id });

  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    qb.andWhere(
      '(student.full_name ILIKE :term OR student.registration_number ILIKE :term OR student.email ILIKE :term)',
      { term },
    );
  }

  qb.orderBy('student.registration_number', 'ASC')
    .skip(skip)
    .take(limit);

  const [students, totalCount] = await qb.getManyAndCount();

  return {
    moduleName: activeModule.name,
    moduleCode: activeModule.code,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    students,
  };
}
```

---

## 5. Especificación del Frontend (Next.js)

1. **Ruta:** `/admin/estudiantes`
2. **Componente de Búsqueda:** Input con icono de lupa, estado local y `useEffect` con `setTimeout` (300 ms debounce).
3. **Pestaña y Estadísticas:**
   * Tarjeta con total de matriculados.
   * Nombre y código del módulo activo en el encabezado.
   * Botón para exportar o enlace directo a configurar nuevo módulo si se requiere.
4. **Tabla de Estudiantes:**
   * Columnas: Matrícula (badge mono), Nombre Completo, Correo Electrónico.
   * Empty state visual agradable si no hay resultados para el filtro ingresado.

---

## 6. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Listado inicial de alumnos del módulo activo
  Dado que existe un módulo activo con 30 estudiantes
  Cuando el administrador entra a "/admin/estudiantes"
  Entonces observa la tabla con los primeros 20 alumnos ordenados por matrícula
  Y el encabezado indica: "30 estudiantes matriculados en [Nombre del Módulo]".

Escenario: Búsqueda dinámica por nombre o matrícula
  Dado que en el módulo activo existe el alumno "Carlos Ruiz" con registro "1003"
  Cuando el administrador escribe "1003" en el buscador
  Entonces la tabla se actualiza de inmediato mostrando únicamente la fila de "Carlos Ruiz".

Escenario: Búsqueda sin coincidencias
  Dado que el administrador escribe "9999"
  Cuando se evalúa el filtro
  Entonces se muestra el mensaje: "No se encontraron estudiantes que coincidan con '9999'".
```

---

## 7. Checklist de Implementación para Programador 1

- [ ] **Paso 1:** Crear `student-filter-query.dto.ts` y `student-list-response.dto.ts`.
- [ ] **Paso 2:** Crear `students.service.ts` con consulta sobre el módulo activo.
- [ ] **Paso 3:** Crear `students.controller.ts` con Swagger y Guards `@Roles(UserRole.ADMIN)`.
- [ ] **Paso 4:** Crear pruebas unitarias para el controlador y servicio de estudiantes.
- [ ] **Paso 5:** Crear `StudentSearchBar.tsx` y `ActiveStudentsTable.tsx` en frontend.
- [ ] **Paso 6:** Implementar la página `/admin/estudiantes/page.tsx` con soporte de búsqueda debounce.
- [ ] **Paso 7:** Probar en navegador la búsqueda dinámica y paginación.

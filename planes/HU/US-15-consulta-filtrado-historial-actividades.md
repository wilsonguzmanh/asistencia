# Plan Técnico de Implementación: US-15 - Consulta y Filtrado del Historial de Actividades

Este documento define el plan de desarrollo técnico detallado para la historia **US-15**, asignada al **Programador 2 (Fase 2)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-15` |
| **Título** | Consulta y Filtrado del Historial de Actividades |
| **Rol** | Administrador |
| **Requerimientos Funcionales** | `RF-10` (*Consulta y filtrado de la bitácora de auditoría*) |
| **Reglas de Negocio** | Restricción estricta de confidencialidad: acceso exclusivo para rol `ADMIN` |
| **Estimación** | 3 Story Points |
| **Prioridad** | Should Have |
| **Rama sugerida** | `feature/US-15-activity-logs-query` |

---

## 2. Alcance y Objetivos Técnicos

El Administrador debe poder auditar todos los sucesos relevantes del módulo activo mediante una pantalla especializada (`/admin/auditoria`):
1. Visualización cronológica paginada de todos los eventos (`ActivityLog`) asociados al módulo activo actual, ordenados desde el más reciente hacia el más antiguo.
2. Filtros de búsqueda reactivos:
   * Por identificador de estudiante o usuario (ej. `"1001"` o `"admin"`).
   * Por rango de fechas o fecha puntual.
   * Por tipo de acción (`LOGIN`, `MARK_ATTENDANCE`, `UPDATE_ATTENDANCE`, `ACTIVATE_MODULE`).
3. Detalle expandible del JSON de cambios (`previousValue` vs. `newValue`) para evidenciar qué campos fueron modificados.
4. Bloqueo absoluto de acceso para estudiantes (HTTP 403 Forbidden).

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/activity-logs/
│   ├── dto/
│   │   ├── activity-log-filter.dto.ts       # Parámetros search, action, dateFrom, dateTo, page, limit
│   │   └── activity-log-list-response.dto.ts# Listado paginado con metadatos
│   ├── activity-logs.controller.ts          # Endpoint GET /api/v1/activity-logs
│   ├── activity-logs.service.ts             # Método getModuleLogs() con QueryBuilder
│   └── activity-logs.controller.spec.ts     # Pruebas unitarias de seguridad y filtros

frontend/src/
├── app/
│   └── admin/
│       └── auditoria/
│           └── page.tsx                     # Pantalla de consulta de bitácora
├── features/activity-logs/
│   ├── components/
│   │   ├── ActivityLogsFilterBar.tsx        # Filtros por acción, usuario y fechas
│   │   ├── ActivityLogsTimelineTable.tsx    # Tabla con badges de acción e IP
│   │   └── ActivityLogDiffModal.tsx         # Modal visor de diferencias JSON
│   └── services/
│       └── activity-logs.service.ts         # Consumo del endpoint administrativo
```

---

## 4. Especificación del Backend (NestJS + TypeORM)

### 4.1 Endpoint de Consulta de Bitácora
* **Ruta:** `GET /api/v1/activity-logs`
* **Método:** `GET`
* **Autenticación:** `@UseGuards(JwtAuthGuard, RolesGuard)` con `@Roles(UserRole.ADMIN)`
* **Parámetros Query (`ActivityLogFilterDto`):**
  * `search` (opcional): Filtro por `userIdentifier` o `entityAffected`.
  * `action` (opcional, enum `ActivityAction`).
  * `dateFrom` y `dateTo` (opcional, ISO Date string).
  * `page` (default 1), `limit` (default 20).
* **Lógica en `ActivityLogsService`:**
  ```typescript
  async getModuleLogs(query: ActivityLogFilterDto): Promise<ActivityLogListResponseDto> {
    const activeModule = await this.modulesRepository.findOne({
      where: { status: ModuleStatus.ACTIVE },
    });

    const qb = this.activityLogRepository.createQueryBuilder('log')
      .where('log.moduleId = :moduleId', { moduleId: activeModule?.id });

    if (query.action) {
      qb.andWhere('log.action = :action', { action: query.action });
    }

    if (query.search) {
      qb.andWhere('log.userIdentifier ILIKE :s', { s: `%${query.search}%` });
    }

    qb.orderBy('log.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [logs, total] = await qb.getManyAndCount();
    return { logs, total, page: query.page, limit: query.limit };
  }
  ```

---

## 5. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Consulta cronológica de la bitácora por el administrador
  Dado que existen 15 eventos registrados en el módulo activo
  Cuando el administrador entra a "/admin/auditoria"
  Entonces observa la lista de eventos ordenada cronológicamente de forma descendente
  Y cada fila detalla fecha/hora, usuario, acción realizada e IP.

Escenario: Filtrado por acciones de modificación de asistencia
  Dado que el administrador selecciona el filtro de acción "UPDATE_ATTENDANCE"
  Cuando pulsa filtrar
  Entonces la tabla muestra únicamente los registros de modificaciones manuales de asistencia
  Y al hacer clic en "Ver Detalle", observa el JSON con el valor anterior y el valor nuevo.

Escenario: Denegación de acceso a estudiantes (RF-10)
  Dado que un usuario con sesión de estudiante intenta llamar a "GET /api/v1/activity-logs"
  Cuando el servidor procesa la petición
  Entonces el RolesGuard responde con HTTP 403 Forbidden impidiendo la visualización.
```

---

## 6. Checklist de Implementación para Programador 2

- [ ] **Paso 1:** Crear `activity-log-filter.dto.ts` y DTO de respuesta paginada.
- [ ] **Paso 2:** Implementar método `getModuleLogs()` en `ActivityLogsService`.
- [ ] **Paso 3:** Exponer `ActivityLogsController` con endpoint `GET /api/v1/activity-logs` protegido con `@Roles(UserRole.ADMIN)`.
- [ ] **Paso 4:** Crear componentes visuales de bitácora y visor JSON en Next.js.
- [ ] **Paso 5:** Desarrollar la pantalla `/admin/auditoria/page.tsx`.
- [ ] **Paso 6:** Crear pruebas unitarias para el controlador y servicio en Jest.

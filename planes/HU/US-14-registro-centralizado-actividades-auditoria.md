# Plan Técnico de Implementación: US-14 - Registro Centralizado de Actividades y Auditoría

Este documento define el plan de desarrollo técnico detallado para la historia **US-14**, asignada al **Programador 2 (Fase 1)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-14` |
| **Título** | Registro Centralizado de Actividades y Auditoría |
| **Rol** | Sistema / Auditoría |
| **Requerimientos Funcionales** | `RF-09` (*Registro inmutable de actividades clave*) |
| **Reglas de Negocio** | `RN-07` (*Toda modificación administrativa o de asistencia queda auditada*) |
| **Estimación** | 5 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-14-centralized-audit-log` |

---

## 2. Alcance y Objetivos Técnicos

El sistema debe proveer una capa transversal e inmutable de bitácora para registrar eventos críticos operados por administradores o estudiantes:
1. Marcaciones de asistencia por estudiantes (`MARK_ATTENDANCE`).
2. Modificaciones manuales o administrativas de asistencia con snapshot de valor anterior y nuevo (`UPDATE_ATTENDANCE`).
3. Importaciones de nómina de alumnos (`IMPORT_STUDENTS`) y calendario (`IMPORT_SCHEDULES`).
4. Activación transaccional y archivado de módulos (`ACTIVATE_MODULE`).
5. Inicios y cierres de sesión (`LOGIN`, `LOGOUT`).
6. Cada registro debe capturar: `id`, `moduleId`, `userId`, `userIdentifier`, `userRole`, `action`, `entityAffected`, `entityId`, `previousValue` (JSON), `newValue` (JSON), `ipAddress`, `correlationId` y `createdAt`.
7. Ningún registro de auditoría puede ser modificado o eliminado (tabla append-only).

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── common/
│   ├── enums/
│   │   └── activity-action.enum.ts          # Enum ActivityAction (LOGIN, LOGOUT, MARK_ATTENDANCE, etc.)
│   └── middleware/
│       └── correlation-id.middleware.ts     # Inyección de Correlation ID (x-correlation-id)
├── features/activity-logs/
│   ├── dto/
│   │   ├── create-activity-log.dto.ts       # DTO para crear un evento de bitácora
│   │   └── activity-log-response.dto.ts     # DTO para serialización de auditoría
│   ├── entities/
│   │   └── activity-log.entity.ts           # Entidad TypeORM append-only
│   ├── activity-logs.service.ts             # Servicio centralizado createLog()
│   ├── activity-logs.service.spec.ts        # Pruebas unitarias de persistencia inmutable
│   └── activity-logs.module.ts              # Módulo exportado para uso global
```

---

## 4. Especificación del Backend (NestJS + TypeORM)

### 4.1 Entidad `ActivityLog`
```typescript
@Entity('activity_logs')
export class ActivityLog extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'module_id' })
  moduleId?: string;

  @Column({ type: 'varchar', length: 150, nullable: true, name: 'user_id' })
  userId?: string;

  @Column({ type: 'varchar', length: 200, name: 'user_identifier' })
  userIdentifier: string;

  @Column({ type: 'enum', enum: UserRole, name: 'user_role' })
  userRole: UserRole;

  @Column({ type: 'enum', enum: ActivityAction })
  action: ActivityAction;

  @Column({ type: 'varchar', length: 100, name: 'entity_affected' })
  entityAffected: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'entity_id' })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true, name: 'previous_value' })
  previousValue?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'new_value' })
  newValue?: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'correlation_id' })
  correlationId?: string;
}
```

### 4.2 Servicio `ActivityLogsService`
* Método: `async createLog(dto: CreateActivityLogDto): Promise<ActivityLog>`
* Aislamiento de excepciones: no debe interrumpir la transacción principal en operaciones no críticas o debe integrarse en la transacción mediante `EntityManager` si es requerido por `RN-07`.

---

## 5. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Registro automático de traza inmutable en marcación
  Dado que un estudiante con registro "1001" marca su asistencia
  Cuando el backend procesa el check-in exitoso
  Entonces se inserta un registro en "activity_logs" con:
    - action: "MARK_ATTENDANCE"
    - userIdentifier: "1001"
    - userRole: "STUDENT"
    - entityAffected: "Attendance"
    - newValue: {"status": "PRESENTE", "classDate": "2026-10-05"}
  Y la marca de tiempo corresponde a la hora actual.

Escenario: Registro de modificación administrativa de asistencia
  Dado que el administrador modifica la asistencia de un alumno de FALTA a PRESENTE
  Cuando se confirma el cambio
  Entonces se genera un registro en "activity_logs" que contiene:
    - action: "UPDATE_ATTENDANCE"
    - previousValue: {"status": "FALTA"}
    - newValue: {"status": "PRESENTE", "remarks": "Justificado"}
  Y el registro queda protegido contra borrado o edición posterior.
```

---

## 6. Checklist de Implementación para Programador 2

- [x] **Paso 1:** Crear entidad `ActivityLog` con campos JSONB para previous/new value.
- [x] **Paso 2:** Crear `ActivityLogsService` con método `createLog()`.
- [x] **Paso 3:** Exportar `ActivityLogsModule` para permitir su inyección en `AuthModule` y `AttendancesModule`.
- [x] **Paso 4:** Crear pruebas unitarias en `activity-logs.service.spec.ts`.

# Plan Técnico de Implementación: US-08 - Marcación de Asistencia en Día de Clase Programada

Este documento define el plan de desarrollo técnico detallado para la historia **US-08**, asignada al **Programador 2 (Fase 1)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-08` |
| **Título** | Marcación de Asistencia en Día de Clase Programada |
| **Rol** | Estudiante |
| **Requerimientos Funcionales** | `RF-03` (*Marcación de asistencia en fecha programada*), `RF-18` (*Mensajes y alertas*) |
| **Reglas de Negocio** | `RN-03` (*Una sola marca por estudiante y clase*), `RN-04` (*Solo en día de clase programado*) |
| **Estimación** | 5 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-08-student-attendance-checkin` |

---

## 2. Alcance y Objetivos Técnicos

El estudiante autenticado debe poder registrar su asistencia desde su portal personal:
1. El botón de marcación **únicamente se activa si la fecha actual del servidor coincide con una fecha de clase programada** en el calendario del módulo activo (**RN-04**).
2. Si la fecha actual no coincide con una sesión de clase, el botón permanece deshabilitado e informa la fecha de la próxima sesión (**RF-03**).
3. Se admite **estrictamente una sola marca** por estudiante y sesión de clase (**RN-03**). Al marcar, el botón se deshabilita permanentemente mostrando la hora exacta registrada.
4. Cualquier intento de doble marcación es rechazado por el backend con HTTP 409 Conflict o HTTP 400 Bad Request.
5. Se guarda la marca de tiempo real UTC en el backend y se emite la traza de auditoría en `activity_logs`.

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/attendances/
│   ├── dto/
│   │   ├── check-in-response.dto.ts         # Respuesta de marcación exitosa
│   │   └── today-status.dto.ts              # Estado de la clase de hoy y si ya marcó
│   ├── entities/
│   │   └── attendance.entity.ts             # Entidad TypeORM con índice único (student_id, schedule_id)
│   ├── attendances.controller.ts            # GET /today-status y POST /check-in
│   ├── attendances.service.ts               # Lógica de validación de fecha y guardado
│   └── attendances.service.spec.ts          # Pruebas unitarias de marcación y duplicidad

frontend/src/
├── app/
│   └── asistencia/
│       └── page.tsx                         # Pantalla principal del estudiante con botón de marcación
├── features/attendances/
│   ├── components/
│   │   └── CheckInButton.tsx                # Botón de marcación con feedback y estados visuales
│   └── services/
│       └── attendance.service.ts            # Consumo de endpoints de marcación
```

---

## 4. Especificación del Backend (NestJS)

### 4.1 Entidad `Attendance`
```typescript
@Entity('attendances')
@Unique(['studentId', 'scheduleId'])
export class Attendance extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'student_id' })
  studentId: string;

  @Column({ type: 'uuid', name: 'schedule_id' })
  scheduleId: string;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENTE })
  status: AttendanceStatus;

  @Column({ type: 'timestamp with time zone', name: 'marked_at', default: () => 'CURRENT_TIMESTAMP' })
  markedAt: Date;

  @Column({ type: 'text', nullable: true })
  remarks?: string;
}
```

### 4.2 Endpoints de Asistencia
1. **Consultar estado de hoy:**
   * `GET /api/v1/attendances/today-status`
   * Guard: `@UseGuards(StudentJwtGuard)`
   * Retorna: `{ hasClassToday: boolean, schedule: ClassSchedule | null, alreadyCheckedIn: boolean, markedAt: string | null }`

2. **Marcar asistencia:**
   * `POST /api/v1/attendances/check-in`
   * Guard: `@UseGuards(StudentJwtGuard)`
   * Valida:
     1. Que hoy sea día de clase del módulo activo (`RN-04`).
     2. Que no exista una marca previa para `(studentId, scheduleId)` (`RN-03`).
     3. Inserta registro con `status = AttendanceStatus.PRESENTE`.
     4. Registra log en `ActivityLogsService` con acción `MARK_ATTENDANCE`.

---

## 5. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Marcación exitosa en día de clase programado
  Dado que hoy es una fecha registrada en el calendario de clases del módulo activo
  Y el estudiante autenticado no ha marcado el día de hoy
  Cuando presiona el botón "Registrar Asistencia de Hoy"
  Entonces el sistema guarda la asistencia con status "PRESENTE" y la hora real
  Y el botón cambia a deshabilitado indicando "Asistencia Marcada (Presente)".

Escenario: Prevención de doble marcación (RN-03)
  Dado que el estudiante ya registró su asistencia hoy
  Cuando intenta enviar una segunda solicitud de check-in
  Entonces el backend responde HTTP 409 Conflict: "Ya has registrado tu asistencia para la sesión de hoy"
  Y el registro anterior permanece intacto.

Escenario: Día sin clase programada (RN-04)
  Dado que la fecha de hoy no está en el calendario del módulo activo
  Cuando el estudiante abre "/asistencia"
  Entonces el botón de marcación aparece deshabilitado con el mensaje: "Hoy no hay clase programada".
```

---

## 6. Checklist de Implementación para Programador 2

- [x] **Paso 1:** Definir entidad `Attendance` con restricción de unicidad `(studentId, scheduleId)`.
- [x] **Paso 2:** Implementar endpoint `GET /api/v1/attendances/today-status`.
- [x] **Paso 3:** Implementar endpoint `POST /api/v1/attendances/check-in` con validación de fecha y horario.
- [x] **Paso 4:** Conectar registro automático en `ActivityLog` tras el check-in.
- [x] **Paso 5:** Desarrollar componente de botón y pantalla `/asistencia` en Next.js.
- [x] **Paso 6:** Crear pruebas unitarias en `attendances.service.spec.ts`.

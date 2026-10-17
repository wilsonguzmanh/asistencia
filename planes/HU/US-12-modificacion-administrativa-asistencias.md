# Plan Técnico de Implementación: US-12 - Modificación Administrativa de Asistencias con Auditoría

Este documento define el plan de desarrollo técnico detallado para la historia **US-12**, asignada al **Programador 2 (Fase 2)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-12` |
| **Título** | Modificación Administrativa de Asistencias con Auditoría |
| **Rol** | Administrador |
| **Requerimientos Funcionales** | `RF-07` (*Cambio de estado Presente/Falta*), `RF-18` (*Feedback y mensajes*) |
| **Reglas de Negocio** | `RN-06` (*Solo el admin modifica asistencias fuera de fecha*), `RN-07` (*Toda modificación queda auditada*) |
| **Estimación** | 5 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-12-admin-attendance-override` |

---

## 2. Alcance y Objetivos Técnicos

El Administrador debe poder corregir el estado de asistencia de cualquier estudiante en cualquier fecha de clase programada (pasada o presente), para atender justificaciones médicas, laborales o errores involuntarios:
1. Solo el administrador cuenta con permisos para modificar asistencias fuera de fecha (**RN-06**).
2. Se permite cambiar el estado de `FALTA` a `PRESENTE` o de `PRESENTE` a `FALTA` (**RF-07**).
3. Es obligatorio o altamente recomendado ingresar un motivo o justificación (`remarks`).
4. **Auditoría obligatoria (**RN-07**):** En la misma transacción de actualización, el backend debe registrar en `ActivityLog`:
   * Identificador del administrador.
   * Acción: `UPDATE_ATTENDANCE`.
   * Entidad afectada: `Attendance`.
   * Valor previo: `{"status": "FALTA"}`.
   * Valor nuevo: `{"status": "PRESENTE", "remarks": "Justificado por certificado médico"}`.
   * Marca de tiempo real e IP.
5. Si no existía un registro físico de `Attendance` para una clase pasada (porque era falta implícita), el sistema debe crearlo con el nuevo estado especificado.

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/attendances/
│   ├── dto/
│   │   ├── override-attendance.dto.ts       # studentId, scheduleId, status, remarks
│   │   └── attendance-override-response.dto.ts
│   ├── attendances.controller.ts            # Endpoint PUT /api/v1/attendances/override
│   ├── attendances.service.ts               # Método overrideAttendance() con transacción y log
│   └── attendances.service.spec.ts          # Pruebas unitarias de override y auditoría

frontend/src/
├── features/attendances/
│   ├── components/
│   │   └── EditAttendanceModal.tsx          # Modal interactivo con selector de estado y campo de justificación
│   └── services/
│       └── attendance-admin.service.ts      # Método overrideAttendance()
```

---

## 4. Especificación del Backend (NestJS + TypeORM)

### 4.1 Endpoint de Modificación de Asistencia
* **Ruta:** `PUT /api/v1/attendances/override`
* **Método:** `PUT`
* **Autenticación:** `@UseGuards(JwtAuthGuard, RolesGuard)` con `@Roles(UserRole.ADMIN)`
* **Body (`OverrideAttendanceDto`):**
  ```json
  {
    "studentId": "std-uuid",
    "scheduleId": "sch-uuid",
    "status": "PRESENTE",
    "remarks": "Presentó justificativo médico emitido por CPS"
  }
  ```
* **Lógica Transaccional:**
  ```typescript
  async overrideAttendance(dto: OverrideAttendanceDto, adminUser: any, ipAddress?: string) {
    let attendance = await this.attendanceRepo.findOne({
      where: { studentId: dto.studentId, scheduleId: dto.scheduleId },
    });

    const previousStatus = attendance ? attendance.status : AttendanceStatus.FALTA;
    const previousRemarks = attendance?.remarks ?? null;

    if (!attendance) {
      attendance = this.attendanceRepo.create({
        studentId: dto.studentId,
        scheduleId: dto.scheduleId,
        status: dto.status,
        remarks: dto.remarks,
        markedAt: new Date(),
      });
    } else {
      attendance.status = dto.status;
      attendance.remarks = dto.remarks;
    }

    await this.attendanceRepo.save(attendance);

    // Auditoría inmutable obligatoria (RN-07)
    await this.activityLogsService.createLog({
      moduleId: activeModule.id,
      userId: adminUser.userId,
      userIdentifier: adminUser.username,
      userRole: UserRole.ADMIN,
      action: ActivityAction.UPDATE_ATTENDANCE,
      entityAffected: 'Attendance',
      entityId: attendance.id,
      previousValue: { status: previousStatus, remarks: previousRemarks },
      newValue: { status: dto.status, remarks: dto.remarks },
      ipAddress,
    });

    return attendance;
  }
  ```

---

## 5. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Justificación de falta administrativa con registro en bitácora
  Dado que el estudiante figura con estado "Falta" en la fecha "05/10/2026"
  Cuando el administrador abre el modal de edición
  Y cambia el estado a "Presente" con la justificación "Certificado médico presentado"
  Y presiona "Guardar Cambio"
  Entonces la asistencia del alumno se actualiza a "Presente"
  Y se crea automáticamente un registro en "activity_logs" que audita el cambio (RN-07)
  Y la matriz visualiza el nuevo estado de inmediato con un mensaje de éxito.

Escenario: Rechazo de modificación sin permisos de administrador
  Dado que un usuario sin rol ADMIN intenta invocar "PUT /api/v1/attendances/override"
  Cuando se evalúa la solicitud
  Entonces el sistema responde con HTTP 403 Forbidden
  Y ningún dato es alterado en la base de datos.
```

---

## 6. Checklist de Implementación para Programador 2

- [ ] **Paso 1:** Crear `override-attendance.dto.ts` con validación de enums y justificación.
- [ ] **Paso 2:** Implementar lógica `overrideAttendance()` en `AttendancesService` integrando `ActivityLogsService`.
- [ ] **Paso 3:** Exponer endpoint `PUT /api/v1/attendances/override` con `@Roles(UserRole.ADMIN)`.
- [ ] **Paso 4:** Desarrollar componente `EditAttendanceModal.tsx` en el frontend.
- [ ] **Paso 5:** Conectar el modal a la tabla matriz de asistencias (`/admin/asistencias`).
- [ ] **Paso 6:** Crear pruebas unitarias verificando la emisión de auditoría en `attendances.service.spec.ts`.

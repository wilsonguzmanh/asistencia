# Plan Técnico de Implementación: US-07 - Activación de Nuevo Módulo y Archivado Histórico

Este documento define el plan de desarrollo técnico detallado para la historia **US-07**, asignada al **Programador 1 (Fase 2)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-07` |
| **Título** | Activación de Nuevo Módulo Académico con Archivado Histórico |
| **Rol** | Administrador |
| **Requerimientos Funcionales** | `RF-13` (*Confirmación explícita*), `RF-14` (*Activación del nuevo módulo*), `RF-15` (*Asociación y retención histórica*), `RF-18` (*Mensajes de estado*) |
| **Reglas de Negocio** | `RN-01` (*Un único módulo activo a la vez*), `RN-08` (*Preservación inmutable de datos históricos*) |
| **Estimación** | 5 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-07-module-activation-archive` |

---

## 2. Alcance y Objetivos Técnicos

Esta historia conecta el proceso de carga masiva de las historias `US-04`, `US-05` y `US-06` con la persistencia real y transaccional en la base de datos PostgreSQL.
Al confirmar la activación desde el modal de la vista previa:
1. Se garantiza la regla **RN-01**: cualquier módulo actualmente en estado `ACTIVE` pasa atómicamente a `INACTIVE` o `ARCHIVED`.
2. Se inserta el nuevo `AcademicModule` con estado `ACTIVE`.
3. Se insertan en lote todos los estudiantes (`Student`) asociados al nuevo `moduleId`.
4. Se insertan en lote todas las fechas de clase (`ClassSchedule`) asociadas al nuevo `moduleId`.
5. Se registra el evento en la bitácora de auditoría inmutable (`ActivityLog`).
6. Si cualquier paso falla, la transacción se revierte por completo (rollback ACID).

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/modules/
│   ├── dto/
│   │   ├── activate-module.dto.ts           # DTO con metadatos, estudiantes y calendario
│   │   └── activated-module-response.dto.ts # DTO con confirmación y resumen del módulo activo
│   ├── services/
│   │   └── modules.service.ts               # Método activateNewModule() con QueryRunner ACID
│   ├── modules.controller.ts                # Endpoint POST /api/v1/modules/activate
│   └── modules.controller.spec.ts           # Pruebas unitarias del endpoint de activación
backend/src/
├── features/activity-logs/
│   └── activity-logs.service.ts             # Emisión de log auditable de activación

frontend/src/
├── features/modules/
│   ├── services/
│   │   └── module-import.service.ts         # Método activateModule(payload, token)
│   └── hooks/
│   │   └── useModuleImportWizard.ts         # Integración de la llamada real a la API
├── app/
│   └── admin/
│       └── modulo/
│           └── preview/
│               └── page.tsx                 # Manejo del estado de carga y éxito de activación
```

---

## 4. Especificación del Backend (NestJS + TypeORM)

### 4.1 Endpoint de Activación Transaccional
* **Ruta:** `POST /api/v1/modules/activate`
* **Método:** `POST`
* **Autenticación:** Bearer Token JWT (`@Roles(UserRole.ADMIN)`)
* **Swagger Tag:** `Modules`

### 4.2 DTO de Solicitud (`activate-module.dto.ts`)
```typescript
export class ActivateModuleDto {
  @ApiProperty({ example: 'Módulo 2: Infraestructura como Código' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'DCID-V1E1-M2' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [StudentRowDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  students: StudentRowDto[];

  @ApiProperty({ type: [ScheduleRowDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  schedules: ScheduleRowDto[];
}
```

### 4.3 Flujo Transaccional ACID con `QueryRunner`
```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  // 1. Archivar módulo actualmente activo si existe (RN-01, RN-08)
  await queryRunner.manager.update(
    AcademicModule,
    { status: ModuleStatus.ACTIVE },
    { status: ModuleStatus.INACTIVE }
  );

  // 2. Crear nuevo módulo activo
  const newModule = queryRunner.manager.create(AcademicModule, {
    name: dto.name,
    code: dto.code,
    description: dto.description,
    status: ModuleStatus.ACTIVE,
  });
  const savedModule = await queryRunner.manager.save(newModule);

  // 3. Insertar estudiantes vinculados al nuevo módulo
  const studentsEntities = dto.students.map(s => 
    queryRunner.manager.create(Student, {
      module: savedModule,
      registrationNumber: s.registrationNumber,
      fullName: s.fullName,
      email: s.email,
    })
  );
  await queryRunner.manager.save(studentsEntities);

  // 4. Insertar calendario vinculado al nuevo módulo
  const scheduleEntities = dto.schedules.map(sch => 
    queryRunner.manager.create(ClassSchedule, {
      module: savedModule,
      classDate: sch.classDate,
      startTime: sch.startTime,
      endTime: sch.endTime,
    })
  );
  await queryRunner.manager.save(scheduleEntities);

  // 5. Commit de la transacción
  await queryRunner.commitTransaction();

  // 6. Registrar en bitácora de auditoría
  await this.activityLogService.logAction({
    action: AuditAction.MODULE_ACTIVATED,
    performedBy: adminUser.email,
    details: `Activado módulo ${savedModule.code} con ${studentsEntities.length} estudiantes y ${scheduleEntities.length} clases.`,
    moduleId: savedModule.id,
  });

  return savedModule;
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

---

## 5. Especificación del Frontend (Next.js)

1. En [`useModuleImportWizard.ts`](file:///d:/Universidad/Postgrado/Diplomado/DEVOPS/Modulo2%20DCID-V1E1%20-%2002.%20INFRAESTRUCTURA%20COMO%20C%C3%93DIGO%20%28IAC%29/frontend/src/features/modules/hooks/useModuleImportWizard.ts), reemplazar la simulación de `sessionStorage` por el llamado a `ModuleImportService.activateModule(payload, token)`.
2. Al recibir respuesta `201 Created`:
   * Desplegar banner de éxito con ID y código del módulo activo.
   * Limpiar las variables temporales de `sessionStorage` (`pending_students_import`, `pending_schedules_import`, `pending_module_metadata`).
   * Proporcionar enlace directo al panel del administrador `/admin/dashboard` o a la gestión de estudiantes `/admin/estudiantes`.

---

## 6. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Activación exitosa de nuevo módulo académico
  Dado que el administrador completó la revisión previa con 30 estudiantes y 10 clases
  Cuando confirma en el modal de activación
  Entonces el sistema responde HTTP 201 Created
  Y en la base de datos el módulo anterior tiene estado "INACTIVE"
  Y el nuevo módulo tiene estado "ACTIVE"
  Y existen exactamente 30 estudiantes y 10 clases vinculados al nuevo módulo
  Y se ha registrado el log de auditoría correspondiente.

Escenario: Reversión atómica ante fallo en la persistencia (ACID Rollback)
  Dado que ocurre un error de base de datos durante la inserción de los estudiantes
  Cuando la transacción falla
  Entonces el sistema ejecuta rollback
  Y el módulo anterior permanece en estado "ACTIVE" sin alteraciones
  Y se muestra al administrador un mensaje de error claro: "No se pudo activar el módulo. Se preservó el estado anterior."
```

---

## 7. Checklist de Implementación para Programador 1

- [ ] **Paso 1:** Crear `activate-module.dto.ts` y `activated-module-response.dto.ts` en backend.
- [ ] **Paso 2:** Implementar `activateNewModule()` con `QueryRunner` transaccional en `modules.service.ts`.
- [ ] **Paso 3:** Exponer endpoint `POST /api/v1/modules/activate` en `modules.controller.ts`.
- [ ] **Paso 4:** Crear método `activateModule` en `frontend/src/features/modules/services/module-import.service.ts`.
- [ ] **Paso 5:** Conectar la llamada real en `useModuleImportWizard.ts` y en `ActivationModalConfirmation.tsx`.
- [ ] **Paso 6:** Pruebas unitarias de servicio y controlador con Jest (`npm test`).
- [ ] **Paso 7:** Prueba end-to-end desde el asistente web en el navegador.

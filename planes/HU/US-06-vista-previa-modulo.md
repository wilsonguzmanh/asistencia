# Plan Técnico de Implementación: US-06 - Vista Previa de Datos antes de Activar Módulo

Este documento define el plan de desarrollo técnico para la historia **US-06**, asignada al **Programador 1 (Fase 1)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-06` |
| **Título** | Vista Previa de Datos antes de Activar un Nuevo Módulo |
| **Rol** | Administrador |
| **Requerimientos Funcionales** | `RF-16` (*Vista previa de estudiantes y fechas*), `RF-18` (*Mensajes de confirmación y error*) |
| **Estimación** | 3 Story Points |
| **Prioridad** | Should Have |
| **Rama sugerida** | `feature/US-06-module-data-preview` |

---

## 2. Alcance y Objetivos Técnicos

El Administrador debe contar con una pantalla consolidada de revisión (asistente / wizard) donde se visualicen los datos parseados de estudiantes (`US-04`) y fechas de clase (`US-05`) junto con los metadatos del nuevo módulo (nombre y código), antes de proceder a la activación irreversible del módulo académico en base de datos.

### Beneficio para el Usuario:
Evitar errores humanos o inconsistencias en los datos cargados antes de reemplazar el módulo activo anterior.

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/modules/
│   ├── dto/
│   │   └── module-preview-summary.dto.ts    # DTO consolidado con totales y validaciones
│   ├── modules.controller.ts                # Endpoint POST /api/v1/modules/preview
│   └── modules.service.ts                   # Servicio que valida simultáneamente ambos archivos

frontend/src/
├── app/
│   └── admin/
│       └── modulo/
│           └── preview/
│               └── page.tsx                 # Pantalla de vista previa consolidada
├── features/modules/
│   ├── components/
│   │   ├── ModuleMetadataForm.tsx           # Formulario de Nombre y Código del módulo
│   │   ├── ModulePreviewSummaryCards.tsx    # Tarjetas KPI (Total Alumnos, Total Clases, Rango Fechas)
│   │   ├── ModulePreviewTabs.tsx            # Pestañas para conmutar entre Alumnos y Clases
│   │   └── ActivationModalConfirmation.tsx  # Modal de advertencia previo a US-07
│   └── hooks/
│       └── useModuleImportWizard.ts         # Hook de estado con los datos cargados en memoria
```

---

## 4. Especificación del Backend (NestJS)

### 4.1 Endpoint de Previsualización Consolidada
Permite al administrador enviar simultáneamente ambos archivos (o invocarse en Frontend tras haber subido ambos individualmente):

* **Ruta:** `POST /api/v1/modules/preview`
* **Método:** `POST` (`multipart/form-data`) con dos campos de archivo:
  * `studentsFile`: Archivo `.xlsx` de estudiantes.
  * `schedulesFile`: Archivo `.xlsx` de calendario.
* **Swagger Tag:** `Modules`

### 4.2 DTO de Respuesta (`module-preview-summary.dto.ts`)
```typescript
export class ModulePreviewSummaryDto {
  isValid: boolean;
  canActivate: boolean;
  totalStudents: number;
  totalSchedules: number;
  estimatedStartDate: string;
  estimatedEndDate: string;
  studentsPreview: StudentRowDto[];
  schedulesPreview: ScheduleRowDto[];
  validationErrors: {
    studentsErrors: RowValidationError[];
    schedulesErrors: RowValidationError[];
  };
}
```

```json
// Respuesta exitosa (200 OK)
{
  "status": "success",
  "message": "Vista previa generada con éxito",
  "data": {
    "isValid": true,
    "canActivate": true,
    "totalStudents": 32,
    "totalSchedules": 12,
    "estimatedStartDate": "2026-10-05",
    "estimatedEndDate": "2026-11-15",
    "studentsPreview": [
      { "registrationNumber": "1001", "fullName": "Juan Pérez", "email": "juan@gmail.com" },
      { "registrationNumber": "1002", "fullName": "María López", "email": "maria@gmail.com" }
    ],
    "schedulesPreview": [
      { "classDate": "2026-10-05", "startTime": "18:00", "endTime": "21:00" },
      { "classDate": "2026-10-07", "startTime": "18:00", "endTime": "21:00" }
    ],
    "validationErrors": {
      "studentsErrors": [],
      "schedulesErrors": []
    }
  }
}
```

---

## 5. Especificación del Frontend (Next.js)

### 5.1 Flujo del Asistente (Wizard de 3 Pasos)
1. **Paso 1: Datos del Módulo y Carga de Archivos:**
   * Nombre del módulo (ej. *"Módulo 3: Automatización de Pruebas"*).
   * Código de módulo (ej. *"DCID-V1E1-M3"*).
   * Carga de Excel de Estudiantes ([`US-04`](US-04-importacion-estudiantes-excel.md)).
   * Carga de Excel de Fechas ([`US-05`](US-05-importacion-fechas-horarios-excel.md)).
2. **Paso 2: Vista Previa y Validación ([`US-06`](US-06-vista-previa-modulo.md)):**
   * Tarjetas resumen:
     * 👥 Estudiantes detectados: `32`
     * 📅 Sesiones programadas: `12 clases`
     * ⏳ Período académico: `05/10/2026 al 15/11/2026`
   * Pestaña 1: Nómina de estudiantes con buscador local en tiempo real.
   * Pestaña 2: Cronograma de clases con horas formatadas.
3. **Paso 3: Botón de Activación:**
   * Botón *"Continuar a Activación"* habilitado únicamente si ambos archivos son válidos y no contienen errores de validación.
   * Al hacer clic, abre el modal de confirmación (**RF-13 / US-07**).

---

## 6. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Visualización exitosa de la vista previa cuando ambos archivos son correctos
  Dado que el administrador ha cargado el archivo de estudiantes con 30 alumnos
  Y ha cargado el calendario con 10 clases sin errores
  Cuando accede a la pantalla de vista previa
  Entonces el sistema muestra las tarjetas con 30 estudiantes y 10 clases
  Y el botón "Continuar a Activación" se encuentra habilitado y resaltado.

Escenario: Bloqueo de avance si alguno de los archivos presenta errores
  Dado que el archivo de estudiantes contiene 1 matrícula duplicada
  Cuando se evalúa la vista previa
  Entonces el sistema muestra la pestaña de errores en color rojo
  Y el botón de activación permanece completamente bloqueado con el mensaje: "Debe resolver los errores en los archivos antes de continuar".
```

---

## 7. Checklist de Implementación para Programador 1

- [ ] **Paso 1:** Crear `module-preview-summary.dto.ts` en el backend.
- [ ] **Paso 2:** Crear endpoint `POST /api/v1/modules/preview` en `modules.controller.ts`.
- [ ] **Paso 3:** Implementar hook `useModuleImportWizard` en Next.js para gestionar el estado de los archivos y metadatos.
- [ ] **Paso 4:** Crear componentes visuales: tarjetas KPI de resumen y pestañas de conmutación.
- [ ] **Paso 5:** Integrar la validación condicional que habilita o deshabilita el botón de activación.
- [ ] **Paso 6:** Probar el flujo completo en frontend desde la subida de los dos archivos hasta la renderización de la vista previa.

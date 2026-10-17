# Plan Técnico de Implementación: US-05 - Importación de Fechas y Horarios vía Excel

Este documento define el plan de desarrollo técnico para la historia **US-05**, asignada al **Programador 1 (Fase 1)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-05` |
| **Título** | Importación de Fechas y Horarios de Clase vía Excel |
| **Rol** | Administrador |
| **Requerimientos Funcionales** | `RF-12` (*Importar fechas y horarios*), `RF-18` (*Mensajes de error y confirmación*) |
| **Reglas de Negocio** | Días habilitados para marcar asistencia (**RN-04**) |
| **Estimación** | 5 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-05-excel-schedules-import` |

---

## 2. Formato Esperado del Archivo Excel

El archivo debe coincidir con la plantilla oficial del documento de requerimientos:

| Fecha | Hora inicio | Hora fin |
| :--- | :--- | :--- |
| 05/10/2026 | 18:00 | 21:00 |
| 07/10/2026 | 18:00 | 21:00 |

### Reglas de Negocio y Validación:
1. **Fecha de clase:**
   * Formato válido: `DD/MM/YYYY` o tipo fecha nativo de Excel.
   * Normalización en base de datos: Cadena estándar ISO `YYYY-MM-DD`.
   * **Unicidad:** No se permite que la misma fecha aparezca dos veces en el archivo.
2. **Horarios de clase (Hora inicio y Hora fin):**
   * Formato válido: `HH:mm` (ej. `18:00`, `21:00`).
   * Validación lógica: `Hora inicio` debe ser cronológicamente anterior a `Hora fin`.
   * **Regla de Negocio (RF-12 / Exclusiones):** En esta versión, los horarios son **estrictamente informativos**; el estudiante podrá marcar durante todo el día de la fecha programada (de 00:00:00 a 23:59:59).

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/modules/
│   ├── dto/
│   │   ├── schedule-row.dto.ts              # DTO que representa una sesión de clase
│   │   └── schedule-validation-result.dto.ts# Resultado de validación con errores/éxito
│   ├── services/
│   │   └── schedule-parser.service.ts       # Parser específico para calendario de clases
│   ├── modules.controller.ts                # Endpoint POST /api/v1/modules/import/schedules
│   └── modules.module.ts                    # Registro de ScheduleParserService

frontend/src/
├── features/modules/
│   ├── components/
│   │   ├── ScheduleDropzone.tsx             # Carga de archivo de fechas
│   │   ├── ScheduleErrorsTable.tsx          # Tabla de errores en fechas/horas
│   │   └── SchedulesTablePreview.tsx        # Tabla cronológica de clases detectadas
│   └── services/
│       └── schedule-import.service.ts       # Cliente HTTP para subida de calendario
```

---

## 4. Especificación del Backend (NestJS)

### 4.1 DTOs de Dominio
#### `schedule-row.dto.ts`
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ScheduleRowDto {
  @ApiProperty({ example: '2026-10-05', description: 'Fecha en formato YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  classDate: string;

  @ApiProperty({ example: '18:00', description: 'Hora de inicio informativa' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Hora de inicio inválida (HH:mm)' })
  startTime: string;

  @ApiProperty({ example: '21:00', description: 'Hora de finalización informativa' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Hora de fin inválida (HH:mm)' })
  endTime: string;

  @ApiProperty({ example: 2 })
  rowNumber: number;
}
```

### 4.2 Lógica de Parseo (`schedule-parser.service.ts`)
1. Cargar el buffer Excel con `exceljs`.
2. Validar que la primera hoja contenga las cabeceras requeridas (`fecha`, `hora inicio`, `hora fin`).
3. Analizar cada fila a partir de la fila 2:
   * Parsear fechas: Interpretar si viene como objeto `Date` de Excel o texto `DD/MM/YYYY`. Normalizar a `YYYY-MM-DD`.
   * Verificar unicidad: Utilizar `Set<string>` para garantizar que ninguna `classDate` esté duplicada.
   * Parsear horas: Validar formato `HH:mm` y comprobar que `startTime < endTime`.
4. Si hay inconsistencias, registrar el detalle del fallo con número de fila.
5. Ordenar cronológicamente las fechas válidas de menor a mayor.
6. Retornar el resultado de validación.

### 4.3 Endpoint y Swagger (`modules.controller.ts`)
* **Ruta:** `POST /api/v1/modules/import/schedules`
* **Método:** `POST` (`multipart/form-data`)
* **Swagger Tag:** `Modules`

```json
// Respuesta exitosa (200 OK)
{
  "status": "success",
  "message": "Fechas y horarios procesados correctamente",
  "data": {
    "totalSessions": 10,
    "hasErrors": false,
    "errors": [],
    "schedules": [
      {
        "classDate": "2026-10-05",
        "startTime": "18:00",
        "endTime": "21:00",
        "rowNumber": 2
      },
      {
        "classDate": "2026-10-07",
        "startTime": "18:00",
        "endTime": "21:00",
        "rowNumber": 3
      }
    ]
  }
}
```

---

## 5. Especificación del Frontend (Next.js)

### 5.1 Componente UI (`ScheduleDropzone.tsx`)
* Diseñado como el paso 2 del asistente de importación.
* Admite arrastrar o seleccionar el archivo `.xlsx` del calendario.
* Validación previa de tipo MIME antes de enviar al servidor.

### 5.2 Tabla de Clases Cronológica (`SchedulesTablePreview.tsx`)
* Muestra el resumen del curso:
  * Total de clases programadas (ej. `10 sesiones`).
  * Fecha de inicio estimada (primera fecha del archivo).
  * Fecha de cierre estimada (última fecha del archivo).
* Tabla interactiva con columnas: `# Sesión`, `Fecha (DD/MM/YYYY)`, `Horario programado (Inicio - Fin)`.

---

## 6. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Archivo con fechas repetidas emite alerta de error
  Dado que el administrador carga un Excel donde las filas 2 y 4 contienen la fecha "05/10/2026"
  Cuando el servicio valida el calendario
  Entonces se retorna código de error de validación
  Y el mensaje especifica: "La fecha 05/10/2026 se encuentra repetida en la fila 4".

Escenario: Importación correcta ordena las clases cronológicamente
  Dado un archivo Excel con fechas desordenadas (ej. 12/10, 05/10, 08/10)
  Cuando el backend procesa el archivo
  Entonces valida los datos y retorna el listado ordenado cronológicamente: 05/10, 08/10, 12/10.
```

---

## 7. Checklist de Implementación para Programador 1

- [ ] **Paso 1:** Crear `ScheduleRowDto` con validaciones de fecha y expresiones regulares de hora.
- [ ] **Paso 2:** Crear `ScheduleParserService` con normalización de formatos (`DD/MM/YYYY` -> `YYYY-MM-DD`).
- [ ] **Paso 3:** Implementar validación de no duplicidad de fechas y hora inicio < hora fin.
- [ ] **Paso 4:** Crear endpoint `POST /api/v1/modules/import/schedules` con Swagger.
- [ ] **Paso 5:** Probar subida de archivos en Swagger UI (`/api/docs`).
- [ ] **Paso 6:** Crear componentes `ScheduleDropzone` y `SchedulesTablePreview` en Next.js.
- [ ] **Paso 7:** Probar integración con el frontend.

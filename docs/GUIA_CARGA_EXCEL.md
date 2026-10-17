# Guía Oficial de Carga Masiva y Plantillas Excel

Este documento detalla la estructura, reglas de validación y funcionamiento técnico de las plantillas Excel desarrolladas para el **Sistema Web de Registro y Control de Asistencia**, en correspondencia directa con las Historias de Usuario (**US-04**, **US-05**, **US-06**, **US-07** y **US-13**) y las implementaciones del backend y frontend.

---

## 1. Catálogo de Archivos Excel Disponibles en `docs/`

Todas las plantillas han sido generadas respetando las directivas visuales y las validaciones del backend (`exceljs` + `NestJS` + `Next.js`).

| Archivo | Ubicación | Finalidad / Rol | Historia de Usuario | Estado de Verificación |
| :--- | :--- | :--- | :---: | :---: |
| **`plantilla_estudiantes.xlsx`** | `docs/` | Plantilla oficial lista para cargar nómina de alumnos | `US-04` / `RF-11` | ✅ 100% Válido (25 alumnos) |
| **`plantilla_fechas_horarios.xlsx`** | `docs/` | Plantilla oficial lista para cargar calendario de clases | `US-05` / `RF-12` | ✅ 100% Válido (12 sesiones) |
| **`01_plantilla_estudiantes_valida.xlsx`** | `docs/plantillas_excel/` | Nómina de estudiantes con hoja de instrucciones | `US-04` / `RN-02` | ✅ 100% Válido (25 alumnos) |
| **`02_plantilla_fechas_horarios_valida.xlsx`** | `docs/plantillas_excel/` | Calendario ordenado con hoja de instrucciones | `US-05` / `RN-04` | ✅ 100% Válido (12 sesiones) |
| **`03_plantilla_estudiantes_con_errores_prueba.xlsx`** | `docs/plantillas_excel/` | Archivo con casos de error intencionales para pruebas QA | `US-04` / `RF-18` | ⚠️ 7 Errores detectados |
| **`04_plantilla_fechas_horarios_con_errores_prueba.xlsx`** | `docs/plantillas_excel/` | Archivo con fallas de calendario para pruebas QA | `US-05` / `RF-18` | ⚠️ 7 Errores detectados |
| **`05_plantilla_carga_masiva_modulo_completo.xlsx`** | `docs/plantillas_excel/` | Libro maestro multi-pestaña (Metadatos + Alumnos + Fechas) | `US-06` / `US-07` | ✅ Consolidado Maestro |
| **`06_plantilla_matriz_asistencias_referencia.xlsx`** | `docs/plantillas_excel/` | Matriz cruzada de asistencia con fórmulas automáticas | `US-13` / `RF-17` | 📊 Reporte y Fórmulas |

---

## 2. Análisis Detallado: Historias de Usuario vs. Código Fuente

### 2.1 Carga de Estudiantes (US-04)

* **Historia de Usuario:** `US-04` (*Importación y Validación de Estudiantes vía Excel*).
* **Requerimientos Asociados:** `RF-11` (Importar estudiantes), `RN-02` (Unicidad de número de registro), `RF-18` (Mensajes de error y confirmación).
* **Servicio Backend:** [`ExcelParserService`](../../backend/src/features/modules/services/excel-parser.service.ts).
* **Endpoint API:** `POST /api/v1/modules/import/students` ([`ModulesController`](../../backend/src/features/modules/modules.controller.ts)).
* **Componentes Frontend:** [`FileDropzone.tsx`](../../frontend/src/features/modules/components/FileDropzone.tsx), [`StudentErrorsTable.tsx`](../../frontend/src/features/modules/components/StudentErrorsTable.tsx), [`StudentsTablePreview.tsx`](../../frontend/src/features/modules/components/StudentsTablePreview.tsx).

#### Estructura de Columnas Requerida:
1. `Número de registro` (Tolerante a: `numero de registro`, `registro`, `matricula`, `nro de registro`).
2. `Nombre completo` (Tolerante a: `nombre`, `nombre completo`).
3. `Correo electrónico` (Tolerante a: `correo electronico`, `correo`, `email`).

#### Reglas de Validación en Código:
* **Obligatoriedad:** Ninguna celda de las 3 columnas puede estar vacía o contener solo espacios.
* **Unicidad de Matrícula (RN-02):** Implementada mediante un `Map<string, number>()` en memoria ($O(N)$). Si una matrícula ya apareció en una fila anterior, la fila actual se marca con error y se informa la fila original donde se detectó.
* **Sintaxis de Correo:** Expresión regular estándar `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
* **Atomicidad de Validación:** Si se encuentra aunque sea un solo error, el backend **no guarda datos parciales** y retorna la lista completa de errores desglosados por número de fila.

---

### 2.2 Carga de Fechas y Horarios de Clase (US-05)

* **Historia de Usuario:** `US-05` (*Importación de Fechas y Horarios de Clase vía Excel*).
* **Requerimientos Asociados:** `RF-12` (Importar fechas y horarios), `RN-04` (Días habilitados para marcar asistencia), `RF-18` (Mensajes informativos).
* **Servicio Backend:** [`ScheduleParserService`](../../backend/src/features/modules/services/schedule-parser.service.ts).
* **Endpoint API:** `POST /api/v1/modules/import/schedules` ([`ModulesController`](../../backend/src/features/modules/modules.controller.ts)).
* **Componentes Frontend:** [`ScheduleDropzone.tsx`](../../frontend/src/features/modules/components/FileDropzone.tsx), [`ScheduleErrorsTable.tsx`](../../frontend/src/features/modules/components/ScheduleErrorsTable.tsx), [`SchedulesTablePreview.tsx`](../../frontend/src/features/modules/components/SchedulesTablePreview.tsx).

#### Estructura de Columnas Requerida:
1. `Fecha` (Tolerante a cabeceras que contengan `fecha`).
2. `Hora inicio` (Tolerante a: `hora inicio`, `hora de inicio`, `inicio`).
3. `Hora fin` (Tolerante a: `hora fin`, `hora de fin`, `fin`).

#### Reglas de Validación en Código:
* **Formato de Fecha:** Soporta objetos `Date` nativos de Excel, formato texto `DD/MM/YYYY`, `DD-MM-YYYY` y formato ISO `YYYY-MM-DD`. El servicio normaliza automáticamente la salida a `YYYY-MM-DD`.
* **Unicidad de Fecha (RN-04):** No se permiten dos filas con la misma fecha de clase dentro del archivo.
* **Formato de Hora:** Reloj de 24 horas `HH:mm` (o `HH:mm:ss`). Rango permitido: `00:00` a `23:59`.
* **Coherencia Cronológica:** Se valida estrictamente que `Hora inicio` < `Hora fin`.
* **Ordenación Automática:** Antes de responder, el servicio ordena todas las sesiones cronológicamente por `classDate` ascendente.
* **Horarios Informativos (RF-12):** En el flujo de negocio, el horario define la jornada de referencia; la marcación de asistencia del alumno queda habilitada durante todo el día de la fecha programada (de 00:00:00 a 23:59:59).

---

### 2.3 Vista Previa y Activación Transaccional (US-06 y US-07)

* **Historias de Usuario:**
  * `US-06` (*Vista Previa de Datos antes de Activar Módulo*).
  * `US-07` (*Activación de Nuevo Módulo con Archivado Histórico*).
* **Reglas de Negocio:** `RN-01` (Un solo módulo activo a la vez), `RN-08` (Conservación inmutable de módulos archivados).
* **Endpoint API:**
  * Vista Previa Dual: `POST /api/v1/modules/preview` (Recibe `studentsFile` y `schedulesFile` simultáneamente).
  * Activación Transaccional: `POST /api/v1/modules/activate` (Ejecuta `QueryRunner` con rollback ACID ante cualquier fallo).

---

### 2.4 Exportación y Matriz de Asistencias (US-13)

* **Historia de Usuario:** `US-13` (*Exportación de Asistencias a Excel*).
* **Requerimiento:** `RF-17` (Exportar reporte a Excel).
* **Archivo de Referencia Generado:** `06_plantilla_matriz_asistencias_referencia.xlsx`.
* **Características:**
  * Cabecera institucional con código de módulo y fecha de reporte.
  * Columnas fijas de Estudiante (Registro, Nombre, Correo).
  * Columnas dinámicas por cada fecha programada con estados `P` (Presente, verde) y `F` (Falta, rojo).
  * Columnas calculadas mediante fórmulas Excel: `=CONTAR.SI(D4:K4; "P")`, `=CONTAR.SI(D4:K4; "F")` y porcentaje `=L4/(L4+M4)`.

---

## 3. Guía Paso a Paso para Cargar Datos en el Sistema

### Paso 1: Importar Nómina de Estudiantes
1. Inicie sesión en el sistema como Administrador (`/admin/login`).
2. Diríjase a **Módulos > Configurar Módulo** o ingrese a `/admin/modulo/importar`.
3. Arrastre el archivo **`docs/plantilla_estudiantes.xlsx`** a la zona de carga (o seleccione `docs/plantillas_excel/01_plantilla_estudiantes_valida.xlsx`).
4. El sistema validará instantáneamente el archivo en memoria y mostrará la tabla de vista previa con los 25 alumnos listos.
5. Presione **"Continuar a Paso 2: Calendario y Horarios"**.

### Paso 2: Importar Calendario de Fechas y Horarios
1. En la pantalla `/admin/modulo/importar/fechas`, arrastre el archivo **`docs/plantilla_fechas_horarios.xlsx`** (o `docs/plantillas_excel/02_plantilla_fechas_horarios_valida.xlsx`).
2. El sistema validará la sintaxis de las fechas y horarios, ordenará las sesiones cronológicamente y mostrará el resumen de jornadas.
3. Presione **"Continuar a Paso 3: Vista Previa y Activación"**.

### Paso 3: Vista Previa Consolidada y Activación
1. En `/admin/modulo/preview`, complete el Nombre del Módulo (ej. *"Módulo 2: Infraestructura como Código"*) y Código (ej. *"DCID-V1E1-M2"*).
2. Verifique las tarjetas resumen (25 alumnos, 12 clases, fechas estimadas de inicio y fin).
3. Presione **"Activar Módulo Académico"** y confirme en el modal de advertencia.
4. El sistema archivará atómicamente el módulo anterior y activará el nuevo en una transacción PostgreSQL ACID.

---

## 4. Pruebas de Calidad (QA) con Archivos de Error

Para verificar que el sistema rechaza correctamente planillas defectuosas e informa al usuario exactamente dónde se encuentra el error:

1. **Prueba de Estudiantes con Errores:**
   * Archivo: `docs/plantillas_excel/03_plantilla_estudiantes_con_errores_prueba.xlsx`
   * Al subir este archivo, el sistema desplegará la tabla de errores detallada señalando:
     * Fila 4: Matrícula `1001` duplicada.
     * Fila 5: Número de registro vacío.
     * Fila 6: Nombre completo vacío.
     * Fila 7: Correo electrónico vacío.
     * Filas 8 y 9: Formatos de correo inválidos.
     * Fila 10: Matrícula `1002` duplicada.

2. **Prueba de Fechas con Errores:**
   * Archivo: `docs/plantillas_excel/04_plantilla_fechas_horarios_con_errores_prueba.xlsx`
   * Al subir este archivo, el sistema alertará sobre:
     * Fila 4: Fecha `19/10/2026` duplicada.
     * Fila 5: Hora fin anterior a hora inicio.
     * Fila 6: Hora de inicio con reloj inválido (`25:99`).
     * Fila 7: Hora fin no numérica.
     * Fila 8: Cadena de fecha no reconocida.
     * Filas 9 y 10: Celdas de fecha y hora vacías.

# Plantillas Oficiales de Excel para Carga Masiva

Este directorio contiene los archivos de hoja de cálculo (`.xlsx`) diseñados para la carga masiva y pruebas de validación del **Sistema Web de Registro y Control de Asistencia**.

---

## 📁 Archivos Disponibles

### 1. Plantillas Oficiales para Carga Válida (Producción y Pruebas Exitosas)
* **[`01_plantilla_estudiantes_valida.xlsx`](./01_plantilla_estudiantes_valida.xlsx)**
  * **Uso:** Asistente de importación de estudiantes (`/admin/modulo/importar`).
  * **Columnas:** `Número de registro`, `Nombre completo`, `Correo electrónico`.
  * **Contenido:** 25 estudiantes de postgrado con datos completos y matrículas únicas.
  * **Hoja adicional:** `Instrucciones` con especificaciones de tipos de datos y reglas de negocio.
  * *(Copia directa disponible en la raíz de documentación: [`../plantilla_estudiantes.xlsx`](../plantilla_estudiantes.xlsx))*

* **[`02_plantilla_fechas_horarios_valida.xlsx`](./02_plantilla_fechas_horarios_valida.xlsx)**
  * **Uso:** Asistente de calendario y cronograma de clases (`/admin/modulo/importar/fechas`).
  * **Columnas:** `Fecha`, `Hora inicio`, `Hora fin`.
  * **Contenido:** 12 sesiones de clase programadas en formato `DD/MM/YYYY` y `18:30` a `21:30`.
  * **Hoja adicional:** `Instrucciones` con requerimientos de formato y reloj de 24 horas.
  * *(Copia directa disponible en la raíz de documentación: [`../plantilla_fechas_horarios.xlsx`](../plantilla_fechas_horarios.xlsx))*

---

### 2. Plantillas de Pruebas con Casos de Error (QA / Testing)
* **[`03_plantilla_estudiantes_con_errores_prueba.xlsx`](./03_plantilla_estudiantes_con_errores_prueba.xlsx)**
  * **Uso:** Probar el manejo de errores del endpoint `POST /api/v1/modules/import/students` y la tabla `StudentErrorsTable.tsx`.
  * **Casos incluidos:**
    * Matrículas duplicadas (`RN-02`).
    * Campos obligatorios vacíos (nombre, registro o correo ausente).
    * Direcciones de correo electrónico con formato sintáctico inválido.
    * Columna explicativa con la justificación del error esperado en cada fila.

* **[`04_plantilla_fechas_horarios_con_errores_prueba.xlsx`](./04_plantilla_fechas_horarios_con_errores_prueba.xlsx)**
  * **Uso:** Probar el rechazo del endpoint `POST /api/v1/modules/import/schedules` y la tabla `ScheduleErrorsTable.tsx`.
  * **Casos incluidos:**
    * Fechas repetidas en el archivo (`RN-04`).
    * Hora de fin anterior o igual a la hora de inicio.
    * Formatos de reloj inválidos (ej. `25:99`).
    * Cadenas de fecha no interpretables.
    * Celdas obligatorias en blanco.

---

### 3. Libros Consolidados y Referencias
* **[`05_plantilla_carga_masiva_modulo_completo.xlsx`](./05_plantilla_carga_masiva_modulo_completo.xlsx)**
  * **Uso:** Libro maestro con 3 pestañas:
    1. `Información del Módulo`: Metadatos del curso (Nombre, Código, Docente, Modalidad).
    2. `Estudiantes`: Nómina completa de 30 estudiantes.
    3. `Fechas y Horarios`: Calendario oficial de 15 clases.

* **[`06_plantilla_matriz_asistencias_referencia.xlsx`](./06_plantilla_matriz_asistencias_referencia.xlsx)**
  * **Uso:** Simulación y formato oficial para la historia `US-13` (Exportación de Asistencias a Excel, `RF-17`).
  * **Características:**
    * Encabezado institucional completo.
    * Matriz de alumnos con marcas `P` (Presente en verde) y `F` (Falta en rojo).
    * Columnas de resumen con fórmulas activas: `CONTAR.SI(...)` para presentes y faltas, y cálculo automático de porcentaje de asistencia.

---

> Para consultar la guía completa con diagramas de flujo y detalle de las Historias de Usuario, revise el documento principal: **[`../GUIA_CARGA_EXCEL.md`](../GUIA_CARGA_EXCEL.md)**.

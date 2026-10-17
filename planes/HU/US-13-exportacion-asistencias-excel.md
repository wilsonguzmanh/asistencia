# Plan Técnico de Implementación: US-13 - Exportación de Asistencias a Excel

Este documento define el plan de desarrollo técnico detallado para la historia **US-13**, asignada al **Programador 2 (Fase 2)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-13` |
| **Título** | Exportación de Asistencias a Excel |
| **Rol** | Administrador |
| **Requerimientos Funcionales** | `RF-17` (*Exportar a Excel las asistencias del módulo activo*) |
| **Reglas de Negocio** | Exportación exclusiva de la nómina y registros del módulo con estado `ACTIVE` |
| **Estimación** | 3 Story Points |
| **Prioridad** | Could Have (Funcionalidad opcional) |
| **Rama sugerida** | `feature/US-13-export-attendances-excel` |

---

## 2. Alcance y Objetivos Técnicos

El Administrador debe poder descargar un archivo de hoja de cálculo en formato `.xlsx` con la planilla completa de asistencias del módulo académico actualmente activo:
1. **Estructura de la Matriz en Excel:**
   * **Encabezado institucional:** Nombre del módulo, código, fecha de descarga y total de matriculados.
   * **Columnas de Estudiante:** Número de registro, Nombre completo y Correo electrónico.
   * **Columnas de Clases:** Una columna por cada fecha programada en el calendario (`DD/MM/YYYY`), con el valor `"P"` para Presente o `"F"` para Falta.
   * **Columnas de Resumen:** Total de Presentes, Total de Faltas y Porcentaje de Asistencia (`%`).
2. Estilos visuales en Excel (mediante la librería `exceljs`): cabeceras coloreadas, bordes en las celdas, auto-ancho de columnas y alineación centrada para las marcas.
3. El archivo debe transmitirse como un flujo binario `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` con `Content-Disposition: attachment; filename="asistencias_[codigo]_[fecha].xlsx"`.
4. Registro de auditoría con acción `EXPORT_ATTENDANCES`.

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/attendances/
│   ├── services/
│   │   └── attendance-export.service.ts     # Generador del workbook con exceljs
│   ├── attendances.controller.ts            # Endpoint GET /api/v1/attendances/export/excel
│   └── attendance-export.service.spec.ts    # Pruebas unitarias de generación de buffer Excel

frontend/src/
├── features/attendances/
│   ├── components/
│   │   └── ExportExcelButton.tsx            # Botón con spinner de descarga y trigger de blob
│   └── services/
│       └── attendance-admin.service.ts      # Descarga binaria con token administrativo
```

---

## 4. Especificación del Backend (NestJS + exceljs)

### 4.1 Endpoint de Descarga
* **Ruta:** `GET /api/v1/attendances/export/excel`
* **Método:** `GET`
* **Autenticación:** `@UseGuards(JwtAuthGuard, RolesGuard)` con `@Roles(UserRole.ADMIN)`
* **Respuesta HTTP:**
  * Headers:
    * `Content-Type`: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    * `Content-Disposition`: `attachment; filename="asistencias_DCID-M2_2026-10-13.xlsx"`
* **Lógica del Servicio:**
  ```typescript
  async generateAttendancesExcelBuffer(): Promise<{ buffer: Buffer; filename: string }> {
    const activeModule = await this.getActiveModuleWithStudentsAndSchedules();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Planilla de Asistencia');

    // Construcción de encabezados y matriz de datos
    // ...
    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer: Buffer.from(buffer), filename: `asistencias_${activeModule.code}.xlsx` };
  }
  ```

---

## 5. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Descarga exitosa de la planilla de asistencia en Excel
  Dado que existe un módulo activo con 30 estudiantes y 10 sesiones de clase
  Cuando el administrador hace clic en "Descargar Excel de Asistencias"
  Entonces el backend procesa los registros y envía un archivo binario ".xlsx"
  Y el navegador descarga un archivo válido que puede abrirse en Microsoft Excel o LibreOffice
  Y el archivo contiene la matriz de alumnos y fechas con totales de asistencias.

Escenario: Módulo sin asistencias o sin estudiantes
  Dado que el módulo activo fue recién creado y no tiene registros
  Cuando se solicita la exportación
  Entonces el archivo se genera con la nómina de estudiantes y las columnas de fecha con celdas vacías o indicando "Pendiente"
  Y no produce errores de ejecución 500.
```

---

## 6. Checklist de Implementación para Programador 2

- [ ] **Paso 1:** Instalar o verificar dependencias de `exceljs` en el backend.
- [ ] **Paso 2:** Implementar `AttendanceExportService` construyendo el layout de la planilla Excel.
- [ ] **Paso 3:** Exponer endpoint `GET /api/v1/attendances/export/excel` con Response stream/buffer.
- [ ] **Paso 4:** Registrar evento `EXPORT_ATTENDANCES` en la bitácora de auditoría.
- [ ] **Paso 5:** Desarrollar componente `ExportExcelButton.tsx` en Next.js.
- [ ] **Paso 6:** Integrar botón en la pantalla de asistencias (`/admin/asistencias`).
- [ ] **Paso 7:** Pruebas unitarias de generación de buffer en Jest.

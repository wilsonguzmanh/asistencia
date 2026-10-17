# Plan Técnico de Implementación: US-04 - Importación y Validación de Estudiantes vía Excel

Este documento define el plan de desarrollo técnico para la historia **US-04**, asignada al **Programador 1 (Fase 1)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-04` |
| **Título** | Importación y Validación de Lista de Estudiantes vía Excel |
| **Rol** | Administrador |
| **Requerimientos Funcionales** | `RF-11` (*Importar estudiantes*), `RF-18` (*Mensajes de error y confirmación*) |
| **Reglas de Negocio** | `RN-02` (*Número de registro único entre estudiantes del módulo activo*) |
| **Estimación** | 5 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-04-excel-students-import` |

---

## 2. Formato Esperado del Archivo Excel

El archivo debe coincidir exactamente con el ejemplo del documento de requerimientos funcionales:

| Número de registro | Nombre completo | Correo electrónico |
| :--- | :--- | :--- |
| 1001 | Juan Pérez | juan@gmail.com |
| 1002 | María López | maria@gmail.com |

### Reglas de Validación Estricta:
1. **Campos obligatorios:** Ninguna celda de estas 3 columnas puede estar vacía o contener solo espacios.
2. **Formato de email:** Debe ser un correo sintácticamente válido (regex estándar o validador).
3. **Unicidad en el archivo (RN-02):** No se permiten dos filas con el mismo `Número de registro`.
4. **Desglose de errores:** Si el archivo tiene fallos, el backend **no guarda datos parciales** y reporta exactamente en qué fila ocurrió el fallo y el motivo.

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/modules/
│   ├── dto/
│   │   ├── student-row.dto.ts               # DTO que representa una fila validada
│   │   └── import-validation-result.dto.ts  # DTO con lista de filas válidas o errores
│   ├── exceptions/
│   │   └── invalid-excel.exception.ts       # Extiende AppBusinessException (422)
│   ├── services/
│   │   └── excel-parser.service.ts          # Servicio de lectura de buffers .xlsx con exceljs
│   ├── modules.controller.ts                # Endpoint POST /api/v1/modules/import/students
│   └── modules.module.ts                    # Registro de servicios y Multer

frontend/src/
├── app/
│   └── admin/
│       └── modulo/
│           └── importar/
│               └── page.tsx                 # Vista contenedora del wizard de importación
├── features/modules/
│   ├── components/
│   │   ├── FileDropzone.tsx                 # Drag-and-drop para archivos .xlsx
│   │   ├── StudentErrorsTable.tsx           # Tabla que lista fila, campo y descripción del error
│   │   └── StudentsTablePreview.tsx         # Tabla que muestra filas válidas
│   └── services/
│       └── module-import.service.ts         # Llamada HTTP con FormData al endpoint
```

---

## 4. Especificación del Backend (NestJS)

### 4.1 Dependencias Necesarias
Instalar en `backend`:
```bash
npm install exceljs
npm install -D @types/multer
```

### 4.2 DTOs de Dominio
#### `student-row.dto.ts`
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class StudentRowDto {
  @ApiProperty({ example: '1001' })
  @IsString()
  @IsNotEmpty({ message: 'El número de registro es obligatorio' })
  registrationNumber: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  fullName: string;

  @ApiProperty({ example: 'juan@gmail.com' })
  @IsEmail({}, { message: 'El formato de correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({ example: 2, description: 'Número de fila original en el Excel' })
  rowNumber: number;
}
```

#### `import-validation-result.dto.ts`
```typescript
export interface RowValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export class StudentImportValidationResultDto {
  totalRows: number;
  validRowsCount: number;
  errorCount: number;
  hasErrors: boolean;
  errors: RowValidationError[];
  data: StudentRowDto[];
}
```

### 4.3 Servicio de Parseo (`excel-parser.service.ts`)
1. Recibir `file.buffer`.
2. Instanciar `Workbook` de `exceljs` y cargar el buffer con `workbook.xlsx.load(buffer)`.
3. Obtener la primera hoja de trabajo (`worksheets[0]`).
4. Validar nombres de encabezados en la fila 1 (case-insensitive y tolerante a tildes):
   * `número de registro` / `numero de registro` / `registro`
   * `nombre completo` / `nombre`
   * `correo electrónico` / `correo electronico` / `email`
5. Recorrer las filas a partir de la fila 2:
   * Mantener un `Set<string>` con los números de registro ya procesados para detectar duplicados (**RN-02**).
   * Validar campos obligatorios y formato de correo electrónico.
   * Acumular errores en un arreglo `errors: RowValidationError[]`.
6. Si existen errores, retornar el resultado con `hasErrors: true` y la lista de errores detallados.
7. Si no hay errores, retornar `hasErrors: false` y el arreglo de `data: StudentRowDto[]`.

### 4.4 Controlador y Swagger (`modules.controller.ts`)
* **Ruta:** `POST /api/v1/modules/import/students`
* **Método:** `POST` con `multipart/form-data`
* **Interceptors:** `@UseInterceptors(FileInterceptor('file'))`
* **Swagger Tag:** `Modules`
* **Respuestas:**
  * `200 OK`: Archivo procesado con éxito (incluye listado válido o lista de errores de validación).
  * `400 Bad Request`: Archivo faltante o formato incorrecto (no es `.xlsx`).

```json
// Respuesta ante archivo con errores (RF-11)
{
  "status": "fail",
  "code": "EXCEL_VALIDATION_ERROR",
  "message": "Se encontraron errores en el archivo Excel de estudiantes",
  "data": {
    "totalRows": 15,
    "validRowsCount": 13,
    "errorCount": 2,
    "hasErrors": true,
    "errors": [
      {
        "row": 4,
        "field": "registrationNumber",
        "value": "1001",
        "message": "El número de registro '1001' se encuentra duplicado (ya presente en fila 2)"
      },
      {
        "row": 8,
        "field": "email",
        "value": "correo-invalido",
        "message": "El formato de correo electrónico no es válido"
      }
    ],
    "data": []
  }
}
```

---

## 5. Especificación del Frontend (Next.js)

### 5.1 Componente Drag & Drop (`FileDropzone.tsx`)
* Acepta únicamente archivos con extensión `.xlsx` y `.xls`.
* Muestra el nombre del archivo seleccionado y su tamaño en KB.
* Botón *"Procesar y Validar Estudiantes"*.

### 5.2 Tabla de Errores Detallada (`StudentErrorsTable.tsx`)
* Se muestra si el servidor retorna `hasErrors: true`.
* Banner de alerta rojo: *"Corrige los 2 errores detectados en tu archivo antes de continuar"*.
* Columnas de la tabla:
  * **Fila:** Número de fila en el Excel (ej. `Fila 4`).
  * **Campo Afectado:** (ej. `Número de registro`).
  * **Valor Detectado:** (ej. `1001`).
  * **Detalle del Error:** (ej. `Registro duplicado`).

### 5.3 Tabla de Vista Previa Aprobada (`StudentsTablePreview.tsx`)
* Se muestra con un check verde si el archivo es válido al 100%.
* Muestra el total de estudiantes detectados y una tabla paginada con sus datos.

---

## 6. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Archivo con duplicidad de matrícula rechaza la importación
  Dado que el administrador sube un archivo Excel donde las filas 2 y 5 tienen la matrícula "1001"
  Cuando el endpoint procesa el archivo
  Entonces el sistema responde con "code": "EXCEL_VALIDATION_ERROR"
  Y señala que en la fila 5 la matrícula "1001" ya existe.

Escenario: Archivo correcto genera nómina lista para previsualización
  Dado un archivo Excel con 25 filas válidas y sin duplicados
  Cuando el backend procesa el archivo
  Entonces retorna "hasErrors": false, "validRowsCount": 25
  Y la lista de los 25 estudiantes ordenados listos para asociarse al módulo.
```

---

## 7. Checklist de Implementación para Programador 1

- [ ] **Paso 1:** Instalar `exceljs` en el backend.
- [ ] **Paso 2:** Crear `excel-parser.service.ts` con lectura de buffers y validación de columnas.
- [ ] **Paso 3:** Implementar algoritmo de unicidad O(N) con `Set` para matrículas duplicadas (**RN-02**).
- [ ] **Paso 4:** Crear endpoint `POST /api/v1/modules/import/students` con `FileInterceptor`.
- [ ] **Paso 5:** Probar con archivos de prueba en Swagger UI (`/api/docs`).
- [ ] **Paso 6:** Crear el componente UI de subida y visualización de errores en Next.js.
- [ ] **Paso 7:** Validar mensajes de error claros e informativos (**RF-18**).

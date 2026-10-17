# Historias de Usuario - Sistema Web de Registro y Control de Asistencia

Este documento recopila las historias de usuario detalladas para el desarrollo del **Sistema Web de Registro y Control de Asistencia**, elaboradas con base en los requerimientos funcionales (**RF-01 a RF-18**) y reglas de negocio (**RN-01 a RN-08**).

Cada historia incluye su narrativa formal, criterios de aceptación en formato BDD (*Given-When-Then*), especificaciones técnicas de frontend/backend/base de datos, estimación y dependencias.

---

## Índice de Historias de Usuario

| ID | Épica | Título | Requerimiento(s) | Prioridad | Puntos |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **US-01** | Autenticación y Acceso | Acceso de Administrador con Credenciales Propias | RF-02 | Must Have | 3 |
| **US-02** | Autenticación y Acceso | Acceso de Estudiantes al Módulo Activo | RF-01 | Must Have | 3 |
| **US-03** | Autenticación y Acceso | Cierre de Sesión y Control de Acceso por Roles | RF-02 | Must Have | 2 |
| **US-04** | Configuración de Módulo | Importación y Validación de Estudiantes vía Excel | RF-11, RN-02, RF-18 | Must Have | 5 |
| **US-05** | Configuración de Módulo | Importación de Fechas y Horarios de Clase vía Excel | RF-12, RF-18 | Must Have | 5 |
| **US-06** | Configuración de Módulo | Vista Previa de Datos antes de Activar Módulo | RF-16, RF-18 | Should Have | 3 |
| **US-07** | Configuración de Módulo | Activación de Nuevo Módulo con Archivado Histórico | RF-13, RF-14, RF-15, RN-01, RN-08 | Must Have | 5 |
| **US-08** | Registro de Asistencia | Marcación de Asistencia en Día de Clase Programada | RF-03, RN-03, RN-04, RF-18 | Must Have | 5 |
| **US-09** | Registro de Asistencia | Consulta de Historial Personal y Faltas del Estudiante | RF-04, RF-05, RN-05 | Must Have | 5 |
| **US-10** | Gestión de Asistencias | Consulta y Búsqueda de Estudiantes del Módulo Activo | RF-06 | Must Have | 3 |
| **US-11** | Gestión de Asistencias | Vista General y Matriz de Asistencias con Totales | RF-08 | Must Have | 5 |
| **US-12** | Gestión de Asistencias | Modificación Administrativa de Asistencias con Auditoría | RF-07, RN-06, RN-07, RF-18 | Must Have | 5 |
| **US-13** | Gestión de Asistencias | Exportación de Asistencias a Excel | RF-17 | Could Have | 3 |
| **US-14** | Auditoría y Trazabilidad | Registro Centralizado de Actividades y Auditoría | RF-09, RN-07 | Must Have | 5 |
| **US-15** | Auditoría y Trazabilidad | Consulta y Filtrado del Historial de Actividades | RF-10 | Should Have | 3 |

---

## Épica 1: Autenticación y Control de Acceso

---

### US-01: Acceso de Administrador con Credenciales Propias

* **ID:** `US-01`
* **Requerimiento(s):** `RF-02`
* **Rol:** Administrador
* **Prioridad:** Must Have | **Estimación:** 3 Story Points
* **Dependencias directas:** Ninguna (Historia fundacional)

#### Narrativa
> **Como** Administrador del sistema  
> **Quiero** iniciar sesión utilizando mi nombre de usuario o correo electrónico y contraseña  
> **Para** acceder de forma segura a las funciones de administración y configuración del módulo activo.

#### Contexto y Alcance
El administrador cuenta con una cuenta precargada o aprovisionada en el sistema. Debe autenticarse mediante credenciales para recibir un token JWT que proteja las rutas administrativas.

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Inicio de sesión exitoso del administrador
  Dado que el usuario administrador se encuentra en la pantalla de acceso administrativo ("/admin/login")
  Cuando ingresa credenciales válidas (correo/usuario y contraseña correcta)
  Y presiona el botón "Iniciar Sesión"
  Entonces el sistema emite un token JWT de acceso
  Y redirige al administrador al panel principal administrativo ("/admin/dashboard")
  Y muestra un mensaje de bienvenida.

Escenario: Intento de inicio de sesión con credenciales inválidas
  Dado que el usuario se encuentra en la pantalla de acceso administrativo
  Cuando ingresa un usuario inexistente o una contraseña incorrecta
  Y presiona el botón "Iniciar Sesión"
  Entonces el sistema rechaza la petición con código HTTP 401 Unauthorized
  Y muestra un mensaje de error claro: "Credenciales de acceso incorrectas"
  Y no permite el acceso a ninguna ruta administrativa.

Escenario: Bloqueo de campos obligatorios en el formulario
  Dado que el formulario de login administrativo está vacío
  Cuando el usuario intenta enviar el formulario sin completar los campos
  Entonces el cliente valida localmente y resalta en rojo los campos obligatorios
  Y no despacha la petición al servidor.
```

#### Consideraciones Técnicas
* **Frontend:**
  * Ruta: `/admin/login`
  * Formulario con React Hook Form / Zod validando usuario y contraseña no vacíos.
  * Almacenamiento seguro del token JWT en HTTP-Only Cookie o sesión de cliente.
* **Backend:**
  * Endpoint: `POST /api/v1/auth/admin/login`
  * Body: `{ identifier: string, password: string }`
  * Validador: `AdminLoginDto` con `class-validator`.
  * Verificación de hash con `bcrypt.compare`.
  * Generación de JWT con payload `{ sub: user.id, role: 'ADMIN', email: user.email }`.
  * Respuesta estándar: `{ success: true, data: { token: string, user: { ... } } }`.

---

### US-02: Acceso de Estudiantes al Módulo Activo

* **ID:** `US-02`
* **Requerimiento(s):** `RF-01`
* **Rol:** Estudiante
* **Prioridad:** Must Have | **Estimación:** 3 Story Points
* **Dependencias directas:** `US-07` (Debe existir un módulo activo con estudiantes cargados)

#### Narrativa
> **Como** Estudiante inscrito en el módulo activo  
> **Quiero** ingresar al sistema digitando mi correo electrónico o mi número de registro  
> **Para** acceder rápidamente a mi panel de estudiante sin necesidad de recordar contraseñas complejas.

#### Contexto y Alcance
El acceso para estudiantes no requiere contraseña, de acuerdo con **RF-01**. El estudiante ingresa identificándose por su `correo` o `número de registro`. El sistema valida que pertenezca a la lista del **módulo activo**. Si pertenece, se le genera una sesión de estudiante.

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Ingreso exitoso de estudiante por correo electrónico
  Dado que existe un módulo académico activo
  Y existe un estudiante registrado en dicho módulo con el correo "juan@gmail.com"
  Cuando el estudiante ingresa a "/" o "/estudiante/login"
  Y escribe "juan@gmail.com" y pulsa "Ingresar"
  Entonces el sistema valida la existencia del estudiante en el módulo activo
  Y crea una sesión autenticada con rol "STUDENT"
  Y lo redirige a su panel de marcación e historial ("/estudiante/asistencia").

Escenario: Ingreso exitoso de estudiante por número de registro
  Dado que existe un estudiante registrado en el módulo activo con registro "1001"
  Cuando escribe "1001" en el campo de identificación y pulsa "Ingresar"
  Entonces el sistema valida la matrícula y concede acceso a su panel personal.

Escenario: Estudiante no encontrado o perteneciente a módulo inactivo
  Dado que un usuario ingresa un número de registro o correo que no está en el módulo activo
  Cuando pulsa "Ingresar"
  Entonces el sistema retorna un código HTTP 404/403 con mensaje de error: "Estudiante no registrado en el módulo académico activo actual"
  Y permanece en la pantalla de inicio sin otorgar acceso.
```

#### Consideraciones Técnicas
* **Frontend:**
  * Ruta principal: `/` o `/estudiante/login`
  * Campo único: `identifier` (acepta correo o número de registro).
* **Backend:**
  * Endpoint: `POST /api/v1/auth/student/login`
  * Body: `{ identifier: string }`
  * Consulta TypeORM:
    ```sql
    SELECT s.* FROM students s
    INNER JOIN academic_modules m ON m.id = s.module_id
    WHERE m.status = 'ACTIVE' 
      AND (s.email ILIKE :id OR s.registration_number = :id)
      AND s.deleted_at IS NULL
    ```
  * Emisión de token JWT ligero con `{ sub: student.id, role: 'STUDENT', moduleId: module.id, registrationNumber: student.registrationNumber }`.

---

### US-03: Cierre de Sesión y Control de Acceso por Roles

* **ID:** `US-03`
* **Requerimiento(s):** `RF-02`
* **Rol:** Administrador / Estudiante
* **Prioridad:** Must Have | **Estimación:** 2 Story Points
* **Dependencias directas:** `US-01`, `US-02`

#### Narrativa
> **Como** Usuario autenticado (Administrador o Estudiante)  
> **Quiero** poder cerrar mi sesión activa y tener mis rutas protegidas  
> **Para** evitar que personas no autorizadas manipulen mis registros o accedan a funciones que no les corresponden.

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Cierre de sesión voluntario
  Dado que un administrador o estudiante tiene sesión abierta
  Cuando hace clic en la opción "Cerrar Sesión"
  Entonces el sistema invalida la sesión local, elimina el token
  Y redirige al usuario a la página de inicio correspondiente.

Escenario: Intento de estudiante de acceder a rutas administrativas
  Dado que un estudiante con sesión activa intenta navegar a "/admin/asistencias"
  Cuando el router o backend evalúa la petición
  Entonces el sistema deniega el acceso con 403 Forbidden y redirige a su vista de estudiante.

Escenario: Intento de usuario anónimo de acceder a rutas protegidas
  Dado que un usuario no autenticado intenta acceder a cualquier endpoint o página protegida
  Cuando se envía la solicitud
  Entonces es interceptada por el Guard de autenticación y es redirigido al login.
```

#### Consideraciones Técnicas
* **Frontend:** Middleware de Next.js (`middleware.ts`) que inspecciona el token JWT en las cookies y verifica rutas `/admin/*` vs `/estudiante/*`.
* **Backend:** `JwtAuthGuard` y `RolesGuard` aplicados globalmente mediante `@Roles(UserRole.ADMIN)` o `@Roles(UserRole.STUDENT)`.

---

## Épica 2: Carga de Datos y Configuración del Módulo Académico

---

### US-04: Importación y Validación de Estudiantes vía Excel

* **ID:** `US-04`
* **Requerimiento(s):** `RF-11`, `RN-02`, `RF-18`
* **Rol:** Administrador
* **Prioridad:** Must Have | **Estimación:** 5 Story Points
* **Dependencias directas:** `US-01`

#### Narrativa
> **Como** Administrador del sistema  
> **Quiero** subir un archivo Excel con la lista de estudiantes (número de registro, nombre completo y correo electrónico)  
> **Para** cargar la nómina de alumnos del módulo académico con validación exhaustiva de errores y duplicados.

#### Contexto y Alcance
El archivo Excel debe respetar las columnas especificadas en el requerimiento:
* `Número de registro` (Obligatorio, texto/numérico)
* `Nombre completo` (Obligatorio, texto)
* `Correo electrónico` (Obligatorio, formato de correo válido)

Se debe validar la unicidad del número de registro dentro del archivo (**RN-02**), campos faltantes o formato de email incorrecto. Si hay errores, se debe retornar el desglose exacto de filas con fallos (**RF-11**).

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Carga exitosa de archivo Excel de estudiantes sin errores
  Dado que el administrador está en el asistente de carga de módulo ("/admin/modulo/importar")
  Cuando sube un archivo Excel válido con 30 estudiantes con datos completos y registros únicos
  Entonces el sistema procesa el archivo, valida la estructura
  Y retorna el total de 30 registros válidos listos para previsualización.

Escenario: Rechazo por registros duplicados dentro del archivo
  Dado que el archivo Excel contiene dos filas con el mismo "Número de registro" (ej. fila 4 y fila 12 con registro "1001")
  Cuando el administrador sube el archivo
  Entonces el sistema detiene el proceso con código 422 Unprocessable Entity
  Y muestra un mensaje de error explícito: "Error en fila 12: El número de registro '1001' se encuentra duplicado (ya presente en fila 4)".

Escenario: Filas con datos obligatorios incompletos o correo mal formado
  Dado que el archivo tiene la fila 5 sin nombre y la fila 8 con correo "juan-sin-arroba"
  Cuando el administrador procesa el archivo
  Entonces el sistema lista todos los errores encontrados por número de fila y columna afectada para que el usuario pueda corregirlos.
```

#### Consideraciones Técnicas
* **Frontend:**
  * Componente drag-and-drop para archivos `.xlsx`, `.xls`.
  * Barra de progreso y tabla de visualización de errores detallados.
* **Backend:**
  * Endpoint: `POST /api/v1/modules/import/students`
  * Utilidad: `xlsx` o `exceljs` para parseo en memoria.
  * Validador por fila con `class-validator` y `Set<string>` para detección de duplicados en tiempo O(N).

---

### US-05: Importación de Fechas y Horarios de Clase vía Excel

* **ID:** `US-05`
* **Requerimiento(s):** `RF-12`, `RF-18`
* **Rol:** Administrador
* **Prioridad:** Must Have | **Estimación:** 5 Story Points
* **Dependencias directas:** `US-01`

#### Narrativa
> **Como** Administrador del sistema  
> **Quiero** subir un archivo Excel con las fechas y horarios de clase (Fecha, Hora inicio, Hora fin)  
> **Para** programar el calendario de días habilitados para la marcación de asistencia.

#### Contexto y Alcance
Columnas del Excel según especificación:
* `Fecha` (Obligatoria, formato `DD/MM/YYYY`)
* `Hora inicio` (Obligatoria, informativo, formato `HH:mm`)
* `Hora fin` (Obligatoria, informativo, formato `HH:mm`)

Las fechas determinan los días en que el estudiante podrá marcar (**RF-12**). Los horarios son informativos en esta versión. No debe haber fechas duplicadas en el archivo.

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Carga exitosa del calendario de clases
  Dado que el administrador sube un archivo Excel con 10 fechas de clase válidas
  Cuando el sistema analiza el archivo
  Entonces valida el formato de las fechas y horarios
  Y retorna las 10 sesiones programadas ordenadas cronológicamente.

Escenario: Detección de fechas duplicadas o con formato inválido
  Dado que el archivo contiene dos filas con la fecha "05/10/2026"
  Cuando se procesa el archivo
  Entonces el sistema rechaza la importación señalando: "Error: La fecha 05/10/2026 aparece más de una vez en el archivo".
```

#### Consideraciones Técnicas
* **Backend:**
  * Endpoint: `POST /api/v1/modules/import/schedules`
  * Validador de fechas normalizado a UTC a medianoche (`YYYY-MM-DD`).
  * Validación de que `Hora inicio` < `Hora fin`.

---

### US-06: Vista Previa de Datos antes de Activar Módulo

* **ID:** `US-06`
* **Requerimiento(s):** `RF-16`, `RF-18`
* **Rol:** Administrador
* **Prioridad:** Should Have | **Estimación:** 3 Story Points
* **Dependencias directas:** `US-04`, `US-05`

#### Narrativa
> **Como** Administrador del sistema  
> **Quiero** visualizar una vista previa consolidada de los estudiantes y fechas importadas antes de confirmar la activación  
> **Para** verificar que la información sea exacta y evitar errores antes de reemplazar el módulo activo.

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Visualización de la vista previa consolidada
  Dado que el administrador ha cargado exitosamente los archivos de estudiantes y fechas
  Cuando hace clic en "Revisar datos"
  Entonces el sistema muestra un panel con dos pestañas o tablas:
    - Lista de estudiantes (total de estudiantes detectados, registro, nombre, correo).
    - Calendario de clases (total de clases, fechas y rangos horarios).
  Y el botón "Activar Nuevo Módulo" permanece disponible.
```

---

### US-07: Activación de Nuevo Módulo con Archivado Histórico

* **ID:** `US-07`
* **Requerimiento(s):** `RF-13`, `RF-14`, `RF-15`, `RN-01`, `RN-08`
* **Rol:** Administrador
* **Prioridad:** Must Have | **Estimación:** 5 Story Points
* **Dependencias directas:** `US-04`, `US-05`, `US-06`

#### Narrativa
> **Como** Administrador del sistema  
> **Quiero** confirmar la activación del nuevo módulo académico con sus estudiantes y fechas  
> **Para** iniciar un nuevo ciclo de asistencias en limpio, archivando el módulo anterior en la base de datos sin borrar sus datos históricos.

#### Contexto y Alcance
Cumplimiento estricto de **RN-01** (solo un módulo activo a la vez) y **RN-08 / RF-15** (no se borran datos, se asocian al módulo que finaliza). El sistema debe solicitar confirmación explícita del administrador (**RF-13**).

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Confirmación y activación exitosa de nuevo módulo
  Dado que el administrador revisa la vista previa y pulsa "Activar Módulo"
  Cuando el sistema despliega el modal de confirmación con advertencia: "¿Está seguro de activar este módulo? El módulo actual pasará a estado inactivo"
  Y el administrador confirma la acción
  Entonces el sistema inicia una transacción de base de datos que:
    1. Cambia el estado del módulo activo anterior a "INACTIVE".
    2. Crea el nuevo registro "AcademicModule" con estado "ACTIVE".
    3. Asocia y guarda todos los estudiantes importados vinculados al nuevo ID de módulo.
    4. Asocia y guarda todas las fechas de clase vinculadas al nuevo ID de módulo.
    5. Registra el evento en el log de actividades.
  Y responde con éxito redirigiendo al dashboard del nuevo módulo.

Escenario: Mantenimiento de integridad histórica (RN-08)
  Dado que se completó la activación de un nuevo módulo
  Cuando se consulta la base de datos
  Entonces todos los estudiantes, clases y asistencias del módulo anterior siguen existiendo intactos con su respectivo "module_id".
```

#### Consideraciones Técnicas
* **Backend:**
  * Endpoint: `POST /api/v1/modules/activate`
  * Uso obligatorio de `QueryRunner` de TypeORM para garantizar atomicidad ACID.
  * Disparar evento de auditoría en `ActivityLogService`.

---

## Épica 3: Registro y Consulta de Asistencia por Estudiantes

---

### US-08: Marcación de Asistencia en Día de Clase Programada

* **ID:** `US-08`
* **Requerimiento(s):** `RF-03`, `RN-03`, `RN-04`, `RF-18`
* **Rol:** Estudiante
* **Prioridad:** Must Have | **Estimación:** 5 Story Points
* **Dependencias directas:** `US-02`, `US-07`

#### Narrativa
> **Como** Estudiante del módulo activo  
> **Quiero** presionar un botón de marcación cuando sea un día de clase programado  
> **Para** registrar mi asistencia con la fecha y hora reales de manera confiable.

#### Contexto y Alcance
* La marcación se realiza mediante un botón en la interfaz del estudiante.
* El botón **solo está habilitado si la fecha actual del servidor coincide con una fecha de clase programada** (**RN-04**).
* Solo se permite **una marca por estudiante y fecha** (**RN-03**).
* Fuera de la fecha programada, el botón está deshabilitado con un mensaje informativo explicativo (**RF-03**).
* Guarda la marca de tiempo exacta del servidor (UTC) (**RF-03**).

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Marcación exitosa en día de clase programado
  Dado que hoy es "05/10/2026" y dicha fecha está registrada en el calendario del módulo activo
  Y el estudiante no ha marcado asistencia el día de hoy
  Cuando el estudiante ingresa a su pantalla principal
  Entonces el botón "Registrar Asistencia de Hoy" se muestra activo y habilitado
  Cuando hace clic en el botón
  Entonces el sistema registra su estado como "PRESENTE" con la hora real actual del servidor
  Y emite el mensaje: "¡Asistencia registrada correctamente a las [HH:mm:ss]!"
  Y el botón cambia inmediatamente a estado deshabilitado con la etiqueta "Asistencia Ya Marcada (Presente)".

Escenario: Intento de doble marcación (Prevenir duplicidad - RN-03)
  Dado que el estudiante ya registró su asistencia hoy
  Cuando intenta presionar el botón o envía una segunda petición HTTP directa
  Entonces el backend rechaza la solicitud con código 409 Conflict o 400 Bad Request
  Y mantiene el registro previo inalterado.

Escenario: Ingreso en un día sin clase programada (RN-04)
  Dado que la fecha actual no coincide con ninguna fecha del calendario de clases
  Cuando el estudiante ingresa al sistema
  Entonces el botón se encuentra completamente deshabilitado con el mensaje: "Hoy no hay clase programada. Próxima clase: [Fecha]".
```

#### Consideraciones Técnicas
* **Frontend:**
  * Ruta: `/estudiante/asistencia`
  * Botón interactivo con estado: `HABILITADO`, `DESHABILITADO_SIN_CLASE`, `YA_REGISTRADO`, `CARGANDO`.
  * Confirmación visual con Toast o Alert informativo (**RF-18**).
* **Backend:**
  * Endpoint: `POST /api/v1/attendances/check-in`
  * Extrae `studentId` del token JWT (`@CurrentUser`).
  * Consulta si `CURRENT_DATE` coincide con `class_date` del módulo activo.
  * Inserción con control de clave única `(student_id, class_schedule_id)`.
  * Emite registro al log de auditoría (**RF-09**).

---

### US-09: Consulta de Historial Personal y Resumen del Estudiante

* **ID:** `US-09`
* **Requerimiento(s):** `RF-04`, `RF-05`, `RN-05`
* **Rol:** Estudiante
* **Prioridad:** Must Have | **Estimación:** 5 Story Points
* **Dependencias directas:** `US-08`

#### Narrativa
> **Como** Estudiante del módulo activo  
> **Quiero** consultar la lista de todas las fechas de clase de mi módulo con su estado (Presente o Falta) y la hora de marca  
> **Para** conocer mi porcentaje de asistencia y el detalle de mis asistencias y ausencias.

#### Contexto y Alcance
* Fechas pasadas sin marca se reflejan automáticamente como **Falta** (**RN-05**, **RF-04**).
* El estudiante no puede alterar registros pasados (**RF-04**).
* Se muestra tarjeta de resumen: Total de clases del módulo, Clases transcurridas, Asistencias registradas, Faltas acumuladas y Porcentaje de asistencia (**RF-05**).

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Visualización del historial y resumen personal
  Dado que han transcurrido 3 fechas de clase del módulo
  Y el estudiante marcó en 2 fechas y no marcó en 1 fecha
  Cuando el estudiante visualiza su panel de asistencia
  Entonces observa una tabla con las 3 fechas transcurridas:
    - 2 fechas con estado "Presente" y la hora en que marcó.
    - 1 fecha con estado "Falta" (sin hora de marca).
  Y observa un resumen superior con:
    - Total de clases transcurridas: 3
    - Presentes: 2
    - Faltas: 1
    - % Asistencia: 66.7%
  Y observa las fechas futuras marcadas como "Pendiente / Programada".
```

#### Consideraciones Técnicas
* **Backend:**
  * Endpoint: `GET /api/v1/attendances/my-history`
  * Cruce de `ClassSchedule` del módulo activo con `Attendance` del estudiante.
  * Lógica condicional: si `classDate < today` y no hay asistencia registrada -> retornar status `FALTA`.

---

## Épica 4: Administración y Modificación de Asistencias

---

### US-10: Consulta y Búsqueda de Estudiantes del Módulo Activo

* **ID:** `US-10`
* **Requerimiento(s):** `RF-06`
* **Rol:** Administrador
* **Prioridad:** Must Have | **Estimación:** 3 Story Points
* **Dependencias directas:** `US-01`, `US-07`

#### Narrativa
> **Como** Administrador del sistema  
> **Quiero** consultar la lista completa de estudiantes del módulo activo y buscar por nombre o número de registro  
> **Para** localizar rápidamente a un alumno y verificar sus datos de contacto.

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Búsqueda dinámica de estudiantes
  Dado que el administrador está en la sección "/admin/estudiantes"
  Cuando ingresa en la caja de búsqueda "1001" o "Pérez"
  Entonces la tabla filtra en tiempo real mostrando únicamente los estudiantes que coincidan en nombre completo o número de registro
  Y muestra las columnas: Número de registro, Nombre completo y Correo electrónico.
```

---

### US-11: Vista General y Matriz de Asistencias con Totales

* **ID:** `US-11`
* **Requerimiento(s):** `RF-08`
* **Rol:** Administrador
* **Prioridad:** Must Have | **Estimación:** 5 Story Points
* **Dependencias directas:** `US-07`, `US-08`

#### Narrativa
> **Como** Administrador del sistema  
> **Quiero** ver la planilla general de asistencias de todos los estudiantes con filtros por fecha y por estudiante  
> **Para** tener una visión global del cumplimiento del curso y conocer los totales de presentes y ausentes.

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Consulta de matriz por fecha específica
  Dado que el administrador selecciona la fecha de clase "05/10/2026" en el filtro
  Cuando aplica el filtro
  Entonces el sistema muestra la lista de todos los estudiantes inscritos con su estado ("Presente" o "Falta") para esa fecha
  Y en la parte superior muestra: "Total Presentes: 28 | Total Ausentes: 2".

Escenario: Consulta del historial consolidado de un estudiante
  Dado que el administrador selecciona a un estudiante del filtro
  Cuando pulsa filtrar
  Entonces el sistema muestra todas las fechas del módulo con el estado de ese estudiante en particular.
```

---

### US-12: Modificación Administrativa de Asistencias con Auditoría

* **ID:** `US-12`
* **Requerimiento(s):** `RF-07`, `RN-06`, `RN-07`, `RF-18`
* **Rol:** Administrador
* **Prioridad:** Must Have | **Estimación:** 5 Story Points
* **Dependencias directas:** `US-11`, `US-14`

#### Narrativa
> **Como** Administrador del sistema  
> **Quiero** cambiar el estado de asistencia (Presente a Falta o Falta a Presente) de cualquier estudiante en cualquier fecha de clase  
> **Para** justificar inasistencias o corregir errores humanos, asegurando que el cambio quede totalmente auditado.

#### Contexto y Alcance
* El administrador es el **único** autorizado para modificar asistencias de fechas pasadas o presentes (**RN-06**).
* Cada modificación debe registrar obligatoriamente: usuario que modificó, fecha y hora del cambio, valor anterior y nuevo valor (**RN-07**, **RF-07**).

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Corrección de Falta a Presente por justificación médica
  Dado que el estudiante figura con estado "Falta" en la fecha "05/10/2026"
  Cuando el administrador hace clic en editar el estado
  Y selecciona el nuevo estado "Presente" e ingresa la justificación "Presentó justificante laboral"
  Y confirma la operación
  Entonces el sistema actualiza el estado en la base de datos
  Y crea automáticamente un registro en la tabla de auditoría (ActivityLog) con:
    - user: ID/correo del administrador
    - action: "UPDATE_ATTENDANCE"
    - previousValue: {"status": "FALTA"}
    - newValue: {"status": "PRESENTE", "remarks": "Presentó justificante laboral"}
    - timestamp: Hora actual
  Y la interfaz muestra el estado actualizado con mensaje de confirmación exitoso.
```

#### Consideraciones Técnicas
* **Backend:**
  * Endpoint: `PATCH /api/v1/attendances/:id` o `PUT /api/v1/attendances/override`
  * Body: `{ status: AttendanceStatus, remarks?: string }`
  * Inyección de `ActivityLogService` para guardar el snapshot auditado en la misma transacción.

---

### US-13: Exportación de Asistencias a Excel

* **ID:** `US-13`
* **Requerimiento(s):** `RF-17`
* **Rol:** Administrador
* **Prioridad:** Could Have (Opcional) | **Estimación:** 3 Story Points
* **Dependencias directas:** `US-11`

#### Narrativa
> **Como** Administrador del sistema  
> **Quiero** descargar en formato Excel la planilla de asistencias del módulo activo  
> **Para** disponer de un respaldo documental fuera de línea y compartir reportes con coordinación académica.

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Descarga del reporte general en Excel
  Dado que el módulo activo cuenta con asistencias registradas
  Cuando el administrador hace clic en "Descargar Excel de Asistencias"
  Entonces el backend genera un archivo ".xlsx" con una matriz cruzada:
    - Filas: Número de registro, Nombre completo, Correo.
    - Columnas: Fechas de clase con valores "P" (Presente) o "F" (Falta).
    - Columnas finales: Total Presentes, Total Faltas, % Asistencia.
  Y el navegador descarga el archivo con el nombre "asistencias_[codigo_modulo]_[fecha].xlsx".
```

---

## Épica 5: Auditoría y Registro de Actividades

---

### US-14: Registro Centralizado de Actividades y Auditoría

* **ID:** `US-14`
* **Requerimiento(s):** `RF-09`, `RN-07`
* **Rol:** Sistema / Auditoría
* **Prioridad:** Must Have | **Estimación:** 5 Story Points
* **Dependencias directas:** `US-01`

#### Narrativa
> **Como** Arquitectura del sistema  
> **Quiero** registrar de forma inmutable todas las acciones críticas ejecutadas por estudiantes y administradores  
> **Para** garantizar la trazabilidad, transparencia y cumplimiento de las normativas del curso.

#### Contexto y Alcance
Operaciones obligatorias a registrar:
1. Marcas de asistencia por estudiantes (**RF-09**).
2. Modificaciones manuales de asistencia por administradores con valor previo y posterior (**RN-07**).
3. Importación de estudiantes y fechas.
4. Activación de un nuevo módulo.
5. Inicios de sesión relevantes.

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Creación automática de traza de auditoría
  Dado que ocurre una acción crítica en el sistema (ej. marcación de asistencia o cambio de estado)
  Cuando el servicio procesa la acción
  Entonces se inserta un registro en "activity_logs" que contiene:
    - moduleId: ID del módulo activo actual
    - userId / userIdentifier: Quién lo ejecutó
    - userRole: ADMIN o STUDENT
    - action: Identificador de la acción
    - entityAffected y entityId
    - previousValue y newValue (en formato JSON)
    - timestamp y correlationId
  Y la operación no puede ser modificada ni eliminada por ningún usuario.
```

---

### US-15: Consulta y Filtrado del Historial de Actividades

* **ID:** `US-15`
* **Requerimiento(s):** `RF-10`
* **Rol:** Administrador
* **Prioridad:** Should Have | **Estimación:** 3 Story Points
* **Dependencias directas:** `US-14`

#### Narrativa
> **Como** Administrador del sistema  
> **Quiero** consultar la bitácora de actividades del módulo activo filtrando por estudiante o por fecha  
> **Para** auditar quién realizó cambios, cuándo se marcaron las asistencias y verificar posibles reclamos.

#### Criterios de Aceptación (BDD)

```gherkin
Escenario: Consulta de actividades por parte del administrador
  Dado que el administrador ingresa a "/admin/auditoria"
  Cuando consulta la bitácora
  Entonces visualiza los eventos cronológicos del módulo activo ordenados desde el más reciente
  Y puede filtrar por fecha o por identificador de estudiante.

Escenario: Restricción de acceso para estudiantes (RF-10)
  Dado que un estudiante intenta consultar la bitácora de actividades
  Cuando hace la petición a la ruta "/admin/auditoria" o al endpoint de logs
  Entonces el sistema responde 403 Forbidden impidiendo el acceso a la información confidencial.
```

---

## Definición de Hecho Global (Definition of Done - DoD)

Para considerar una Historia de Usuario como completada (`Done`), debe cumplir con:
1. **Código:** Implementado siguiendo los estándares de arquitectura NestJS y Next.js del proyecto.
2. **Pruebas:** Pruebas unitarias de servicios críticos y validaciones DTO aprobadas.
3. **Auditoría:** Emisión de logs estructurados con Correlation ID (`backend-logging-and-traceability.md`).
4. **Base de Datos:** Entidades extendidas de `AppBaseEntity`, tipos de columna explícitos y migraciones limpias.
5. **Criterios de Aceptación:** Todos los escenarios BDD verificados en entorno local.
6. **Revisión de Código:** Pull Request revisado y aprobado sin conflictos.

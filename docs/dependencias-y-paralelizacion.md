# Mapa de Dependencias y Estrategia de Trabajo en Paralelo

Este documento describe la red de dependencias entre las Historias de Usuario (**US-01 a US-15**), identifica el camino crítico del proyecto y define una estrategia de paralelización para que un equipo multidisciplinario pueda avanzar de forma simultánea sin cuellos de botella ni bloqueos.

---

## 1. Matriz de Dependencias entre Historias de Usuario

| ID | Historia de Usuario | Dependencias Directas (Bloqueado por) | Historias que Desbloquea | Nivel de Precedencia |
| :--- | :--- | :--- | :--- | :--- |
| **US-01** | Acceso de Administrador con Credenciales | *Ninguna* (Fundacional) | US-03, US-04, US-05, US-10, US-14 | **Nivel 0** (Semilla) |
| **US-14** | Registro Centralizado de Auditoría | *Ninguna* (Arquitectura base) | US-12, US-15 | **Nivel 0** (Semilla) |
| **US-04** | Importación Excel de Estudiantes | US-01 | US-06, US-07 | **Nivel 1** |
| **US-05** | Importación Excel de Fechas y Horarios | US-01 | US-06, US-07 | **Nivel 1** |
| **US-03** | Cierre de Sesión y Control de Roles | US-01 | *Mejora de seguridad transversal* | **Nivel 1** |
| **US-06** | Vista Previa de Datos antes de Activar | US-04, US-05 | US-07 | **Nivel 1.5** |
| **US-07** | Activación de Nuevo Módulo y Archivado | US-04, US-05 (o US-06) | US-02, US-08, US-10, US-11 | **Nivel 2** (Hito Clave) |
| **US-02** | Acceso de Estudiantes al Módulo Activo | US-07 | US-08, US-09 | **Nivel 2.5** |
| **US-10** | Consulta y Búsqueda de Estudiantes | US-01, US-07 | US-11 | **Nivel 2.5** |
| **US-08** | Marcación de Asistencia en Día de Clase | US-02, US-07 | US-09, US-11, US-12 | **Nivel 3** |
| **US-09** | Historial Personal y Resumen de Faltas | US-02, US-08 | *Consumo final de alumno* | **Nivel 3.5** |
| **US-11** | Vista General y Matriz de Asistencias | US-07, US-08 (o datos) | US-12, US-13 | **Nivel 3.5** |
| **US-12** | Modificación de Asistencia por Admin | US-11, US-14 | *Operación administrativa avanzada* | **Nivel 4** |
| **US-15** | Consulta y Filtrado de Auditoría | US-14 | *Panel de auditoría administrativo* | **Nivel 4** |
| **US-13** | Exportación de Asistencias a Excel | US-11 | *Funcionalidad opcional final* | **Nivel 4** |

---

## 2. Grafo Visual de Dependencias (Mermaid)

El siguiente diagrama de flujo ilustra la secuencia de dependencias, desde la arquitectura fundacional hasta las funcionalidades de reporte y auditoría:

```mermaid
flowchart TD
    %% Nivel 0: Fundaciones
    US01["<b>US-01</b><br/>Login Administrador<br/><i>(RF-02)</i>"]
    US14["<b>US-14</b><br/>Servicio de Auditoría Base<br/><i>(RF-09, RN-07)</i>"]

    %% Nivel 1: Importación y Seguridad
    US03["<b>US-03</b><br/>Logout y Protección Rutas<br/><i>(RF-02)</i>"]
    US04["<b>US-04</b><br/>Importar Estudiantes Excel<br/><i>(RF-11, RN-02)</i>"]
    US05["<b>US-05</b><br/>Importar Fechas Excel<br/><i>(RF-12)</i>"]

    %% Nivel 1.5: Previsualización
    US06["<b>US-06</b><br/>Preview de Módulo<br/><i>(RF-16)</i>"]

    %% Nivel 2: Módulo Activo
    US07["<b>US-07</b><br/>Activación de Módulo y Archivado<br/><i>(RF-13, RF-14, RF-15, RN-01, RN-08)</i>"]

    %% Nivel 2.5: Identidad y Consulta
    US02["<b>US-02</b><br/>Login Estudiantes<br/><i>(RF-01)</i>"]
    US10["<b>US-10</b><br/>Lista y Búsqueda Alumnos<br/><i>(RF-06)</i>"]

    %% Nivel 3: Marcación
    US08["<b>US-08</b><br/>Marcación Asistencia Hoy<br/><i>(RF-03, RN-03, RN-04)</i>"]

    %% Nivel 3.5: Vistas e Historial
    US09["<b>US-09</b><br/>Historial y Faltas Alumno<br/><i>(RF-04, RF-05, RN-05)</i>"]
    US11["<b>US-11</b><br/>Matriz General Asistencias<br/><i>(RF-08)</i>"]

    %% Nivel 4: Operaciones Avanzadas y Auditoría
    US12["<b>US-12</b><br/>Edición de Asistencia por Admin<br/><i>(RF-07, RN-06, RN-07)</i>"]
    US13["<b>US-13</b><br/>Exportación Excel Asistencias<br/><i>(RF-17)</i>"]
    US15["<b>US-15</b><br/>Consulta Log Auditoría<br/><i>(RF-10)</i>"]

    %% Enlaces de Dependencia
    US01 --> US03
    US01 --> US04
    US01 --> US05
    US01 --> US10

    US04 --> US06
    US05 --> US06
    US04 --> US07
    US05 --> US07
    US06 --> US07

    US07 --> US02
    US07 --> US10
    US07 --> US11

    US02 --> US08
    US07 --> US08

    US08 --> US09
    US08 --> US11

    US11 --> US12
    US14 --> US12

    US11 --> US13
    US14 --> US15

    %% Estilos de Nodos
    style US01 fill:#2563eb,stroke:#1d4ed8,color:#ffffff,stroke-width:2px
    style US14 fill:#475569,stroke:#334155,color:#ffffff,stroke-width:2px
    style US07 fill:#b91c1c,stroke:#991b1b,color:#ffffff,stroke-width:3px
    style US08 fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px
    style US11 fill:#d97706,stroke:#b45309,color:#ffffff,stroke-width:2px
```

---

## 3. Análisis del Camino Crítico (Critical Path)

El camino crítico representa la secuencia de historias que determina la duración mínima para tener el producto mínimo viable (MVP) completamente operativo:

$$\text{US-01} \xrightarrow{} \text{US-04 \& US-05} \xrightarrow{} \text{US-07} \xrightarrow{} \text{US-02} \xrightarrow{} \text{US-08} \xrightarrow{} \text{US-11} \xrightarrow{} \text{US-12}$$

* **Cualquier retraso en este camino retrasa la entrega completa del sistema.**
* **Cuello de botella principal:** `US-07 (Activación del Módulo)`. Sin un módulo activo en la base de datos, los estudiantes no pueden autenticarse ni marcar asistencia.

---

## 4. Estrategia de Trabajo en Paralelo para el Equipo

Para aprovechar la capacidad del equipo de desarrollo y evitar que los desarrolladores se bloqueen esperando a otros, dividimos el trabajo en **4 Tracks (Líneas de Trabajo) Autónomas**:

```
[Track A: Auth & Módulos]       ─► US-01, US-03, US-07
[Track B: Excel & Estudiantes]   ─► US-04, US-05, US-06, US-10
[Track C: Flujo Estudiante]     ─► US-02, US-08, US-09
[Track D: Matriz & Auditoría]   ─► US-14, US-11, US-12, US-13, US-15
```

### 4.1 Definición de los 4 Tracks de Trabajo

#### Track 1: Identidad, Seguridad y Ciclo de Vida del Módulo (Core Admin)
* **Responsable sugerido:** Desarrollador Backend Principal / Lead
* **Historias:** `US-01` (Login Admin), `US-03` (Guards & Logout), `US-07` (Activación transaccional de módulo).
* **Entregable clave:** Infraestructura JWT, migración de `academic_modules`, lógica de estado único activo (**RN-01** y **RN-08**).

#### Track 2: Procesamiento Excel y Nómina de Alumnos
* **Responsable sugerido:** Desarrollador 2 (Especialista en Integraciones / Datos)
* **Historias:** `US-04` (Importador Excel Alumnos), `US-05` (Importador Excel Fechas), `US-06` (Preview UI), `US-10` (Búsqueda de alumnos).
* **Entregable clave:** Servicios de parseo Excel con `xlsx`/`exceljs`, validaciones de formato, detección de duplicados (**RN-02**) y endpoints de preview.

#### Track 3: Experiencia del Estudiante y Marcación de Asistencias
* **Responsable sugerido:** Desarrollador 3 (Fullstack / Frontend enfocado en Estudiante)
* **Historias:** `US-02` (Login Estudiante), `US-08` (Botón de marcación con control de fecha), `US-09` (Historial y Faltas).
* **Entregable clave:** Pantallas móviles/responsive para estudiantes, validación de horario de servidor vs cliente, cálculo automático de `FALTA` en fechas pasadas (**RN-04**, **RN-05**).

#### Track 4: Supervisión Administrativa, Auditoría y Reportes
* **Responsable sugerido:** Desarrollador 4 (Fullstack / Backend enfocado en Administración)
* **Historias:** `US-14` (Entidad e interceptores de `ActivityLog`), `US-11` (Matriz y filtros de asistencias), `US-12` (Edición manual con auditoría), `US-15` (Log viewer), `US-13` (Exportación Excel).
* **Entregable clave:** Matriz cruzada de asistencias en frontend, auditoría inmutable en backend (**RN-06**, **RN-07**).

---

## 5. Estrategia de Desacoplamiento (Frontend y Backend en Paralelo)

Para que el equipo de **Frontend** no espere a que el equipo de **Backend** termine las APIs:

### 5.1 Enfoque API-First con Contratos Simulados (Mocking)
1. **Día 1:** Todo el equipo aprueba las interfaces TypeScript de petición y respuesta (ya documentadas en `docs/historias-de-usuario.md`).
2. **Frontend Mock Handler:** Frontend utiliza un adaptador simulado en memoria o Next.js Route Handlers locales (`src/app/api/mock/*`) para renderizar componentes inmediatamente.
3. **Validación con DTOs compartidos:** Los tipos de datos definidos en `docs/diagrama-de-clases.md` se trasladan a interfaces comunes de TypeScript.

### 5.2 Semillas de Base de Datos (Seeds)
El Desarrollador del Track 1 creará un script de semilla (`npm run seed`) en el backend que inserte de inmediato:
* 1 Administrador por defecto (`admin@sistema.com` / `Admin123!`).
* 1 Módulo Activo de prueba.
* 10 Estudiantes con registros `1001` a `1010`.
* 5 Fechas de clase (incluyendo la fecha de hoy para pruebas de marcación).

> Con esta semilla disponible desde el primer día, los Tracks 3 y 4 pueden trabajar y probar sus funcionalidades inmediatamente sin esperar a que el importador de Excel (Track 2) esté terminado.

---

## 6. Plan de Ejecución por Fases (Iteraciones / Sprints)

A continuación se presenta un cronograma sugerido en 3 Sprints para organizar el trabajo en equipo:

```mermaid
gantt
    title Cronograma de Trabajo en Paralelo
    dateFormat  YYYY-MM-DD
    section Sprint 1: Fundaciones
    US-01 (Login Admin)           :a1, 2026-10-14, 2d
    US-14 (Servicio Auditoría)    :a2, 2026-10-14, 2d
    US-04 (Excel Estudiantes)     :a3, 2026-10-15, 3d
    US-05 (Excel Fechas)          :a4, 2026-10-15, 3d
    US-03 (Logout & Guards)       :a5, 2026-10-16, 2d
    US-06 (Preview Carga)         :a6, 2026-10-17, 2d
    section Sprint 2: Core Asistencia
    US-07 (Activación Módulo)     :b1, 2026-10-19, 3d
    US-02 (Login Estudiante)      :b2, 2026-10-20, 2d
    US-10 (Búsqueda Estudiantes)  :b3, 2026-10-21, 2d
    US-08 (Marcación Asistencia)  :b4, 2026-10-22, 3d
    US-09 (Historial y Faltas)    :b5, 2026-10-23, 3d
    section Sprint 3: Supervisión & Cierre
    US-11 (Matriz de Asistencias) :c1, 2026-10-26, 3d
    US-12 (Edición con Auditoría) :c2, 2026-10-28, 3d
    US-15 (Consulta Auditoría)    :c3, 2026-10-29, 2d
    US-13 (Exportación Excel)     :c4, 2026-10-30, 2d
```

### Desglose por Sprint

#### Sprint 1: Carga de Datos y Núcleo de Seguridad
* **Objetivo:** Tener el sistema de autenticación administrativa funcionando, el módulo de auditoría base y los componentes de carga y validación de archivos Excel.
* **Historias:** `US-01`, `US-14`, `US-04`, `US-05`, `US-03`, `US-06`.
* **Resultado del Sprint:** Un administrador puede ingresar al sistema y cargar sus archivos Excel de alumnos y calendario de clases viendo el resumen validado.

#### Sprint 2: Activación de Módulos y Flujo del Estudiante
* **Objetivo:** Activar el módulo académico en BD y habilitar el ciclo completo para el estudiante (login, marcación y revisión de faltas).
* **Historias:** `US-07`, `US-02`, `US-10`, `US-08`, `US-09`.
* **Resultado del Sprint:** El módulo queda activo en BD. Los estudiantes entran con su correo/matrícula, marcan asistencia hoy y ven su historial con cálculo de faltas pasadas.

#### Sprint 3: Matriz Administrativa, Modificaciones Manuales y Reportes
* **Objetivo:** Dar al administrador el control total de supervisión, modificación auditada y descarga de reportes.
* **Historias:** `US-11`, `US-12`, `US-15`, `US-13`.
* **Resultado del Sprint:** Producto terminado para puesta en producción académica.

---

## 7. Matriz RACI para el Equipo de Trabajo

| Historia de Usuario | Backend Dev 1 (Lead) | Backend Dev 2 (Datos) | Frontend Dev 1 (Admin) | Frontend Dev 2 (Alumno) | QA / DevOps |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **US-01** (Login Admin) | **R** | C | **R** | I | A |
| **US-02** (Login Alumno) | C | C | I | **R** | A |
| **US-03** (Logout & Guards) | **R** | I | **R** | **R** | A |
| **US-04** (Excel Estudiantes) | I | **R** | **R** | I | A |
| **US-05** (Excel Fechas) | I | **R** | **R** | I | A |
| **US-06** (Preview Módulo) | I | **R** | **R** | I | A |
| **US-07** (Activación Módulo) | **R** | C | **R** | I | A |
| **US-08** (Marcación Asistencia)| C | I | I | **R** | A |
| **US-09** (Historial Alumno) | I | I | I | **R** | A |
| **US-10** (Lista Estudiantes) | I | **R** | **R** | I | A |
| **US-11** (Matriz Asistencias) | C | **R** | **R** | I | A |
| **US-12** (Modificación Admin) | **R** | C | **R** | I | A |
| **US-13** (Exportar Excel) | I | **R** | **R** | I | A |
| **US-14** (Auditoría Base) | **R** | I | I | I | A |
| **US-15** (Consulta Auditoría) | **R** | I | **R** | I | A |

> **Leyenda RACI:**  
> **R** = *Responsible* (Quien ejecuta la tarea)  
> **A** = *Accountable* (Quien valida y aprueba la calidad final)  
> **C** = *Consulted* (Quien aporta información o apoyo técnico)  
> **I** = *Informed* (Quien debe estar al tanto del avance)

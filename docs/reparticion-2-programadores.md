# Guía de Repartición de Historias para 2 Programadores (Trabajo en Paralelo)

Este documento define la estrategia exacta para que **dos (2) programadores** comiencen a desarrollar el **Sistema Web de Registro y Control de Asistencia** de manera simultánea desde el **Día 1**, garantizando que **ninguno dependa ni quede bloqueado esperando que el otro termine**.

---

## 1. El Principio de Desacoplamiento (Paso Cero: 30 minutos)

Para que el Programador 2 pueda desarrollar el acceso del estudiante y la marcación de asistencia sin esperar a que el Programador 1 termine el importador de Excel de estudiantes, se aplica la técnica de **"Semilla Base de Desarrollo" (Database Seed / Fixture)**.

### Paso Cero Conjunto (30 mins iniciales):
Ambos programadores definen las entidades base acordadas en [`docs/diagrama-de-clases.md`](diagrama-de-clases.md) y corren un script inicial de base de datos (`npm run seed`) que inserta:
1. **1 Administrador de prueba:** `admin` / `admin123`
2. **1 Módulo Académico con estado `ACTIVE`:** `"Módulo Piloto DevOps"`
3. **3 Estudiantes vinculados al módulo:**
   * Registro: `1001` | Juan Pérez | `juan@gmail.com`
   * Registro: `1002` | María López | `maria@gmail.com`
   * Registro: `1003` | Carlos Ruiz | `carlos@gmail.com`
4. **Fechas de clase de prueba:**
   * La fecha de **hoy** (para poder probar la marcación en tiempo real).
   * 2 fechas pasadas (para probar el cálculo de faltas automáticas).
   * 2 fechas futuras (para probar que el botón esté deshabilitado).

> **Resultado del Paso Cero:** Con esta semilla en la base de datos local, **ambos programadores pueden programar y probar de forma 100% independiente en sus respectivas ramas de Git**.

---

## 2. Repartición de Historias de Usuario - Fase 1 (MVP)

```
┌────────────────────────────────────────────────────────┐
│                      PASO CERO                         │
│       Migración Base + Seed con Módulo y Alumnos       │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│     PROGRAMADOR 1       │ │     PROGRAMADOR 2       │
│  "Admin & Onboarding"   │ │ "Student & Attendance"  │
├─────────────────────────┤ ├─────────────────────────┤
│ US-01: Login Admin      │ │ US-14: Auditoría Base   │
│ US-04: Excel Alumnos    │ │ US-02: Login Estudiante │
│ US-05: Excel Fechas     │ │ US-08: Marcar Asistencia│
│ US-06: Preview Módulo   │ │ US-09: Historial Alumno │
└─────────────────────────┘ └─────────────────────────┘
```

---

### 👨‍💻 PROGRAMADOR 1: Track de Administración y Carga Masiva de Datos
**Foco:** Infraestructura de seguridad administrativa y motor de ingesta y validación de archivos Excel.

| Orden | Historia | Título | Puntos | ¿Por qué puede empezar de inmediato? |
| :---: | :---: | :--- | :---: | :--- |
| **1°** | **US-01** | Acceso de Administrador con Credenciales | 3 SP | Es completamente autónoma. Requiere solo la entidad `AdminUser` y JWT con rol `ADMIN`. |
| **2°** | **US-04** | Importación y Validación de Estudiantes vía Excel | 5 SP | Trabaja sobre el archivo `.xlsx` subido a memoria. Valida obligatoriedad y duplicados (**RN-02**) contra su propio DTO. |
| **3°** | **US-05** | Importación de Fechas y Horarios vía Excel | 5 SP | Procesa el archivo `.xlsx` de fechas, valida formatos cronológicos y retorna el listado parseado. |
| **4°** | **US-06** | Vista Previa de Datos antes de Activar Módulo | 3 SP | Conecta los resultados de US-04 y US-05 en una vista previa sin tocar asistencias. |

* **Total Carga de Trabajo Fase 1:** 16 Story Points.
* **Archivos / Módulos Git asignados:**
  * Backend: `backend/src/features/auth/admin/*`, `backend/src/features/modules/import/*`
  * Frontend: `frontend/src/app/admin/login/*`, `frontend/src/app/admin/modulo/importar/*`

---

### 👨‍💻 PROGRAMADOR 2: Track de Experiencia del Estudiante y Marcación
**Foco:** Flujo diario del estudiante, validación de fechas hábiles, cálculo de faltas y trazabilidad.

| Orden | Historia | Título | Puntos | ¿Por qué puede empezar de inmediato? |
| :---: | :---: | :--- | :---: | :--- |
| **1°** | **US-14** | Registro Centralizado de Actividades y Auditoría | 5 SP | Es el servicio transversal de auditoría. Permite que cuando desarrolle la marcación (US-08) ya pueda emitir la traza auditable (**RN-07**). |
| **2°** | **US-02** | Acceso de Estudiantes al Módulo Activo | 3 SP | Consume los estudiantes ya cargados en la base de datos por la semilla (`juan@gmail.com` o registro `1001`). No necesita el Excel. |
| **3°** | **US-08** | Marcación de Asistencia en Día de Clase Programada | 5 SP | Valida que la fecha actual coincida con la clase de hoy de la semilla (**RN-04**), controla una sola marca (**RN-03**) y guarda la hora real. |
| **4°** | **US-09** | Consulta de Historial Personal y Faltas | 5 SP | Consulta las clases de la semilla; si la fecha ya pasó y no hay marca, retorna automáticamente `FALTA` (**RN-05**). |

* **Total Carga de Trabajo Fase 1:** 18 Story Points.
* **Archivos / Módulos Git asignados:**
  * Backend: `backend/src/features/auth/student/*`, `backend/src/features/attendances/*`, `backend/src/features/activity-logs/*`
  * Frontend: `frontend/src/app/(estudiante)/login/*`, `frontend/src/app/(estudiante)/asistencia/*`

---

## 3. Matriz de Cero Conflictos Git (Zero-Collision Matrix)

Para evitar colisiones y *merge conflicts* en el repositorio durante la Fase 1:

| Ámbito | Asignado a Programador 1 | Asignado a Programador 2 |
| :--- | :--- | :--- |
| **Rutas Frontend Next.js** | `/admin/login`<br/>`/admin/modulo/importar`<br/>`/admin/modulo/preview` | `/` o `/estudiante/login`<br/>`/estudiante/asistencia`<br/>`/estudiante/historial` |
| **Rutas Backend NestJS** | `/api/v1/auth/admin/*`<br/>`/api/v1/modules/import/*` | `/api/v1/auth/student/*`<br/>`/api/v1/attendances/check-in`<br/>`/api/v1/attendances/my-history`<br/>`/api/v1/activity-logs/*` |
| **Entidades TypeORM** | `AdminUser`<br/>`AcademicModule` | `Attendance`<br/>`ActivityLog` |
| **Entidades Compartidas (Read-only tras Paso 0)** | `Student` (escribe vía importación)<br/>`ClassSchedule` (escribe vía importación) | `Student` (solo lectura para login)<br/>`ClassSchedule` (solo lectura para fechas) |

---

## 4. Repartición de Historias - Fase 2 (Integración y Cierre)

Una vez completada la Fase 1, ambos programadores integran sus ramas a la rama principal (`develop` o `main`) y se reparten las historias restantes:

| Programador | Historia | Título | Puntos | Descripción |
| :---: | :---: | :--- | :---: | :--- |
| **Prog. 1** | **US-07** | Activación de Nuevo Módulo y Archivado Histórico | 5 SP | Conecta los datos importados en la Fase 1 y ejecuta la transacción ACID que archiva el módulo viejo y activa el nuevo (**RN-01**, **RN-08**). |
| **Prog. 1** | **US-10** | Consulta y Búsqueda de Estudiantes Activos | 3 SP | Vista del admin con buscador en tiempo real por nombre o registro (**RF-06**). |
| **Prog. 1** | **US-03** | Cierre de Sesión y Guards Globales | 2 SP | Unifica la política de logout y protección de rutas en todo el sistema. |
| **Prog. 2** | **US-11** | Vista General y Matriz de Asistencias | 5 SP | Construye la grilla administrativa con filtros por fecha y alumno, y totales de presentes y ausentes (**RF-08**). |
| **Prog. 2** | **US-12** | Modificación Administrativa de Asistencias | 5 SP | Permite al admin cambiar Presente/Falta con justificación y auditoría obligatoria (**RN-06**, **RN-07**). |
| **Prog. 2** | **US-15** | Consulta y Filtrado de Bitácora de Auditoría | 3 SP | Pantalla del admin para ver logs del módulo activo (**RF-10**). |
| **Prog. 1 o 2**| **US-13** | Exportación de Asistencias a Excel | 3 SP | Funcionalidad opcional de descarga de reporte `.xlsx` (**RF-17**). |

---

## 5. Resumen de Ventajas de esta Repartición

1. **Cero Espera:** Ningún programador se queda de brazos cruzados el primer día.
2. **Independencia Funcional:** El Programador 1 no necesita saber cómo funciona el botón de asistencia; el Programador 2 no necesita saber cómo funciona el parser de Excel.
3. **Alineación con el Negocio:** Al final de la Fase 1 ya existe un prototipo funcional del alumno marcando asistencia y un prototipo funcional del admin importando datos.
4. **Fácil Integración:** Como se acordaron los esquemas de BD en el Paso Cero, la integración final en `US-07` y `US-11` es limpia y natural.

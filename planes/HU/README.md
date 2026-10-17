# Planes de Implementación de Historias de Usuario (Programador 1 y Programador 2)

Este directorio contiene las especificaciones técnicas completas de arquitectura, contratos de API, componentes UI, criterios BDD y checklists paso a paso para ejecutar las 15 historias de usuario del **Sistema Web de Registro y Control de Asistencia**, organizadas por programador y fase de desarrollo.

---

## 📋 Catálogo Maestro de Historias de Usuario

```
┌────────────────────────────────────────────────────────┐
│                   HISTORIAS DE USUARIO                 │
│                 SISTEMA DE ASISTENCIA                  │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│     PROGRAMADOR 1       │ │     PROGRAMADOR 2       │
│  "Admin & Onboarding"   │ │"Student, Matrix & Audit"│
├─────────────────────────┤ ├─────────────────────────┤
│ US-01: Login Admin  3SP │ │ US-14: Auditoría    5SP │
│ US-04: Excel Alum.  5SP │ │ US-02: Login Alum.  3SP │
│ US-05: Excel Fechas 5SP │ │ US-08: Check-in     5SP │
│ US-06: Preview Mod. 3SP │ │ US-09: Historial    5SP │
│ US-07: Activación   5SP │ │ US-11: Matriz Asist 5SP │
│ US-10: Búsqueda     3SP │ │ US-12: Override     5SP │
│ US-03: Guards & Out 2SP │ │ US-15: Consulta Log 3SP │
│                         │ │ US-13: Export Excel 3SP │
├─────────────────────────┤ ├─────────────────────────┤
│ Total: 26 SP (100% ✅)  │ │ Total: 34 SP            │
└─────────────────────────┘ └─────────────────────────┘
```

---

## 👨‍💻 PROGRAMADOR 1: Track de Administración y Onboarding (26 SP) — 100% Completado ✅

| Historia | Título | Requerimientos | Story Points | Fase | Estado | Plan Detallado |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **US-01** | Acceso de Administrador con Credenciales Propias | `RF-02`, `RF-18` | 3 SP | Fase 1 | ✅ Integrada | [Ver Plan Técnico US-01](US-01-acceso-administrador.md) |
| **US-04** | Importación y Validación de Estudiantes vía Excel | `RF-11`, `RN-02`, `RF-18` | 5 SP | Fase 1 | ✅ Integrada | [Ver Plan Técnico US-04](US-04-importacion-estudiantes-excel.md) |
| **US-05** | Importación de Fechas y Horarios de Clase vía Excel | `RF-12`, `RF-18` | 5 SP | Fase 1 | ✅ Integrada | [Ver Plan Técnico US-05](US-05-importacion-fechas-horarios-excel.md) |
| **US-06** | Vista Previa de Datos antes de Activar Módulo | `RF-16`, `RF-18` | 3 SP | Fase 1 | ✅ Integrada | [Ver Plan Técnico US-06](US-06-vista-previa-modulo.md) |
| **US-07** | Activación de Nuevo Módulo con Archivado Histórico | `RF-13`, `RF-14`, `RF-15`, `RN-01`, `RN-08` | 5 SP | Fase 2 | ✅ Integrada | [Ver Plan Técnico US-07](US-07-activacion-modulo-archivado.md) |
| **US-10** | Consulta y Búsqueda de Estudiantes Activos | `RF-06` | 3 SP | Fase 2 | ✅ Integrada | [Ver Plan Técnico US-10](US-10-consulta-busqueda-estudiantes.md) |
| **US-03** | Cierre de Sesión y Control de Acceso por Roles (Guards) | `RF-02` | 2 SP | Fase 2 | ✅ Integrada | [Ver Plan Técnico US-03](US-03-cierre-sesion-guards.md) |

---

## 👨‍💻 PROGRAMADOR 2: Track de Experiencia del Alumno, Matriz y Auditoría (34 SP)

### Fase 1: MVP de Asistencia del Alumno (18 SP) — Integrada ✅
| Historia | Título | Requerimientos | Story Points | Estado | Plan Detallado |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **US-14** | Registro Centralizado de Actividades y Auditoría | `RF-09`, `RN-07` | 5 SP | ✅ Integrada (PR #1) | [Ver Plan Técnico US-14](US-14-registro-centralizado-actividades-auditoria.md) |
| **US-02** | Acceso de Estudiantes al Módulo Activo | `RF-01` | 3 SP | ✅ Integrada (PR #1) | [Ver Plan Técnico US-02](US-02-acceso-estudiantes-modulo-activo.md) |
| **US-08** | Marcación de Asistencia en Día de Clase Programada | `RF-03`, `RN-03`, `RN-04`, `RF-18` | 5 SP | ✅ Integrada (PR #1) | [Ver Plan Técnico US-08](US-08-marcacion-asistencia-fecha-clase.md) |
| **US-09** | Consulta de Historial Personal y Faltas del Estudiante | `RF-04`, `RF-05`, `RN-05` | 5 SP | ✅ Integrada (PR #1) | [Ver Plan Técnico US-09](US-09-consulta-historial-personal-faltas.md) |

### Fase 2: Gestión Global de Asistencias y Auditoría (16 SP) — En Planificación 🚀
| Historia | Título | Requerimientos | Story Points | Prioridad | Plan Detallado |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **US-11** | Vista General y Matriz de Asistencias con Totales | `RF-08` | 5 SP | Must Have | [Ver Plan Técnico US-11](US-11-vista-general-matriz-asistencias.md) |
| **US-12** | Modificación Administrativa de Asistencias con Auditoría | `RF-07`, `RN-06`, `RN-07`, `RF-18` | 5 SP | Must Have | [Ver Plan Técnico US-12](US-12-modificacion-administrativa-asistencias.md) |
| **US-15** | Consulta y Filtrado del Historial de Actividades | `RF-10` | 3 SP | Should Have | [Ver Plan Técnico US-15](US-15-consulta-filtrado-historial-actividades.md) |
| **US-13** | Exportación de Asistencias a Excel | `RF-17` | 3 SP | Could Have | [Ver Plan Técnico US-13](US-13-exportacion-asistencias-excel.md) |

---

## 🌿 Convención de Ramas en Git para el Programador 2

1. **Rama base:** `develop`.
2. **Ramas de funcionalidad:**
   * `feature/US-11-attendance-matrix-overview`
   * `feature/US-12-admin-attendance-override`
   * `feature/US-15-activity-logs-query`
   * `feature/US-13-export-attendances-excel`
3. **Commits:** Seguir Conventional Commits (ej. `feat(attendances): implementar matriz de asistencias con totales (US-11)`).

---

## 🛠️ Herramientas de Verificación Local

* **Swagger UI:** `http://localhost:3000/api/docs`
* **Pruebas Automatizadas:** `npm test` en `backend/`
* **Compilación Frontend:** `npm run build` en `frontend/`
* **Semilla Base:**
  ```bash
  cd backend
  npm run seed
  ```

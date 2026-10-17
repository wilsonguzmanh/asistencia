# Plan Técnico de Implementación: US-09 - Consulta de Historial Personal y Faltas del Estudiante

Este documento define el plan de desarrollo técnico detallado para la historia **US-09**, asignada al **Programador 2 (Fase 1)**.

---

## 1. Ficha Técnica de la Historia

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `US-09` |
| **Título** | Consulta de Historial Personal y Faltas del Estudiante |
| **Rol** | Estudiante |
| **Requerimientos Funcionales** | `RF-04` (*Identificación automática de faltas*), `RF-05` (*Historial y resumen de asistencias*) |
| **Reglas de Negocio** | `RN-05` (*Al terminar el día, la ausencia de marca equivale a Falta*) |
| **Estimación** | 5 Story Points |
| **Prioridad** | Must Have |
| **Rama sugerida** | `feature/US-09-student-attendance-history` |

---

## 2. Alcance y Objetivos Técnicos

El estudiante debe contar con una pantalla dedicada (`/historial`) donde visualizar la relación consolidada de todas las sesiones de clase de su módulo activo:
1. Para cada sesión de clase transcurrida (`classDate < today`), si el estudiante no registró marca, el sistema la computa automáticamente como **Falta** (**RN-05**).
2. Si el estudiante registró marca, se muestra el estado **Presente** junto a la hora exacta (`markedAt`).
3. Para sesiones futuras (`classDate > today`), se muestra el estado como **Programada / Pendiente**.
4. Tarjeta resumen con métricas clave (**RF-05**):
   * Total de clases programadas en el módulo.
   * Clases transcurridas hasta la fecha.
   * Asistencias registradas (Presentes).
   * Inasistencias (Faltas).
   * Porcentaje de asistencia calculado: `(presentes / transcurridas) * 100`.
5. El estudiante no puede editar ni crear marcas de fechas pasadas (**RF-04**).

---

## 3. Arquitectura de Archivos a Crear / Modificar

```text
backend/src/
├── features/attendances/
│   ├── dto/
│   │   └── student-history.dto.ts           # DTO con array de clases y resumen numérico
│   ├── attendances.controller.ts            # Endpoint GET /api/v1/attendances/my-history
│   ├── attendances.service.ts               # Cálculo cronológico de faltas y métricas
│   └── attendances.service.spec.ts          # Pruebas unitarias de cálculo de historial

frontend/src/
├── app/
│   └── historial/
│       └── page.tsx                         # Pantalla con resumen de KPIs y tabla cronológica
├── features/attendances/
│   ├── components/
│   │   ├── AttendanceHistoryTable.tsx       # Tabla con badges (Presente, Falta, Programada)
│   │   └── AttendanceSummaryCards.tsx       # Tarjetas de totales y porcentaje de asistencia
│   └── services/
│       └── attendance.service.ts            # Consumo de GET /attendances/my-history
```

---

## 4. Especificación del Backend (NestJS)

### 4.1 Endpoint de Historial
* **Ruta:** `GET /api/v1/attendances/my-history`
* **Método:** `GET`
* **Guard:** `@UseGuards(StudentJwtGuard)`
* **Lógica en `AttendancesService`:**
  1. Obtener todas las sesiones de `ClassSchedule` del módulo activo ordenadas por `classDate ASC`.
  2. Obtener todas las `Attendance` registradas del estudiante para dicho módulo.
  3. Mapear cada clase:
     * Si existe registro en `Attendance`: estado `PRESENTE`, hora `markedAt`.
     * Si no existe y `classDate < today`: estado computado `FALTA` (**RN-05**).
     * Si no existe y `classDate >= today`: estado `PENDIENTE`.
  4. Calcular métricas:
     ```typescript
     const attendancePercentage = pastClassesCount > 0 
       ? Number(((presentCount / pastClassesCount) * 100).toFixed(1))
       : 100;
     ```

---

## 5. Criterios de Aceptación y Pruebas (BDD)

```gherkin
Escenario: Visualización de historial con faltas calculadas automáticamente
  Dado que el módulo activo tiene 3 clases transcurridas y 2 clases futuras
  Y el estudiante marcó asistencia en 2 de las 3 clases transcurridas
  Cuando el estudiante consulta su historial en "/historial"
  Entonces observa 2 registros con estado "Presente" y su respectiva hora
  Y observa 1 registro con estado "Falta" sin hora de marcación
  Y observa 2 registros futuros con estado "Programada".

Escenario: Métricas de resumen calculadas correctamente
  Dado el escenario anterior (2 presentes de 3 clases transcurridas)
  Cuando se evalúan las tarjetas de resumen
  Entonces la tarjeta indica:
    - Clases transcurridas: 3
    - Presentes: 2
    - Faltas: 1
    - Porcentaje de asistencia: 66.7%.
```

---

## 6. Checklist de Implementación para Programador 2

- [x] **Paso 1:** Definir `StudentHistoryDto` con estructura de sesiones y KPIs.
- [x] **Paso 2:** Implementar método `getMyHistory()` en `AttendancesService`.
- [x] **Paso 3:** Exponer endpoint `GET /api/v1/attendances/my-history` con `StudentJwtGuard`.
- [x] **Paso 4:** Desarrollar pantalla `/historial` y componentes visuales en Next.js.
- [x] **Paso 5:** Pruebas unitarias en `attendances.service.spec.ts`.

# Regla: Micro-interacciones y Animaciones Funcionales (Next.js)

Esta regla define los estándares técnicos, zonas prioritarias y principios de contención (*Restraint*) para detectar e implementar micro-interacciones en el **Sistema Web de Registro y Control de Asistencia**.

---

## 1. Principio Fundamental: Animación Funcional, No Decorativa

En una aplicación académica y de gestión de asistencias, las animaciones **nunca** deben retrasar la operatividad del usuario ni sentirse como trucos visuales o juguetes. Toda animación debe cumplir al menos uno de estos cuatro propósitos canónicos:

1. **Feedback Inmediato**: Confirmar físicamente que la interfaz reconoció la acción del usuario (ej. clic en marcar asistencia).
2. **Continuidad Espacial**: Mostrar el origen o destino de un elemento (ej. un modal expandiéndose desde su disparador, un toast entrando desde el borde).
3. **Indicación de Estado**: Hacer legible una transición de datos (ej. un botón que pasa de "Confirmar" a "Registrando..." y finalmente a "Asistencia Guardada").
4. **Eliminación de Saltos Bruscos**: Suavizar la aparición o desaparición de alertas, badges o filas de tablas sin teletransportación visual.

---

## 2. Skills para el Ciclo de Vida de Animación

Para auditar e implementar movimiento, los agentes deben apoyarse en las siguientes skills:

| Fase | Skill a Invocar | Tarea Específica |
|---|---|---|
| **Detección** | `find-animation-opportunities` | Escanear el código para detectar puntos donde falta feedback o donde sobra animación innecesaria (aplica el filtro de Emil Kowalski: *Restraint*). |
| **Construcción** | `animate` | Diseñar la curva de easing, duración exacta y propiedades CSS/Framer Motion adecuadas. |
| **Feedback de Eventos** | `ask-sonner` | Estandarizar notificaciones toast para confirmación de asistencias y avisos transaccionales. |
| **Revisión de Calidad** | `review-animations` / `improve-animations` | Auditar la fluidez de fotogramas (frame budget), verificar que no haya tirones (*jank*) y optimizar el rendimiento. |

---

## 3. Zonas con Alto Potencial de Micro-interacción

Al diseñar o refactorizar vistas, se debe buscar activamente implementar micro-interacciones en estas áreas clave:

### A. Botón Principal de Marcado ("Confirmar Asistencia")
* **Presión física**: `active:scale-[0.98]` con transición ultra-rápida (100–120ms).
* **Transición de estado**:
  * De *Activo* a *Loading*: spinner fluido sin alterar las dimensiones del botón (`inline-flex items-center justify-center`).
  * De *Loading* a *Éxito*: aparición del icono de verificación con cambio de color suave a verde esmeralda (`bg-emerald-600 transition-colors duration-200`).
* **Deshabilitado**: Desvanecimiento suave (`disabled:opacity-50 transition-opacity duration-150`).

### B. Badges de Asistencia (`Presente`, `Retraso`, `Falta`, `Justificado`)
* **Cambio de estado en vivo**: Cuando un docente o administrador cambia la asistencia en la tabla, el badge no debe parpadear bruscamente:
  * Aplicar un micro-desvanecimiento con desplazamiento vertical de 3px (`animate-in fade-in slide-in-from-bottom-1 duration-150`).

### C. Dropzone de Importación de Módulos y Calendarios
* **Arrastrar archivo (Drag over)**: Escala sutil del contenedor (`scale-[1.01]`) y transición del borde punteado a color índigo activo (`transition-all duration-200`).
* **Progreso de carga**: Barra de progreso animada con curvatura suave (`ease-out`) que refleje la lectura del archivo CSV/Excel.

### D. Métricas del Dashboard Administrativo
* **Barras de progreso de porcentaje de asistencia**: Animación fluida de 0 al valor real al cargar la pantalla (`transition-all duration-500 ease-out`).
* **Cifras clave**: Transición sutil en contadores de alumnos presentes/ausentes.

### E. Modales, Diálogos y Menús Desplegables
* **Apertura**: Crecimiento sutil desde `scale-95` a `scale-100` con `opacity-0` a `opacity-100` en 150–200ms.
* **Cierre**: Salida limpia en 100–150ms sin rebotes ni retrasos.

### F. Filas de Tablas y Listados de Estudiantes
* **Pase del cursor (Hover)**: `hover:bg-slate-50/80 transition-colors duration-150` para guiar la lectura de filas densas.
* **Filtrado y Búsqueda**: Transición suave al alternar listas de alumnos o fechas activas.

---

## 4. Presupuestos de Tiempo y Rendimiento Técnico

Toda micro-interacción debe cumplir rigurosamente estas restricciones:

### Presupuesto de Duración (Timing Budget)
* **Feedback de pulsación / botones**: `100ms – 160ms`
* **Tooltips y menús desplegables**: `125ms – 200ms`
* **Alertas, toasts y badges**: `150ms – 250ms`
* **Modales y paneles deslizantes**: `200ms – 250ms`
* **PROHIBIDO**: Animaciones superiores a 300ms en flujos transaccionales diarios.

### Rendimiento en GPU (Hardware Accelerated)
* **Propiedades permitidas para animar**: Únicamente `transform` (`translate`, `scale`, `rotate`) y `opacity`.
* **Propiedades prohibidas**: **NUNCA** animar `width`, `height`, `top`, `left`, `margin` ni `padding`, ya que provocan recálculo de layout del navegador (*layout thrashing*).

### Accesibilidad Obligatoria
* Todo elemento animado debe soportar la preferencia de reducción de movimiento del sistema:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
  O mediante utilidades de Tailwind: `motion-reduce:transition-none` o `motion-reduce:animate-none`.

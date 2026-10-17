# Regla: Protocolo de Diseño Visual y Uso de Skills UI/UX (Next.js)

Esta regla define el protocolo obligatorio para diseñar e implementar la dirección visual integral del **Sistema Web de Registro y Control de Asistencia**, garantizando coherencia institucional, rigor académico y calidad de experiencia de usuario en React / Next.js.

> [!IMPORTANT]
> **Especificación Canónica de Diseño Visual:**
> La dirección visual general oficial, tokens semánticos, paleta de colores, tipografía, micro-interacciones y checklists de calidad se encuentran detallados en:
> 👉 [`docs/direccion-visual-general.md`](file:///docs/direccion-visual-general.md)
>
> El inventario completo de vistas a refactorizar se encuentra en:
> 👉 [`docs/vistas-frontend.md`](file:///docs/vistas-frontend.md)
>
> Toda refactorización de vistas o componentes DEBE apegarse estrictamente a las especificaciones contenidas en dicho documento.

---

## 1. Principio Rector: Dirección Visual Académica e Institucional

* **Documento Base de Especificación:** Consultar siempre [`docs/direccion-visual-general.md`](file:///docs/direccion-visual-general.md).
* **Propósito**: La aplicación no es una landing comercial de marketing; es una plataforma institucional de gestión académica de postgrado.
* **Tono visual**:
  * Sobrio, limpio, confiable y funcional (estética inspirada en *Swiss Modernism 2.0* y herramientas SaaS editoriales).
  * Paleta cromática basada en tonos institucionales (azul marino profundo `#0F172A`, pizarra `#F8FAFC`, neutros limpios) y acentos semánticos de asistencia (esmeralda `#059669`, ámbar `#D97706`, carmesí `#DC2626`).
  * Contención visual (*Restraint*): evitar gradientes estridentes, animaciones de scroll innecesarias o radios de borde exagerados (`rounded-full` o `rounded-3xl`) en tarjetas principales y formularios.
  * Alta legibilidad de datos y cifras tabulares (`font-mono tabular-nums`) en horas, fechas y matrículas.

---

## 2. Matriz de Uso de Skills por Etapa y Caso

Toda tarea relacionada con análisis de pantallas, diseño de interfaz y maquetación debe guiarse por las skills instaladas en `.agents/skills/`:

| Etapa / Caso de Uso | Skills Obligatorias | Objetivo Operativo |
|---|---|---|
| **1. Análisis del listado y Dirección Visual Global** | `ui-ux-pro-max` | Generar el sistema de diseño (`MASTER.md`) bajo el perfil académico/dashboard, definiendo tokens de color, anti-patrones y pautas generales de la industria. |
| **2. Arquitectura de Layouts y Arquetipos de Pantalla** | `better-layout` | Clasificar y estructurar las vistas en dos macro-arquetipos: Portal Estudiante (mobile-first, transaccional) y Portal Admin (desktop-first, denso con sidebar). |
| **3. Jerarquía y Legibilidad Académica** | `better-typography` | Definir la escala de fuentes, espaciados, contrastes y números tabulares para tablas de asistencia, dashboards y reportes. |
| **4. Implementación y Mapeo de Componentes** | `shadcn` + `ui-styling` | Mapear cada vista a componentes atómicos oficiales (Radix UI + Tailwind CSS v4) en `src/components/ui/` para evitar CSS fragmentado o estilos duplicados. |
| **5. Criterios de Acabado y Micro-interacciones** | `apple-design` + `emil-design-eng` | Aplicar principios de jerarquía visual, elevación sutil, contención y micro-transiciones sobrias (150–200ms) en botones, tabs y modales. |
| **6. Feedback Transaccional de Asistencia** | `ask-sonner` | Estandarizar las notificaciones flotantes (toasts) para confirmación inmediata de marcado de asistencia, avisos de retraso y subida de calendarios. |
| **7. Auditoría y Control de Calidad Visual** | `better-accessibility` + `interface-review` | Auditar accesibilidad (WCAG 2.2 / contraste mínimo 4.5:1), navegación por teclado y alineación óptica antes de aprobar cada vista. |

---

## 3. Flujo Obligatorio al Procesar el Inventario de Vistas

Cuando se disponga del listado de vistas existentes de la aplicación, el agente encargado debe seguir estrictamente este orden:

### Paso 1: Consultar la Dirección Visual General Canónica (`docs/direccion-visual-general.md`)
* La dirección visual oficial para el dominio académico de postgrado está formalizada en [`docs/direccion-visual-general.md`](file:///docs/direccion-visual-general.md).
* Toda decisión sobre tokens de color (`primary`, `secondary`, `accent`, `muted`, `destructive`), tipografía y semántica de asistencia debe extraerse de dicho documento.
* Si se requiere consultar recomendaciones específicas adicionales de la base de datos de UI Pro Max:
  ```bash
  python .agents/skills/ui-ux-pro-max/scripts/search.py "academic education attendance dashboard university" --design-system -p "Sistema de Asistencia" --persist --output-dir .
  ```

### Paso 2: Segregar las Vistas por Arquetipo (`better-layout`)
1. **Arquetipo Portal Estudiante (`/asistencia`, `/historial`, `/login`)**:
   * Prioridad mobile-first (teléfono o tablet del alumno en aula).
   * Contenedores centrados con ancho máximo controlado (`max-w-md` o `max-w-lg`).
   * CTA principal unívoco y claro ("Confirmar Asistencia Hoy").
2. **Arquetipo Portal Administrativo (`/admin/dashboard`, `/admin/estudiantes`, `/admin/modulo/*`)**:
   * Prioridad desktop/laptop (operador o docente gestionando cursos).
   * Layout de aplicación con barra lateral colapsable, breadcrumbs y barra de acciones.
   * Tablas densas con búsqueda, filtrado por fechas y paginación rápida.
   * Modales y wizards paso a paso para importación de datos y previsualizaciones.

### Paso 3: Mapeo y Normalización de Componentes (`shadcn` + `ui-styling`)
* Cada pantalla del inventario debe asociarse a componentes de `src/components/ui/`:
  * Tablas de asistencias y estudiantes → `Table`, `Badge` (estados semánticos).
  * Formulario de marcado o importación → `Form`, `Input`, `Select`, `Button`.
  * Avisos y confirmaciones de asistencia → `Alert`, `Dialog` y `Sonner Toaster`.

### Paso 4: Calibrar Micro-interacciones y Feedback (`emil-design-eng` + `ask-sonner`)
* **Marcado de asistencia**: Al presionar marcar asistencia, el botón entra en estado de carga inmediata (`loading`), pasa a estado de éxito y dispara un toast claro de confirmación con Sonner.
* **Transiciones**: Únicamente transiciones sutiles (`transition-all duration-150 ease-out`). Cero efectos que demoren la interacción del usuario.

### Paso 5: Verificación de Calidad (`better-accessibility` + `interface-review`)
* Verificar que todos los estados de asistencia tengan suficiente contraste cromático y no dependan únicamente del color (incluir texto o icono descriptivo).
* Comprobar que los campos de formulario y botones posean anillos de foco visibles (`focus-visible:ring-2`).

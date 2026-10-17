# Regla: Componentes UI y Estilos con Tailwind CSS (Next.js)

Esta regla define los estándares de diseño atómico, accesibilidad y estilizado con Tailwind CSS para el sistema de asistencia.

---

## 1. Componentes UI Atómicos (`src/components/ui/`)

* Todos los componentes básicos de interfaz deben residir en `frontend/src/components/ui/` (estilo shadcn/ui):
  - `button.tsx`
  - `input.tsx`
  - `modal.tsx` / `dialog.tsx`
  - `table.tsx`
  - `badge.tsx` (para estados: Presente, Retraso, Falta)
  - `card.tsx`
* **Utilidad `cn`:** Usar `clsx` y `tailwind-merge` en `src/lib/utils.ts` para fusionar clases condicionales sin conflictos de especificidad CSS:
  ```typescript
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

---

## 2. Estados Visuales y Accesibilidad

* **Estados obligatorios:** Todo elemento interactivo debe definir estilos claros para:
  - `hover` (ej. `hover:bg-primary/90`)
  - `focus-visible` (anillo de foco visible para navegación por teclado: `focus-visible:ring-2 focus-visible:ring-offset-2`)
  - `disabled` (ej. `disabled:opacity-50 disabled:pointer-events-none`)
* **Feedback por color coherente:**
  - **Éxito / Asistencia a tiempo:** Verde (`text-emerald-600 bg-emerald-50 border-emerald-200`)
  - **Retraso / Advertencia:** Amarillo/Ámbar (`text-amber-600 bg-amber-50 border-amber-200`)
  - **Falta / Error:** Rojo (`text-rose-600 bg-rose-50 border-rose-200`)
  - **Neutral / Justificado:** Azul o Gris (`text-slate-600 bg-slate-50 border-slate-200`)

---

## 3. Diseño Responsivo (Mobile-First)

* Diseñar las vistas pensando en pantallas pequeñas (útil para trabajadores marcando asistencia en dispositivos móviles o tablets) y escalar con breakpoints:
  - `sm:` (640px)
  - `md:` (768px)
  - `lg:` (1024px)
# Regla: Manejo de Formularios y Estado en Frontend (Next.js)

Esta regla define los estándares de interacción de formularios, validación en el cliente y feedback visual hacia el usuario.

---

## 1. Patrón de Formularios Reactivos

* Utilizar validación de esquemas (Zod o React Hook Form) alineada con los DTOs de NestJS.
* **Feedback de estado en envíos:**
  - Deshabilitar botones de envío durante la petición (`disabled={isSubmitting}`).
  - Mostrar un spinner o indicador visual en el botón de acción (ej. "Guardando...").
  - Prevenir múltiples envíos accidentales por doble clic.

---

## 2. Separación de Estado: Server State vs Client State

* **Server State (Datos de la API):**
  - No duplicar datos traídos del backend en variables de estado local innecesarias (`useState`) si pueden resolverse mediante Server Components o librerías de fetching tipo TanStack Query o Server Actions.
* **Client State (Estado efímero de UI):**
  - Reservar `useState` exclusivamente para modales abiertos/cerrados, pestañas activas, inputs temporales de búsqueda o filtros visuales.

---

## 3. Experiencia de Usuario ante Respuestas del Backend

* **En caso de éxito (`success`):**
  - Cerrar modal/formulario si aplica.
  - Notificar con Toast de confirmación ("Empleado registrado correctamente").
  - Invalidar o refrescar la lista de datos (`router.refresh()`).
* **En caso de falla (`fail`):**
  - Resaltar los campos específicos con bordes rojos y mostrar el mensaje retornado por el backend debajo del input correspondiente.
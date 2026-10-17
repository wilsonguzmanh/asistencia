# Regla: Arquitectura de Software Frontend (Next.js App Router + Feature-Sliced)

Esta regla define la arquitectura modular del frontend y las responsabilidades por carpeta para que la IA sepa exactamente dónde colocar nuevos componentes, páginas y hooks.

---

## 1. Dónde ubicar nuevos archivos y carpetas

El enrutador (`frontend/src/app/`) debe mantenerse delgado. La lógica de negocio, vistas ricas y llamadas a la API residen en `frontend/src/features/<feature-name>/`.

```text
frontend/src/
├── app/                             # Capa de Enrutamiento (App Router)
│   ├── (auth)/                      # Grupo de rutas de autenticación
│   │   └── login/page.tsx
│   ├── (dashboard)/                 # Grupo de rutas de la aplicación
│   │   ├── layout.tsx               # Shell (Sidebar, Navbar)
│   │   ├── attendance/page.tsx      # Ruta /attendance (delgada, importa el feature)
│   │   └── employees/page.tsx       # Ruta /employees
│   ├── error.tsx                    # Error boundary global
│   ├── loading.tsx                  # Loading skeleton global
│   └── not-found.tsx                # Página 404
├── features/                        # Módulos de negocio
│   └── <nombre-feature>/            # Ej: attendance, employees, shifts
│       ├── components/              # Componentes de la feature (AttendanceTable, CheckInModal)
│       ├── hooks/                   # Custom hooks (useAttendance, useCheckIn)
│       ├── services/                # Llamadas HTTP tipadas (<feature>.service.ts)
│       └── types/                   # Modelos TypeScript (<feature>.types.ts)
├── components/                      # Componentes reutilizables generales
│   ├── ui/                          # Componentes atómicos (Button, Input, Modal, Table, Badge)
│   └── layout/                      # Navbar, Sidebar, Footer
├── lib/                             # Clientes y librerías transversales
│   ├── api-client.ts                # Cliente HTTP tipado que desempaqueta el sobre del backend
│   └── utils.ts                     # Funciones de utilidad (cn para Tailwind, formateo de fechas)
├── hooks/                           # Hooks globales reutilizables
└── types/                           # Tipos globales (ApiResponse<T>, UserSession)
```

---

## 2. Server Components vs Client Components

* **Por defecto, todo componente en `src/app/` y `src/features/` es un Server Component** a menos que requiera interactividad del navegador.
* **Usar `'use client'` estrictamente cuando el componente requiera:**
  - Hooks de estado o ciclo de vida (`useState`, `useEffect`, `useReducer`, `useRef`).
  - Event listeners en el DOM (`onClick`, `onChange`, `onSubmit`).
  - APIs del navegador (`localStorage`, geolocalización, cámara para marcaciones).
* **Buena práctica:** Empujar los componentes `'use client'` a las hojas del árbol de componentes (ej. el botón de marcación o el formulario modal es `'use client'`, pero la página contenedora es un Server Component).
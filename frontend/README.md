# Frontend del Sistema de Registro y Control de Asistencia

Aplicación web desarrollada con **Next.js** (App Router), **React** y **Tailwind CSS** para la interfaz de usuario del Sistema de Asistencia de Estudiantes y Administración.

---

## 🛠️ Stack Tecnológico

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Lenguaje:** TypeScript (modo estricto)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Cliente API:** Cliente HTTP tipado con soporte de desacoplamiento para respuestas estándar `{ status, message, data }`

---

## 🚀 Puesta en Marcha (Instalación y Ejecución)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea tu archivo `.env.local` a partir de `.env.local.example`:
```bash
cp .env.local.example .env.local
```
Contenido por defecto:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Por defecto, la aplicación estará disponible en: `http://localhost:3001` (o `http://localhost:3000`).

---

## 🔑 Credenciales para Pruebas en el Frontend

Para probar las pantallas mientras desarrollas, utiliza los datos cargados por la semilla del backend (`npm run seed` en la carpeta `backend`):

* **Portal del Estudiante (`/` o `/estudiante/login`):**
  * Acceso rápido con matrícula: `1001` (o correo `juan@gmail.com`).
  * Sin contraseña requerida (**RF-01**).
  * Hoy es fecha de clase programada en la semilla, por lo que el botón de marcación de asistencia estará habilitado para probar.
* **Portal del Administrador (`/admin/login`):**
  * Usuario / Correo: `admin@sistema.com` (o `admin`).
  * Contraseña: `admin123`.

---

## 🏛️ Arquitectura Frontend (App Router)

```text
src/
├── app/                             # Rutas del Sistema
│   ├── (auth)/                      # Rutas de autenticación
│   │   ├── login/page.tsx           # Login de estudiantes (RF-01)
│   │   └── admin/login/page.tsx     # Login administrativo (RF-02)
│   ├── admin/                       # Panel privado administrativo
│   │   ├── modulo/importar/page.tsx # Carga de Excel (RF-11, RF-12)
│   │   ├── estudiantes/page.tsx     # Búsqueda y nómina (RF-06)
│   │   └── asistencias/page.tsx     # Planilla general (RF-08, RF-07)
│   └── estudiante/                  # Portal del estudiante
│       └── asistencia/page.tsx      # Botón de marcar hoy e historial (RF-03, RF-05)
├── components/                      # Componentes reutilizables UI
│   ├── ui/                          # Botones, tablas, inputs, alertas, modales
│   └── layout/                      # Navbar, Sidebar, Footer
├── lib/                             # Clientes HTTP y utilidades
│   └── api-client.ts                # Cliente Axios / Fetch con interceptor
└── types/                           # Definiciones TypeScript de entidades y DTOs
```

---

## 📚 Documentación para Desarrolladores

* **Repartición de Historias (2 Devs):** [`../docs/reparticion-2-programadores.md`](../docs/reparticion-2-programadores.md)
* **Historias de Usuario y Criterios BDD:** [`../docs/historias-de-usuario.md`](../docs/historias-de-usuario.md)
* **Diagrama de Clases UML:** [`../docs/diagrama-de-clases.md`](../docs/diagrama-de-clases.md)
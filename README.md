# Sistema Web de Registro y Control de Asistencia (IaC Asistencia)

Aplicación web modular para el registro, consulta y administración de asistencias académicas por módulos. Diseñada bajo una arquitectura desacoplada (*Feature-Driven* y *App Router*) con soporte para trabajo en paralelo de dos o más desarrolladores.

---

## 🛠️ Stack Tecnológico

* **Backend:** [NestJS](https://nestjs.com/) (TypeScript, Express) + [TypeORM](https://typeorm.io/) + [PostgreSQL](https://www.postgresql.org/)
* **Frontend:** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript) + [Tailwind CSS](https://tailwindcss.com/)
* **Seguridad:** Autenticación JWT + encriptación de contraseñas con `bcrypt`
* **Validación:** `class-validator`, `class-transformer`

---

## 📋 Requisitos Previos

1. **Node.js:** Versión 18.x o superior (`node -v`).
2. **NPM:** Versión 9.x o superior (`npm -v`).
3. **PostgreSQL:** Servidor PostgreSQL (versión 14+) corriendo en `localhost:5432`.
   * Base de datos requerida: `asistencia_db` (o el nombre configurado en `.env`).
   * Usuario por defecto: `postgres` / Contraseña: `postgres`.

---

## 🚀 Guía de Inicio Rápido (Setup Local)

### Opción Rápida: Levantar Todo con un Solo Comando (Raíz)

Desde la raíz del proyecto:
```bash
# Iniciar Backend y Frontend en paralelo:
npm run dev
# O en Windows hacer doble clic en: start.bat
```

* **Frontend Web:** [http://localhost:3001](http://localhost:3001)
* **Backend API:** [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
* **Swagger Docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

### Opción Manual: Terminales Separadas

#### 1. Configurar y Levantar el Backend (NestJS)

```bash
# 1. Ingresar al directorio del backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ajustar credenciales de PostgreSQL si difieren)
cp .env.example .env

# 4. EJECUTAR EL PASO CERO (Semilla de Base de Datos)
# Este comando sincroniza las tablas en Postgres e inserta el admin, módulo y estudiantes de prueba
npm run seed

# 5. Iniciar el servidor en modo desarrollo (Hot-Reload)
npm run start:dev
```

* **URL del Backend API:** `http://localhost:3000/api/v1`
* **Documentación Swagger UI:** `http://localhost:3000/api/docs`

---

### 2. Configurar y Levantar el Frontend (Next.js)

En una **segunda terminal**:

```bash
# 1. Ingresar al directorio del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local

# 4. Iniciar el servidor de desarrollo
npm run dev
```

* **URL de la Aplicación Web:** `http://localhost:3001` (o `http://localhost:3000` si está libre).

---

## 🔑 Credenciales y Datos de Prueba (Cargados por `npm run seed`)

Al ejecutar `npm run seed`, la base de datos queda inmediatamente aprovisionada con datos reales para pruebas:

| Rol | Identificador / Usuario | Contraseña | Propósito |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@sistema.com` (o usuario `admin`) | `admin123` | Acceso al panel administrativo, importación de Excel y control general. |
| **Estudiante 1** | `juan@gmail.com` (o registro `1001`) | *Sin contraseña* (RF-01) | Marcación de asistencia de HOY y consulta de historial personal. |
| **Estudiante 2** | `maria@gmail.com` (o registro `1002`) | *Sin contraseña* (RF-01) | Pruebas de marcación concurrente y unicidad. |
| **Estudiante 3** | `carlos@gmail.com` (o registro `1003`) | *Sin contraseña* (RF-01) | Pruebas de inasistencia/faltas automáticas. |

### Calendario de Clases Sembrado:
* **Módulo Activo:** `[DCID-V1E1-M2] Módulo Piloto: DevOps & Infraestructura como Código`
* **Fecha de HOY:** Programada de 18:00 a 21:00 (botón de asistencia **habilitado** para pruebas inmediatas).
* **2 Fechas Pasadas:** Para probar el cálculo de faltas automáticas e historial.
* **2 Fechas Futuras:** Para comprobar que el botón permanezca deshabilitado fuera de fecha.

---

## 👥 Guía para Desarrolladores (Trabajo en Paralelo)

Si estás trabajando en este proyecto con tu compañero de equipo, consulta la documentación en [`docs/`](docs/README.md) antes de empezar a programar:

| Documento | ¿Qué encontrarás aquí? |
| :--- | :--- |
| [**Repartición para 2 Programadores**](docs/reparticion-2-programadores.md) | **¡EMPIEZA AQUÍ!** Guía exacta de qué historias toma el Programador 1 y cuáles el Programador 2 para avanzar en paralelo sin bloqueos ni conflictos en Git. |
| [**Historias de Usuario**](docs/historias-de-usuario.md) | Catálogo de historias (`US-01` a `US-15`) con criterios de aceptación BDD (*Given-When-Then*), especificaciones de frontend y contratos API. |
| [**Diagrama de Clases**](docs/diagrama-de-clases.md) | Modelo UML completo en Mermaid, entidades TypeORM y mapeo de reglas de negocio (`RN-01` a `RN-08`). |
| [**Dependencias y Paralelización**](docs/dependencias-y-paralelizacion.md) | Grafo visual de dependencias, camino crítico y matriz RACI. |
| [**Despliegue Render & Vercel**](docs/despliegue-render-vercel.md) | Guía detallada para producción: Backend + PostgreSQL en Render y Frontend en Vercel. |

---

## 📁 Estructura del Repositorio

```text
iac-asistencia/
├── backend/                  # API RESTful con NestJS + TypeORM
│   ├── src/
│   │   ├── common/           # Entidad base (AppBaseEntity), enums, filtros, interceptores
│   │   ├── config/           # Configuración de base de datos PostgreSQL
│   │   ├── database/         # Barrel de entidades y seed.ts
│   │   └── features/         # Módulos de dominio (auth, modules, students, attendances, etc.)
│   ├── .env.example
│   └── package.json
├── frontend/                 # Aplicación Web Next.js (App Router)
│   ├── src/
│   │   ├── app/              # Rutas públicas y privadas (Next.js App Router)
│   │   └── components/       # Componentes de interfaz
│   ├── .env.local.example
│   └── package.json
├── docs/                     # Documentación de arquitectura, historias y paralelización
│   ├── diagrama-de-clases.md
│   ├── historias-de-usuario.md
│   ├── dependencias-y-paralelizacion.md
│   ├── reparticion-2-programadores.md
│   └── README.md
├── .gitignore
└── README.md
```
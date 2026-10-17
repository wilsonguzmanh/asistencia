# Guía de Despliegue en Producción: Render (Backend + DB) y Vercel (Frontend)

Este documento detalla los pasos para desplegar el **Backend (NestJS)** y la **Base de Datos (PostgreSQL)** en **Render**, y el **Frontend (Next.js)** en **Vercel**.

---

## 🏗️ Arquitectura de Despliegue

```text
       [ Cliente / Navegador ]
                 │
                 ▼
       ┌───────────────────┐
       │      Vercel       │  (Frontend Next.js App Router)
       │  mi-app.vercel.app│
       └─────────┬─────────┘
                 │ NEXT_PUBLIC_API_URL
                 ▼
       ┌───────────────────┐
       │      Render       │  (Backend NestJS API REST)
       │ api.onrender.com  │
       └─────────┬─────────┘
                 │ DATABASE_URL (SSL activado)
                 ▼
       ┌───────────────────┐
       │ Render PostgreSQL │  (Base de datos administrada)
       └───────────────────┘
```

---

## 🚀 Parte 1: Base de Datos y Backend en Render

Tienes dos formas de desplegar en Render:

### Opción A: Despliegue Automático con Blueprint (`render.yaml`) - Recomendada

El repositorio incluye el archivo [`render.yaml`](../render.yaml) preconfigurado.

1. Inicia sesión en [Render Dashboard](https://dashboard.render.com/).
2. Haz clic en **New +** > **Blueprint**.
3. Conecta este repositorio de GitHub/GitLab.
4. Render detectará automáticamente `render.yaml` y creará:
   - La base de datos PostgreSQL: `asistencia-db` (versión gratuita o starter).
   - El servicio web: `iac-asistencia-backend`.
5. Render inyectará automáticamente `DATABASE_URL` desde la base de datos al backend.
6. Haz clic en **Apply**.

---

### Opción B: Configuración Manual en el Dashboard de Render

Si prefieres crearlos paso a paso:

#### 1. Crear la Base de Datos PostgreSQL
1. En Render, haz clic en **New +** > **PostgreSQL**.
2. Configuración:
   - **Name:** `asistencia-db`
   - **Database:** `asistencia_db`
   - **User:** `asistencia_user` (no usar nombres reservados como postgres)
   - **Region:** Selecciona la más cercana (ej. *Oregon* o *Ohio*).
   - **Plan:** Free o Starter.
3. Haz clic en **Create Database**.
4. Una vez creada, copia el valor de **Internal Database URL** (o External Database URL si vas a conectar desde fuera de Render).

#### 2. Crear el Servicio Web para el Backend
1. En Render, haz clic en **New +** > **Web Service**.
2. Selecciona tu repositorio.
3. Configuración del servicio:
   - **Name:** `iac-asistencia-backend`
   - **Region:** La misma región elegida para la base de datos.
   - **Branch:** `develop` (o `main`)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install --include=dev && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Plan:** Free o Starter.
4. En la sección **Environment Variables**, añade:

| Variable | Valor | Descripción |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Entorno de producción |
| `PORT` | `10000` | Puerto asignado por Render (o dejar que Render lo defina) |
| `DATABASE_URL` | *(Pegar la Internal Database URL de tu PostgreSQL en Render)* | Conexión con PostgreSQL |
| `DB_SSL` | `true` | Obligatorio para conexiones en la nube con Render |
| `DB_SYNCHRONIZE` | `true` | Crea automáticamente las tablas de TypeORM |
| `JWT_SECRET` | *(Generar una cadena aleatoria segura, ej. `mi-clave-super-secreta-2026`)* | Clave para firmar tokens JWT |
| `JWT_EXPIRATION` | `24h` | Duración del token |
| `FRONTEND_URL` | `https://tu-app-en-vercel.vercel.app` | URL de tu frontend en Vercel para permitir CORS |

5. Haz clic en **Create Web Service**.

---

### 3. Ejecutar la Semilla de Datos en Producción (`seed`)

Una vez que el backend y la base de datos estén desplegados en Render:

1. Ve a tu servicio `iac-asistencia-backend` en Render.
2. Abre la pestaña **Shell**.
3. Ejecuta el comando de semilla de producción:
   ```bash
   npm run seed:prod
   ```
4. Este comando poblará las tablas con el usuario Administrador (`admin@sistema.com` / `admin123`), el módulo piloto activo, los 3 estudiantes y las clases programadas.

---

## ⚡ Parte 2: Frontend en Vercel

1. Inicia sesión en [Vercel Dashboard](https://vercel.com/).
2. Haz clic en **Add New...** > **Project**.
3. Importa tu repositorio Git.
4. En la pantalla de configuración del proyecto:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Haz clic en *Edit* y selecciona **`frontend`** (¡Muy importante!).
   - **Build Command:** `npm run build` (o dejar por defecto).
   - **Output Directory:** `.next` (por defecto).
   - **Install Command:** `npm install` (por defecto).
5. Despliega la sección **Environment Variables** y añade:

| Variable | Valor | Ejemplo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://<TU-BACKEND-RENDER>.onrender.com/api/v1` | `https://iac-asistencia-backend.onrender.com/api/v1` |

6. Haz clic en **Deploy**.
7. Vercel compilará la aplicación y te entregará una URL pública (ejemplo: `https://iac-asistencia.vercel.app`).

---

## 🔄 Parte 3: Conectar CORS (Frontend Vercel ➔ Backend Render)

1. Con la URL que te dio Vercel (ej. `https://iac-asistencia.vercel.app`):
2. Vuelve al Dashboard de Render > servicio `iac-asistencia-backend` > **Environment**.
3. Actualiza la variable `FRONTEND_URL` con tu dominio de Vercel:
   ```env
   FRONTEND_URL=https://iac-asistencia.vercel.app
   ```
4. Render reiniciará automáticamente el servicio con la nueva variable.
5. ¡Listo! Todo el sistema estará 100% operativo en la nube.

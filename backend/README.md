# API del Sistema de Registro y Control de Asistencia (Backend)

API RESTful desarrollada con **NestJS** y **TypeORM** sobre **PostgreSQL** para la gestión de módulos académicos, importación de nóminas, marcación y control de asistencias, y auditoría inmutable.

---

## 🛠️ Stack Tecnológico

* **Framework:** [NestJS](https://nestjs.com/) (TypeScript modo estricto)
* **ORM:** [TypeORM](https://typeorm.io/)
* **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) (puerto 5432)
* **Criptografía:** `bcrypt` para contraseñas de administradores
* **Validación:** `class-validator` y `class-transformer`

---

## 🚀 Puesta en Marcha (Instalación y Ejecución)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea tu archivo `.env` a partir de `.env.example`:
```bash
cp .env.example .env
```
Verifica que las credenciales coincidan con tu servidor local de PostgreSQL:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=asistencia_db
DB_SYNCHRONIZE=true
```

### 3. Ejecutar el Script de Semilla Inicial (Paso Cero)
Este comando sincroniza las tablas en PostgreSQL e inserta los datos de prueba acordados para trabajar en paralelo:
```bash
npm run seed
```

> **Datos cargados por el seed:**
> * **Administrador:** `admin@sistema.com` (o usuario `admin`) con clave `admin123`.
> * **Módulo activo:** `[DCID-V1E1-M2] Módulo Piloto: DevOps & Infraestructura como Código`.
> * **3 Estudiantes:** `1001` (`juan@gmail.com`), `1002` (`maria@gmail.com`), `1003` (`carlos@gmail.com`).
> * **5 Fechas de clase:** Pasadas, **la fecha de hoy** (habilitada para marcaciones inmediatas) y futuras.

### 4. Iniciar el servidor
```bash
# Modo desarrollo con recarga en vivo (hot-reload)
npm run start:dev

# Compilar para producción
npm run build

# Iniciar compilado
npm run start:prod
```

La API estará disponible en: `http://localhost:3000/api/v1`

---

## 📑 Documentación Interactiva con Swagger (OpenAPI)

La API cuenta con documentación interactiva generada con OpenAPI / Swagger:

* **URL de Swagger UI:** [`http://localhost:3000/api/docs`](http://localhost:3000/api/docs)

### Capacidades configuradas:
* **Exploración y Pruebas en Vivo:** Permite probar los endpoints directamente desde el navegador sin necesidad de Postman o cURL.
* **Autenticación Bearer JWT:** Botón `Authorize` en la parte superior para ingresar el token JWT y probar rutas administrativas protegidas.
* **Etiquetas y Módulos organizados por Épica:**
  * `Auth`: Login de Administrador y Acceso de Estudiantes (`US-01`, `US-02`, `US-03`).
  * `Modules`: Importación vía Excel, preview y activación transaccional de módulos (`US-04`, `US-05`, `US-06`, `US-07`).
  * `Attendances`: Marcación de asistencia hoy, historial de faltas y matriz general (`US-08`, `US-09`, `US-11`, `US-12`).
  * `Students`: Consulta y nómina de estudiantes del módulo activo (`US-10`).
  * `Audit`: Bitácora inmutable de eventos y auditoría (`US-14`, `US-15`).

## 🏛️ Arquitectura Feature-Driven

El código sigue una estructura modular orientada a características de negocio:

```text
src/
├── common/                          # Transversal y reutilizable
│   ├── entities/                    # AppBaseEntity (auditoría temporal y soft delete)
│   ├── enums/                       # ModuleStatus, AttendanceStatus, UserRole, ActivityAction
│   ├── exceptions/                  # AppBusinessException
│   ├── filters/                     # GlobalExceptionFilter
│   ├── interceptors/                # TransformResponseInterceptor
│   └── middleware/                  # CorrelationIdMiddleware
├── config/                          # Configuración de base de datos PostgreSQL
├── database/                        # Exportador central de entidades y script seed.ts
└── features/                        # Características de negocio
    ├── auth/                        # Autenticación de Admin y Estudiantes
    ├── modules/                     # Gestión y activación de módulos
    ├── students/                    # Nómina de estudiantes
    ├── schedules/                   # Calendario de clases
    ├── attendances/                 # Marcación y matriz de asistencias
    └── activity-logs/               # Registro inmutable de auditoría
```

---

## 📦 Estándar de Respuestas HTTP (JSend Extendido)

Todas las respuestas de la API están estandarizadas:

1. **`success` (HTTP 2xx):**
   ```json
   {
     "status": "success",
     "message": "Operación completada exitosamente",
     "data": { ... }
   }
   ```
2. **`fail` (HTTP 4xx - Errores de Dominio o Validación):**
   ```json
   {
     "status": "fail",
     "code": "STUDENT_NOT_FOUND",
     "message": "Estudiante no registrado en el módulo activo",
     "data": null
   }
   ```
3. **`error` (HTTP 5xx - Error Interno de Servidor):**
   ```json
   {
     "status": "error",
     "code": "INTERNAL_SERVER_ERROR",
     "message": "Error interno del servidor",
     "data": null
   }
   ```

---

## 📚 Documentación para Desarrolladores

* **Repartición de Historias (2 Devs):** [`../docs/reparticion-2-programadores.md`](../docs/reparticion-2-programadores.md)
* **Historias de Usuario y Contratos API:** [`../docs/historias-de-usuario.md`](../docs/historias-de-usuario.md)
* **Diagrama de Clases UML:** [`../docs/diagrama-de-clases.md`](../docs/diagrama-de-clases.md)
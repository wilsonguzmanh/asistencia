# Regla: Arquitectura de Software Backend (NestJS Feature-Driven)

Esta regla define la arquitectura modular (*Feature-Driven*) del backend y las responsabilidades exclusivas de cada capa para que cualquier nueva funcionalidad se ubique en el lugar correspondiente.

---

## 1. Dónde ubicar nuevos archivos y carpetas

Toda nueva funcionalidad del negocio debe residir dentro de `backend/src/features/<feature-name>/`. Los componentes transversales van en `backend/src/common/`.

```text
backend/src/
├── common/                          # Transversal y reutilizable
│   ├── entities/                    # Entidad base (AppBaseEntity)
│   ├── exceptions/                  # AppBusinessException
│   ├── filters/                     # GlobalExceptionFilter
│   ├── interceptors/                # TransformResponseInterceptor
│   ├── pipes/                       # Pipes globales de validación
│   ├── guards/                      # Guards de seguridad y roles
│   ├── decorators/                  # Decoradores personalizados (@CurrentUser)
│   └── utils/                       # Utilidades generales
├── config/                          # Configuración de BD y entorno
└── features/                        # Características de negocio
    └── <nombre-feature>/            # Ej: attendance, employees, shifts, departments
        ├── dto/                     # create-<feature>.dto.ts, update-<feature>.dto.ts
        ├── entities/                # <feature>.entity.ts (hereda de AppBaseEntity)
        ├── exceptions/              # <feature>-not-found.exception.ts, etc.
        ├── <feature>.controller.ts  # Capa HTTP (rutas, DTOs, delegación)
        ├── <feature>.service.ts     # Lógica de negocio y persistencia
        └── <feature>.module.ts      # Módulo NestJS con TypeOrmModule.forFeature
```

---

## 2. Separación Estricta de Responsabilidades

### 2.1 `Controller` (`<feature>.controller.ts`)
* **Responsabilidad:** Transporte HTTP exclusivamente.
* **Permitido:** Decoradores de rutas (`@Get`, `@Post`, `@Patch`), inyección del `Service`, recibir DTOs con `@Body`, `@Param`, `@Query`, y retornar el resultado directo del `Service`.
* **PROHIBIDO:** Ejecutar consultas TypeORM directamente, escribir lógica de negocio, o manejar bloques `try/catch` para silenciar errores.

### 2.2 `Service` (`<feature>.service.ts`)
* **Responsabilidad:** Núcleo de lógica de negocio y orquestación.
* **Permitido:** Inyectar repositorios (`@InjectRepository`), aplicar validaciones de dominio, orquestar múltiples operaciones, usar transacciones con `QueryRunner`, y lanzar excepciones de negocio (`AppBusinessException`).
* **PROHIBIDO:** Acceder a objetos HTTP como `Request` o `Response` de Express. El servicio debe ser agnóstico del protocolo de transporte.

### 2.3 `Entity` (`<feature>.entity.ts`)
* **Responsabilidad:** Mapeo objeto-relacional con la base de datos mediante TypeORM.
* **Permitido:** Extender de `AppBaseEntity`, definir columnas con tipos explícitos (`varchar`, `uuid`, `timestamp with time zone`), relaciones (`@ManyToOne`, `@OneToMany`) e índices (`@Index`).

### 2.4 `DTO` (`dto/create-<feature>.dto.ts`)
* **Responsabilidad:** Contrato y validación de entrada/salida.
* **Permitido:** Decoradores de `class-validator` (`@IsString()`, `@IsNotEmpty()`, `@IsUUID()`) y `class-transformer` (`@Type()`). Usar `@nestjs/mapped-types` (`PartialType`) para updates.

### 2.5 `Exceptions` (`exceptions/<feature>-*.exception.ts`)
* **Responsabilidad:** Representar errores controlados de dominio.
* **Permitido:** Extender de `AppBusinessException` indicando mensaje, código de error (`string`) y `HttpStatus` adecuado.
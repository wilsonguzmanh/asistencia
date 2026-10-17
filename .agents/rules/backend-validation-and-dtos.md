# Regla: Validación Estricta y DTOs (NestJS)

Esta regla define los estándares de validación de entrada, estructuración de DTOs y tipado seguro para endpoints de la API.

---

## 1. Configuración Global de Validación (`ValidationPipe`)

En `main.ts`, el `ValidationPipe` debe configurarse con:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Elimina propiedades no definidas en el DTO
    forbidNonWhitelisted: true,  // Arroja error si el cliente envía campos desconocidos
    transform: true,              // Transforma payloads a las clases DTO tipadas
    transformOptions: {
      enableImplicitConversion: false, // Forzar uso explícito de @Type()
    },
  }),
);
```

---

## 2. Convención para DTOs de Creación y Actualización

Cada entidad debe disponer de sus DTOs correspondientes en su carpeta `dto/`:

### 2.1 DTO de Creación (`create-<feature>.dto.ts`)
```typescript
import { IsString, IsNotEmpty, IsEmail, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUUID('4')
  @IsOptional()
  departmentId?: string;
}
```

### 2.2 DTO de Actualización (`update-<feature>.dto.ts`)
Usar siempre `PartialType` de `@nestjs/mapped-types` para reutilizar las validaciones de creación marcándolas como opcionales:

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
```

---

## 3. DTOs de Paginación y Filtrado (`pagination-query.dto.ts`)

Para endpoints con listados paginados:

```typescript
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
```
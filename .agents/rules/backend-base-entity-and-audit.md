# Regla: Entidad Base y Auditoría Temporal (NestJS + TypeORM)

Esta regla define el estándar obligatorio de auditoría temporal y borrado lógico que deben implementar las entidades del backend.

---

## 1. La Clase Base Abstracta (`AppBaseEntity`)

Ubicación: `backend/src/common/entities/app-base.entity.ts`

Toda entidad de persistencia del sistema debe extender obligatoriamente de `AppBaseEntity`:

```typescript
import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class AppBaseEntity {
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date | null;
}
```

---

## 2. Flexibilidad de Claves Primarias (PK)

* `AppBaseEntity` **NO** incluye el campo `id`.
* Cada entidad concreta es responsable de definir su propia clave primaria de acuerdo a su caso de uso:
  - **UUID v4 (Recomendado):**
    ```typescript
    @PrimaryGeneratedColumn('uuid')
    id: string;
    ```
  - **Numérico Auto-incremental:**
    ```typescript
    @PrimaryGeneratedColumn('increment')
    id: number;
    ```
  - **Clave Primaria Compuesta o Código de Negocio:** Definida según los requerimientos de la tabla.

---

## 3. Directrices de Auditoría y Soft Delete

1. **Gestión Automática del Motor:** `createdAt` y `updatedAt` son administrados por TypeORM y la base de datos automáticamente en cada inserción o modificación.
2. **Prohibición de `DELETE` Físico Innecesario:** Para entidades principales del dominio (empleados, asistencias, departamentos), utilizar `repository.softDelete()` o `repository.softRemove()`.
3. **Restauración:** Cuando se requiera reactivar un registro previamente eliminado, utilizar `repository.restore(id)`.
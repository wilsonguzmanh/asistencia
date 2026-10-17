# Regla: Buenas Prácticas con TypeORM y Base de Datos (NestJS)

Esta regla rige el diseño de entidades, consultas de persistencia, relaciones y transacciones con TypeORM en las operaciones CRUD.

---

## 1. Diseño de Entidades y Columnas

* **Tipos explícitos:** Especificar siempre el tipo de columna y longitud (`@Column({ type: 'varchar', length: 150 })`, `@Column({ type: 'timestamp with time zone' })`).
* **Nombres de columna en snake_case:** Usar la propiedad `name: 'column_name'` en `@Column` y `@JoinColumn` para consistencia en la base de datos SQL mientras el modelo TypeScript usa camelCase.
* **Índices estratégicos:** Añadir `@Index()` sobre columnas frecuentemente consultadas en filtros o claves foráneas (ej. `employee_id`, `date`, `document_number`).

---

## 2. Prevención de Consultas N+1

* **Evitar cargas ansiosas descontroladas (`eager: true`):** No usar `eager: true` de forma masiva en relaciones.
* **Uso explícito de `relations` o `QueryBuilder`:**
  ```typescript
  // En consultas simples:
  this.attendanceRepository.find({
    where: { employeeId },
    relations: { employee: true },
  });

  // En consultas complejas o con agregaciones:
  this.attendanceRepository
    .createQueryBuilder('att')
    .leftJoinAndSelect('att.employee', 'emp')
    .where('att.date = :date', { date })
    .getMany();
  ```

---

## 3. Transacciones Atómicas con `QueryRunner`

Cuando una operación involucre modificar múltiples tablas o crear registros dependientes (ej. crear empleado y asignar turno inicial):

```typescript
async createWithInitialShift(dto: CreateEmployeeDto): Promise<Employee> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const employee = queryRunner.manager.create(Employee, dto);
    const savedEmployee = await queryRunner.manager.save(employee);

    // Operación dependiente
    const shift = queryRunner.manager.create(ShiftAssignment, {
      employeeId: savedEmployee.id,
      shiftId: dto.initialShiftId,
    });
    await queryRunner.manager.save(shift);

    await queryRunner.commitTransaction();
    return savedEmployee;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

---

## 4. Borrado Lógico (Soft Delete)

* Utilizar siempre `repository.softDelete(id)` o `repository.softRemove(entity)` para entidades auditables.
* El método `repository.find()` y `findOne()` de TypeORM excluye automáticamente los registros con `deleted_at IS NOT NULL`.
* Si se requiere consultar registros eliminados, utilizar explícitamente `{ withDeleted: true }`.
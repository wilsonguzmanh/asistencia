# Regla: Prácticas de Pruebas Unitarias en Backend (NestJS + Jest)

Esta regla define los estándares para pruebas unitarias de servicios de negocio y controladores utilizando Jest.

---

## 1. Convención de Ubicación de Pruebas

* Toda prueba unitaria debe ubicarse junto al archivo testeado con la extensión `*.spec.ts`.
* Ejemplo:
  - `employees.service.ts` -> `employees.service.spec.ts`
  - `employees.controller.ts` -> `employees.controller.spec.ts`

---

## 2. Aislamiento con Mocks de Repositorios TypeORM

Los tests unitarios de servicios no deben conectarse a una base de datos real. Deben simular el repositorio TypeORM mediante `getRepositoryToken`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { EmployeeNotFoundException } from './exceptions/employee-not-found.exception';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  it('debe arrojar EmployeeNotFoundException si el empleado no existe', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('invalid-id')).rejects.toThrow(
      EmployeeNotFoundException,
    );
  });
});
```

---

## 3. Cobertura Requerida por Caso de Uso

Para cada método del servicio, escribir al menos:
1. **Camino feliz:** Ejecución satisfactoria y retorno de datos esperado.
2. **Camino de excepción:** Validación de que lanza la excepción adecuada de `AppBusinessException` (ej. `NotFoundException`, `ConflictException`) ante entradas inválidas o colisiones de datos.
import * as ExcelJS from 'exceljs';
import { ExcelParserService } from './excel-parser.service';
import { ExcelValidationException } from '../exceptions/excel-validation.exception';

describe('ExcelParserService', () => {
  let service: ExcelParserService;

  beforeEach(() => {
    service = new ExcelParserService();
  });

  const createExcelBuffer = async (
    headers: string[],
    rows: (string | number)[][],
  ): Promise<Buffer> => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estudiantes');
    worksheet.addRow(headers);
    rows.forEach((row) => worksheet.addRow(row));
    const rawBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(rawBuffer);
  };

  it('debe parsear exitosamente un archivo Excel con columnas y datos válidos', async () => {
    const buffer = await createExcelBuffer(
      ['Número de registro', 'Nombre completo', 'Correo electrónico'],
      [
        ['1001', 'Juan Pérez', 'juan@gmail.com'],
        ['1002', 'María López', 'maria@gmail.com'],
      ],
    );

    const result = await service.parseStudentsExcel(buffer);

    expect(result.hasErrors).toBe(false);
    expect(result.totalRows).toBe(2);
    expect(result.validRowsCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].registrationNumber).toBe('1001');
    expect(result.data[0].fullName).toBe('Juan Pérez');
    expect(result.data[0].email).toBe('juan@gmail.com');
  });

  it('debe detectar matrículas duplicadas en el archivo y reportar el error por fila (RN-02)', async () => {
    const buffer = await createExcelBuffer(
      ['Número de registro', 'Nombre completo', 'Correo electrónico'],
      [
        ['1001', 'Juan Pérez', 'juan@gmail.com'],
        ['1002', 'María López', 'maria@gmail.com'],
        ['1001', 'Juan Pérez Clon', 'juan.clon@gmail.com'], // Duplicado en fila 4
      ],
    );

    const result = await service.parseStudentsExcel(buffer);

    expect(result.hasErrors).toBe(true);
    expect(result.errorCount).toBe(1);
    expect(result.errors[0].row).toBe(4);
    expect(result.errors[0].field).toBe('registrationNumber');
    expect(result.errors[0].message).toContain('duplicado');
    expect(result.data).toHaveLength(0); // No retorna datos parciales si hay errores
  });

  it('debe reportar error cuando el formato de correo electrónico es inválido', async () => {
    const buffer = await createExcelBuffer(
      ['Número de registro', 'Nombre completo', 'Correo electrónico'],
      [['1001', 'Carlos Ruiz', 'correo-invalido-sin-arroba']],
    );

    const result = await service.parseStudentsExcel(buffer);

    expect(result.hasErrors).toBe(true);
    expect(result.errorCount).toBe(1);
    expect(result.errors[0].field).toBe('email');
    expect(result.errors[0].message).toContain('correo electrónico no es válido');
  });

  it('debe rechazar archivos a los que les faltan columnas obligatorias', async () => {
    const buffer = await createExcelBuffer(
      ['Nombre completo', 'Correo electrónico'], // Falta número de registro
      [['Juan Pérez', 'juan@gmail.com']],
    );

    await expect(service.parseStudentsExcel(buffer)).rejects.toThrow(
      ExcelValidationException,
    );
  });

  it('debe lanzar excepción si el archivo está completamente vacío', async () => {
    await expect(service.parseStudentsExcel(Buffer.alloc(0))).rejects.toThrow(
      ExcelValidationException,
    );
  });
});

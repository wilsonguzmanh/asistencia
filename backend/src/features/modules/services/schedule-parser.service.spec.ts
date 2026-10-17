import * as ExcelJS from 'exceljs';
import { ScheduleParserService } from './schedule-parser.service';
import { ExcelValidationException } from '../exceptions/excel-validation.exception';

describe('ScheduleParserService', () => {
  let service: ScheduleParserService;

  beforeEach(() => {
    service = new ScheduleParserService();
  });

  const createExcelBuffer = async (
    headers: string[],
    rows: (string | number)[][],
  ): Promise<Buffer> => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Calendario');
    worksheet.addRow(headers);
    rows.forEach((row) => worksheet.addRow(row));
    const rawBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(rawBuffer);
  };

  it('debe parsear y ordenar cronológicamente un calendario de clases válido (RF-12)', async () => {
    const buffer = await createExcelBuffer(
      ['Fecha', 'Hora inicio', 'Hora fin'],
      [
        ['07/10/2026', '18:00', '21:00'], // Segunda fecha
        ['05/10/2026', '18:00', '21:00'], // Primera fecha (desordenada a propósito)
      ],
    );

    const result = await service.parseSchedulesExcel(buffer);

    expect(result.hasErrors).toBe(false);
    expect(result.totalSessions).toBe(2);
    expect(result.schedules).toHaveLength(2);
    // Verificar orden cronológico
    expect(result.schedules[0].classDate).toBe('2026-10-05');
    expect(result.schedules[0].startTime).toBe('18:00');
    expect(result.schedules[0].endTime).toBe('21:00');
    expect(result.schedules[1].classDate).toBe('2026-10-07');
  });

  it('debe detectar fechas duplicadas y reportar el error por fila (RN-04)', async () => {
    const buffer = await createExcelBuffer(
      ['Fecha', 'Hora inicio', 'Hora fin'],
      [
        ['05/10/2026', '18:00', '21:00'],
        ['05/10/2026', '18:00', '21:00'], // Duplicado en fila 3
      ],
    );

    const result = await service.parseSchedulesExcel(buffer);

    expect(result.hasErrors).toBe(true);
    expect(result.errorCount).toBe(1);
    expect(result.errors[0].row).toBe(3);
    expect(result.errors[0].field).toBe('classDate');
    expect(result.errors[0].message).toContain('repetida');
    expect(result.schedules).toHaveLength(0);
  });

  it('debe reportar error si la hora de fin no es posterior a la hora de inicio', async () => {
    const buffer = await createExcelBuffer(
      ['Fecha', 'Hora inicio', 'Hora fin'],
      [['05/10/2026', '21:00', '18:00']], // Inicio 21:00, Fin 18:00 (inválido)
    );

    const result = await service.parseSchedulesExcel(buffer);

    expect(result.hasErrors).toBe(true);
    expect(result.errors[0].field).toBe('endTime');
    expect(result.errors[0].message).toContain('debe ser posterior');
  });

  it('debe rechazar archivo si falta alguna de las columnas obligatorias', async () => {
    const buffer = await createExcelBuffer(
      ['Fecha', 'Hora inicio'], // Falta Hora fin
      [['05/10/2026', '18:00']],
    );

    await expect(service.parseSchedulesExcel(buffer)).rejects.toThrow(
      ExcelValidationException,
    );
  });

  it('debe lanzar excepción ante buffer vacío', async () => {
    await expect(service.parseSchedulesExcel(Buffer.alloc(0))).rejects.toThrow(
      ExcelValidationException,
    );
  });
});

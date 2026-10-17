import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { RowValidationError } from '../dto/import-validation-result.dto';
import { ScheduleRowDto } from '../dto/schedule-row.dto';
import { ScheduleValidationResultDto } from '../dto/schedule-validation-result.dto';
import { ExcelValidationException } from '../exceptions/excel-validation.exception';

@Injectable()
export class ScheduleParserService {
  private readonly logger = new Logger(ScheduleParserService.name);

  private readonly timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  /**
   * Procesa y valida el archivo Excel con el calendario de fechas y horarios (RF-12, RN-04)
   */
  async parseSchedulesExcel(
    buffer: Buffer,
  ): Promise<ScheduleValidationResultDto> {
    this.logger.log('Iniciando procesamiento de archivo Excel de fechas de clase...');

    if (!buffer || buffer.length === 0) {
      throw new ExcelValidationException(
        'El archivo proporcionado está vacío o no es válido',
      );
    }

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as any);
    } catch (error) {
      this.logger.error('Error al cargar buffer de fechas con exceljs', error.stack);
      throw new ExcelValidationException(
        'El formato del archivo es inválido. Asegúrese de subir un archivo .xlsx válido.',
      );
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new ExcelValidationException(
        'El archivo Excel no contiene hojas de trabajo',
      );
    }

    // 1. Detectar cabeceras en la primera fila
    const headerRow = worksheet.getRow(1);
    let dateColIndex = -1;
    let startColIndex = -1;
    let endColIndex = -1;

    headerRow.eachCell((cell, colNumber) => {
      const headerText = this.normalizeHeader(this.getCellValue(cell));
      if (headerText.includes('fecha')) {
        dateColIndex = colNumber;
      } else if (
        headerText.includes('inicio') ||
        headerText === 'hora inicio' ||
        headerText === 'hora de inicio'
      ) {
        startColIndex = colNumber;
      } else if (
        headerText.includes('fin') ||
        headerText === 'hora fin' ||
        headerText === 'hora de fin'
      ) {
        endColIndex = colNumber;
      }
    });

    if (dateColIndex === -1 || startColIndex === -1 || endColIndex === -1) {
      const missingColumns: string[] = [];
      if (dateColIndex === -1) missingColumns.push('"Fecha"');
      if (startColIndex === -1) missingColumns.push('"Hora inicio"');
      if (endColIndex === -1) missingColumns.push('"Hora fin"');

      throw new ExcelValidationException(
        `El archivo Excel no contiene las columnas requeridas: ${missingColumns.join(', ')}`,
      );
    }

    // 2. Procesar y validar filas
    const errors: RowValidationError[] = [];
    const validSchedules: ScheduleRowDto[] = [];
    const seenDates = new Map<string, number>(); // ISO date -> rowNumber
    let totalProcessedRows = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Saltar encabezado

      const dateCell = row.getCell(dateColIndex);
      const startCell = row.getCell(startColIndex);
      const endCell = row.getCell(endColIndex);

      const rawDateStr = this.getCellValue(dateCell);
      const rawStartStr = this.getCellValue(startCell);
      const rawEndStr = this.getCellValue(endCell);

      // Omitir filas totalmente vacías
      if (!rawDateStr && !rawStartStr && !rawEndStr) {
        return;
      }

      totalProcessedRows++;
      let rowHasError = false;

      // Validación y normalización de Fecha
      const parsedDate = this.parseDateCell(dateCell);
      if (!parsedDate) {
        errors.push({
          row: rowNumber,
          field: 'classDate',
          value: rawDateStr,
          message:
            'La fecha de clase es obligatoria y debe tener formato válido (DD/MM/YYYY o YYYY-MM-DD)',
        });
        rowHasError = true;
      } else {
        if (seenDates.has(parsedDate)) {
          const firstSeenRow = seenDates.get(parsedDate);
          errors.push({
            row: rowNumber,
            field: 'classDate',
            value: parsedDate,
            message: `La fecha de clase '${parsedDate}' se encuentra repetida en el archivo (ya presente en fila ${firstSeenRow})`,
          });
          rowHasError = true;
        } else {
          seenDates.set(parsedDate, rowNumber);
        }
      }

      // Validación y normalización de Horas (Informativas RF-12)
      const parsedStart = this.parseTimeCell(startCell);
      if (!parsedStart) {
        errors.push({
          row: rowNumber,
          field: 'startTime',
          value: rawStartStr,
          message:
            'La hora de inicio es obligatoria y debe tener formato HH:mm (ej. 18:00)',
        });
        rowHasError = true;
      }

      const parsedEnd = this.parseTimeCell(endCell);
      if (!parsedEnd) {
        errors.push({
          row: rowNumber,
          field: 'endTime',
          value: rawEndStr,
          message:
            'La hora de fin es obligatoria y debe tener formato HH:mm (ej. 21:00)',
        });
        rowHasError = true;
      }

      // Validación lógica de orden temporal (inicio < fin)
      if (parsedStart && parsedEnd && parsedStart >= parsedEnd) {
        errors.push({
          row: rowNumber,
          field: 'endTime',
          value: parsedEnd,
          message: `La hora de fin (${parsedEnd}) debe ser posterior a la hora de inicio (${parsedStart})`,
        });
        rowHasError = true;
      }

      if (!rowHasError && parsedDate && parsedStart && parsedEnd) {
        validSchedules.push({
          classDate: parsedDate,
          startTime: parsedStart,
          endTime: parsedEnd,
          rowNumber,
        });
      }
    });

    if (totalProcessedRows === 0) {
      throw new ExcelValidationException(
        'El archivo Excel no contiene ninguna fila con fechas de clase programadas',
      );
    }

    // Ordenar cronológicamente
    validSchedules.sort((a, b) => a.classDate.localeCompare(b.classDate));

    const hasErrors = errors.length > 0;
    this.logger.log(
      `Procesamiento de calendario completado: ${totalProcessedRows} filas, ${validSchedules.length} válidas, ${errors.length} errores.`,
    );

    return {
      totalSessions: totalProcessedRows,
      hasErrors,
      errorCount: errors.length,
      errors,
      schedules: hasErrors ? [] : validSchedules,
    };
  }

  private parseDateCell(cell: ExcelJS.Cell): string | null {
    if (!cell || cell.value === null || cell.value === undefined) {
      return null;
    }

    // Si viene como Date nativo de Excel
    if (cell.value instanceof Date) {
      const d = cell.value;
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const str = this.getCellValue(cell).trim();
    if (!str) return null;

    // Formato DD/MM/YYYY o DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      const day = String(dmyMatch[1]).padStart(2, '0');
      const month = String(dmyMatch[2]).padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }

    // Formato YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return str;
    }

    return null;
  }

  private parseTimeCell(cell: ExcelJS.Cell): string | null {
    if (!cell || cell.value === null || cell.value === undefined) {
      return null;
    }

    // Si Excel lo guardó como Date
    if (cell.value instanceof Date) {
      const d = cell.value;
      const hours = String(d.getUTCHours()).padStart(2, '0');
      const minutes = String(d.getUTCMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    const str = this.getCellValue(cell).trim();
    if (!str) return null;

    // Match HH:mm o HH:mm:ss
    const match = str.match(/^(\d{1,2}):(\d{2})(:00)?$/);
    if (match) {
      const hours = String(match[1]).padStart(2, '0');
      const minutes = match[2];
      const formatted = `${hours}:${minutes}`;
      if (this.timeRegex.test(formatted)) {
        return formatted;
      }
    }

    return null;
  }

  private normalizeHeader(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private getCellValue(cell: ExcelJS.Cell): string {
    if (!cell || cell.value === null || cell.value === undefined) {
      return '';
    }
    const val = cell.value;
    if (typeof val === 'object') {
      if ('text' in val && typeof val.text === 'string') {
        return val.text.trim();
      }
      if ('result' in val) {
        return String(val.result).trim();
      }
    }
    return String(val).trim();
  }
}

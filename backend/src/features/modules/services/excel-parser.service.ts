import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import {
  RowValidationError,
  StudentImportValidationResultDto,
} from '../dto/import-validation-result.dto';
import { StudentRowDto } from '../dto/student-row.dto';
import { ExcelValidationException } from '../exceptions/excel-validation.exception';

@Injectable()
export class ExcelParserService {
  private readonly logger = new Logger(ExcelParserService.name);

  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Procesa y valida un archivo Excel con la nómina de estudiantes (RF-11, RN-02)
   */
  async parseStudentsExcel(
    buffer: Buffer,
  ): Promise<StudentImportValidationResultDto> {
    this.logger.log('Iniciando procesamiento de archivo Excel de estudiantes...');

    if (!buffer || buffer.length === 0) {
      throw new ExcelValidationException(
        'El archivo proporcionado está vacío o no es válido',
      );
    }

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as any);
    } catch (error) {
      this.logger.error('Error al cargar buffer con exceljs', error.stack);
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
    let regColIndex = -1;
    let nameColIndex = -1;
    let emailColIndex = -1;

    headerRow.eachCell((cell, colNumber) => {
      const headerText = this.normalizeHeader(this.getCellValue(cell));
      if (
        headerText.includes('registro') ||
        headerText.includes('matricula') ||
        headerText === 'nro de registro' ||
        headerText === 'numero de registro'
      ) {
        regColIndex = colNumber;
      } else if (
        headerText.includes('nombre') ||
        headerText === 'nombre completo'
      ) {
        nameColIndex = colNumber;
      } else if (
        headerText.includes('correo') ||
        headerText.includes('email') ||
        headerText === 'correo electronico'
      ) {
        emailColIndex = colNumber;
      }
    });

    if (regColIndex === -1 || nameColIndex === -1 || emailColIndex === -1) {
      const missingColumns: string[] = [];
      if (regColIndex === -1) missingColumns.push('"Número de registro"');
      if (nameColIndex === -1) missingColumns.push('"Nombre completo"');
      if (emailColIndex === -1) missingColumns.push('"Correo electrónico"');

      throw new ExcelValidationException(
        `El archivo Excel no contiene las columnas requeridas: ${missingColumns.join(', ')}`,
      );
    }

    // 2. Procesar y validar filas
    const errors: RowValidationError[] = [];
    const validStudents: StudentRowDto[] = [];
    const seenRegistrations = new Map<string, number>(); // registrationNumber -> rowNumber para RN-02
    let totalProcessedRows = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Saltar encabezado

      const rawReg = this.getCellValue(row.getCell(regColIndex));
      const rawName = this.getCellValue(row.getCell(nameColIndex));
      const rawEmail = this.getCellValue(row.getCell(emailColIndex));

      // Ignorar filas totalmente vacías
      if (!rawReg && !rawName && !rawEmail) {
        return;
      }

      totalProcessedRows++;
      let rowHasError = false;

      // Validación de Número de Registro (RN-02)
      if (!rawReg) {
        errors.push({
          row: rowNumber,
          field: 'registrationNumber',
          value: '',
          message: 'El número de registro es obligatorio',
        });
        rowHasError = true;
      } else {
        const normalizedReg = rawReg.trim();
        if (seenRegistrations.has(normalizedReg)) {
          const firstSeenRow = seenRegistrations.get(normalizedReg);
          errors.push({
            row: rowNumber,
            field: 'registrationNumber',
            value: normalizedReg,
            message: `El número de registro '${normalizedReg}' se encuentra duplicado (ya presente en fila ${firstSeenRow})`,
          });
          rowHasError = true;
        } else {
          seenRegistrations.set(normalizedReg, rowNumber);
        }
      }

      // Validación de Nombre Completo
      if (!rawName) {
        errors.push({
          row: rowNumber,
          field: 'fullName',
          value: '',
          message: 'El nombre completo es obligatorio',
        });
        rowHasError = true;
      }

      // Validación de Correo Electrónico
      if (!rawEmail) {
        errors.push({
          row: rowNumber,
          field: 'email',
          value: '',
          message: 'El correo electrónico es obligatorio',
        });
        rowHasError = true;
      } else if (!this.emailRegex.test(rawEmail.trim())) {
        errors.push({
          row: rowNumber,
          field: 'email',
          value: rawEmail.trim(),
          message: 'El formato de correo electrónico no es válido',
        });
        rowHasError = true;
      }

      // Si la fila no tiene ningún error, agregar a la nómina válida
      if (!rowHasError) {
        validStudents.push({
          registrationNumber: rawReg.trim(),
          fullName: rawName.trim(),
          email: rawEmail.trim().toLowerCase(),
          rowNumber,
        });
      }
    });

    if (totalProcessedRows === 0) {
      throw new ExcelValidationException(
        'El archivo Excel no contiene ninguna fila con datos de estudiantes',
      );
    }

    const hasErrors = errors.length > 0;
    this.logger.log(
      `Procesamiento completado: ${totalProcessedRows} filas, ${validStudents.length} válidas, ${errors.length} errores.`,
    );

    return {
      totalRows: totalProcessedRows,
      validRowsCount: validStudents.length,
      errorCount: errors.length,
      hasErrors,
      errors,
      data: hasErrors ? [] : validStudents,
    };
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

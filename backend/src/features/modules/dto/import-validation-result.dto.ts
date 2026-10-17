import { ApiProperty } from '@nestjs/swagger';
import { StudentRowDto } from './student-row.dto';

export class RowValidationError {
  @ApiProperty({ example: 4, description: 'Número de fila en el archivo Excel donde ocurrió el error' })
  row: number;

  @ApiProperty({ example: 'registrationNumber', description: 'Nombre de la columna o campo afectado' })
  field: string;

  @ApiProperty({ example: '1001', description: 'Valor detectado que causó el conflicto' })
  value: any;

  @ApiProperty({ example: "El número de registro '1001' se encuentra duplicado (ya presente en fila 2)", description: 'Detalle legible del error' })
  message: string;
}

export class StudentImportValidationResultDto {
  @ApiProperty({ example: 15, description: 'Total de filas de datos procesadas en el archivo' })
  totalRows: number;

  @ApiProperty({ example: 13, description: 'Cantidad de filas válidas' })
  validRowsCount: number;

  @ApiProperty({ example: 2, description: 'Cantidad de errores encontrados' })
  errorCount: number;

  @ApiProperty({ example: false, description: 'Indica si el archivo contiene algún error' })
  hasErrors: boolean;

  @ApiProperty({ type: [RowValidationError], description: 'Listado detallado de errores por fila' })
  errors: RowValidationError[];

  @ApiProperty({ type: [StudentRowDto], description: 'Listado de estudiantes válidos parseados' })
  data: StudentRowDto[];
}

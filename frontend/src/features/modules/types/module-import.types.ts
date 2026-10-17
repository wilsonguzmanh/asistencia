export interface StudentRow {
  registrationNumber: string;
  fullName: string;
  email: string;
  rowNumber: number;
}

export interface RowValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface StudentImportValidationResult {
  totalRows: number;
  validRowsCount: number;
  errorCount: number;
  hasErrors: boolean;
  errors: RowValidationError[];
  data: StudentRow[];
}

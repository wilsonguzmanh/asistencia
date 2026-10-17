import { StudentImportValidationResult } from '../types/module-import.types';
import { ScheduleValidationResult } from '../types/schedule-import.types';
import {
  ActivateModulePayload,
  ActivatedModuleResult,
  ModulePreviewSummary,
} from '../types/module-preview.types';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
).replace(/\/$/, '');

export interface ImportStudentsResponse {
  success: boolean;
  message: string;
  data?: StudentImportValidationResult;
  errorData?: StudentImportValidationResult;
}

export interface ImportSchedulesResponse {
  success: boolean;
  message: string;
  data?: ScheduleValidationResult;
  errorData?: ScheduleValidationResult;
}

export interface PreviewModuleResponse {
  success: boolean;
  message: string;
  data?: ModulePreviewSummary;
  errorData?: ModulePreviewSummary;
}

export interface ActivateModuleResponse {
  success: boolean;
  message: string;
  data?: ActivatedModuleResult;
}

export class ModuleImportService {
  /**
   * Envía el archivo Excel de estudiantes al backend para su validación (RF-11, RN-02)
   */
  static async importStudents(
    file: File,
    token: string,
  ): Promise<ImportStudentsResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/modules/import/students`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            json.message ||
            'El archivo contiene errores de validación que deben corregirse.',
          errorData: json.data,
        };
      }

      return {
        success: true,
        message: json.message || 'Nómina de estudiantes validada exitosamente.',
        data: json.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          'Error de conexión con el servidor. Verifique que la API esté activa.',
      };
    }
  }

  /**
   * Envía el archivo Excel de calendario al backend para su validación (RF-12, RN-04)
   */
  static async importSchedules(
    file: File,
    token: string,
  ): Promise<ImportSchedulesResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/modules/import/schedules`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            json.message ||
            'El calendario contiene errores o fechas duplicadas que deben corregirse.',
          errorData: json.data,
        };
      }

      return {
        success: true,
        message:
          json.message ||
          'Calendario de clases procesado y validado exitosamente.',
        data: json.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          'Error de conexión con el servidor. Verifique que la API esté activa.',
      };
    }
  }

  /**
   * Envía simultáneamente los archivos de estudiantes y calendario para generar vista previa consolidada (RF-16)
   */
  static async previewModule(
    studentsFile: File,
    schedulesFile: File,
    token: string,
  ): Promise<PreviewModuleResponse> {
    const formData = new FormData();
    formData.append('studentsFile', studentsFile);
    formData.append('schedulesFile', schedulesFile);

    try {
      const response = await fetch(`${API_URL}/modules/preview`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            json.message ||
            'La vista previa contiene errores que deben subsanarse antes de continuar.',
          errorData: json.data,
        };
      }

      return {
        success: true,
        message: json.message || 'Vista previa consolidada generada con éxito.',
        data: json.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          'Error de conexión con el servidor. Verifique que la API esté activa.',
      };
    }
  }

  /**
   * Activa el nuevo módulo académico en base de datos con transacción ACID (US-07, RF-14, RN-01, RN-08)
   */
  static async activateModule(
    payload: ActivateModulePayload,
    token: string,
  ): Promise<ActivateModuleResponse> {
    try {
      const response = await fetch(`${API_URL}/modules/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            json.message ||
            'Error al activar el módulo académico en base de datos.',
        };
      }

      return {
        success: true,
        message:
          json.message || 'Módulo académico activado exitosamente.',
        data: json.data || json,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          'Error de conexión con el servidor. No se pudo completar la activación.',
      };
    }
  }

  /**
   * Consulta el módulo académico activo actual (RN-01)
   */
  static async getActiveModule(token: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/modules/active`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();
      return json.data || json;
    } catch {
      return null;
    }
  }
}


import {
  AttendanceMatrixFilterParams,
  AttendanceMatrixResponse,
  OverrideAttendancePayload,
} from '../types/admin-attendance.types';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
).replace(/\/$/, '');

export class AdminAttendanceService {
  private static getAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  }

  /**
   * Consulta la matriz general de asistencias del módulo activo con filtros (RF-08, US-11)
   */
  static async getMatrix(
    filters: AttendanceMatrixFilterParams = {},
  ): Promise<AttendanceMatrixResponse> {
    const token = this.getAdminToken();
    const params = new URLSearchParams();

    if (filters.classDate && filters.classDate !== 'ALL') {
      params.append('classDate', filters.classDate);
    }
    if (filters.studentId && filters.studentId !== 'ALL') {
      params.append('studentId', filters.studentId);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(
      `${API_URL}/attendances/admin/matrix${queryString}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json.message ||
          'Error al obtener la matriz de asistencias administrativas',
      );
    }

    return json.data || json;
  }

  /**
   * Modifica manualmente el estado de asistencia con justificación obligatoria (RF-07, RN-06, RN-07, US-12)
   */
  static async overrideAttendance(
    payload: OverrideAttendancePayload,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const token = this.getAdminToken();

    const response = await fetch(`${API_URL}/attendances/admin/override`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json.message ||
          'Error al modificar el registro de asistencia en el servidor',
      );
    }

    return {
      success: true,
      message: 'Asistencia actualizada y registrada en auditoría exitosamente',
      data: json.data || json,
    };
  }
}

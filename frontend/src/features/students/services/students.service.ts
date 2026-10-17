import {
  StudentFilterQuery,
  StudentListResponse,
} from '../types/student.types';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
).replace(/\/$/, '');

export class StudentsService {
  /**
   * Consulta la nómina de estudiantes del módulo activo actual (RF-06),
   * aplicando filtro de búsqueda y parámetros de paginación.
   */
  static async getActiveModuleStudents(
    query: StudentFilterQuery,
    token: string,
  ): Promise<StudentListResponse> {
    const params = new URLSearchParams();

    if (query.search && query.search.trim().length > 0) {
      params.append('search', query.search.trim());
    }

    if (query.page) {
      params.append('page', query.page.toString());
    }

    if (query.limit) {
      params.append('limit', query.limit.toString());
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';

    const response = await fetch(`${API_URL}/students${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(
        errorJson.message ||
          `Error al consultar estudiantes (HTTP ${response.status})`,
      );
    }

    const json = await response.json();
    // Manejar envoltura estándar de TransformResponseInterceptor ({ data: ... })
    const data: StudentListResponse = json.data ?? json;

    return data;
  }
}

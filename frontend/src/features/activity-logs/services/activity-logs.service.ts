import {
  ActivityLogQueryParams,
  ActivityLogResponse,
} from '../types/activity-logs.types';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
).replace(/\/$/, '');

export class ActivityLogsService {
  private static getAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  }

  /**
   * Consulta la bitácora de auditoría paginada y filtrada (RF-10, US-15)
   */
  static async getLogs(
    params: ActivityLogQueryParams = {},
  ): Promise<ActivityLogResponse> {
    const token = this.getAdminToken();
    const query = new URLSearchParams();

    if (params.action && params.action !== 'ALL') {
      query.append('action', params.action);
    }
    if (params.search && params.search.trim().length > 0) {
      query.append('search', params.search.trim());
    }
    if (params.page) {
      query.append('page', params.page.toString());
    }
    if (params.limit) {
      query.append('limit', params.limit.toString());
    }

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/activity-logs/admin${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json.message || 'Error al obtener la bitácora de auditoría',
      );
    }

    return json.data || json;
  }
}

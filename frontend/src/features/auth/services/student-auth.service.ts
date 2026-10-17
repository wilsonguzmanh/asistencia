import { apiClient } from '../../../lib/api-client';
import {
  StudentLoginResponse,
  StudentSession,
} from '../types/auth.types';

const TOKEN_KEY = 'iac_student_token';
const SESSION_KEY = 'iac_student_session';

export const studentAuthService = {
  /**
   * Inicia sesión con correo o número de registro (RF-01, US-02)
   */
  async login(identifier: string): Promise<StudentLoginResponse> {
    const data = await apiClient<StudentLoginResponse>('/auth/student/login', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      document.cookie = `student_token=${encodeURIComponent(data.token)}; path=/; max-age=86400; SameSite=Lax`;
    }

    return data;
  },

  /**
   * Obtiene la sesión actual almacenada en el cliente
   */
  getStoredSession(): StudentSession | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as StudentSession;
    } catch {
      this.clearSession();
      return null;
    }
  },

  /**
   * Cierra la sesión activa del estudiante
   */
  clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    document.cookie = 'student_token=; path=/; max-age=0; SameSite=Lax';
  },
};

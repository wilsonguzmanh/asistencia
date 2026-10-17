import {
  AdminLoginCredentials,
  ApiResponse,
  AuthResponseData,
  AuthUser,
} from '../types/auth.types';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
).replace(/\/$/, '');

export const authService = {
  async loginAdmin(
    credentials: AdminLoginCredentials,
  ): Promise<ApiResponse<AuthResponseData>> {
    const response = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = (await response.json()) as ApiResponse<AuthResponseData>;

    if (!response.ok) {
      throw result;
    }

    if (result.status === 'success' && result.data) {
      this.saveSession(result.data.token, result.data.user);
    }

    return result;
  },

  saveSession(token: string, user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      // Guardar también en cookie para que el middleware de Next.js lo valide en rutas protegidas
      document.cookie = `admin_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
    }
  },

  async logoutAdmin(): Promise<void> {
    const token = this.getStoredToken();
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      } catch {
        // Fallback silencioso si no hay conexión
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
    }
  },

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  },

  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('admin_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  async getAdminProfile(): Promise<ApiResponse<AuthUser>> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('No hay sesión activa de administrador');
    }

    const response = await fetch(`${API_URL}/auth/admin/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = (await response.json()) as ApiResponse<AuthUser>;
    if (!response.ok) {
      throw result;
    }
    return result;
  },
};

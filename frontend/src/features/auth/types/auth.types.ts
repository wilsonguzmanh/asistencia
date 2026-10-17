export type UserRole = 'ADMIN' | 'STUDENT';

export interface AdminLoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthResponseData {
  token: string;
  user: AuthUser;
}

export interface StudentModuleInfo {
  id: string;
  name: string;
  code: string;
  status: string;
}

export interface StudentProfile {
  id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  module: StudentModuleInfo;
}

export interface StudentLoginResponse {
  token: string;
  student: StudentProfile;
}

export interface StudentSession {
  token: string;
  student: StudentProfile;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message: string;
  code?: string;
  data: T | null;
  correlationId?: string;
}

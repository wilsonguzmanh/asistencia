export type ActivityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'MARK_ATTENDANCE'
  | 'UPDATE_ATTENDANCE'
  | 'IMPORT_STUDENTS'
  | 'IMPORT_SCHEDULES'
  | 'ACTIVATE_MODULE'
  | 'EXPORT_ATTENDANCES';

export type UserRole = 'ADMIN' | 'STUDENT';

export interface ActivityLogItem {
  id: string;
  moduleId: string | null;
  userId: string | null;
  userIdentifier: string;
  userRole: UserRole;
  action: ActivityAction;
  entityAffected: string;
  entityId: string | null;
  previousValue: Record<string, any> | null;
  newValue: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface ActivityLogResponse {
  data: ActivityLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityLogQueryParams {
  action?: ActivityAction | 'ALL';
  search?: string;
  page?: number;
  limit?: number;
}

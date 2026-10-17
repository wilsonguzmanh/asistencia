export interface StudentItem {
  id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface StudentListResponse {
  moduleName: string;
  moduleCode?: string;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  students: StudentItem[];
}

export interface StudentFilterQuery {
  search?: string;
  page?: number;
  limit?: number;
}

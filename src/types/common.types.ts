export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type Status = "active" | "inactive" | "pending" | "archived";

export interface SeoMeta {
  title: string;
  description: string;
  ogImage?: string;
  keywords?: string[];
}

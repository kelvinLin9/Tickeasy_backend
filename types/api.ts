/**
 * API 相關型別定義
 */

import { HttpError } from 'http-errors';

/**
 * API 標準響應結構
 */
export interface ApiResponse<T = any> {
  status: 'success' | 'failed';
  message: string;
  data?: T;
}

/**
 * 分頁響應結構
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 通用錯誤響應
 */
export interface ErrorResponse {
  status: 'failed';
  message: string;
  details?: any;
  code?: string;
}

/**
 * 常用 HTTP 狀態碼
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
} 
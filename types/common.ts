/**
 * 通用類型定義
 */

import { HttpError } from 'http-errors';
import { UserRole } from '../models/user';

// API 標準響應結構
export interface ApiResponse<T = any> {
  status: 'success' | 'failed';
  message: string;
  data?: T;
}

// JWT 令牌載荷
export interface TokenPayload {
  userId: string;
  role: string | UserRole;
  iat?: number;
  exp?: number;
}

// 分頁響應結構
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 通用錯誤響應
export interface ErrorResponse {
  status: 'failed';
  message: string;
  details?: any;
  code?: string;
} 
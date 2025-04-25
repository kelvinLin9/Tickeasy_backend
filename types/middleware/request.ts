/**
 * 中間件中使用的請求相關型別定義
 */

import { Request } from 'express';
import { UserRole } from '../../models/user';

/**
 * 擴展的自定義請求型別
 * 包含用戶資訊與令牌，用於中間件處理
 */
export interface CustomRequest extends Omit<Request, 'user'> {
  user?: {
    userId: string;
    role: UserRole;
    email: string;
    name: string;
    isEmailVerified: boolean;
    [key: string]: any; // 允許其他屬性
  };
  token?: string;
} 
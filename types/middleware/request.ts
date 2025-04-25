/**
 * 中間件中使用的請求相關型別定義
 */

import { Request } from 'express';

/**
 * 擴展的自定義請求型別
 * 包含用戶資訊與令牌，用於中間件處理
 */
export interface CustomRequest extends Omit<Request, 'user'> {
  user?: {
    userId: string;
    id: string; // 與 userId 保持一致，為了兼容性
    role: string;
    email: string;
    [key: string]: any; // 允許其他屬性
  };
  token?: string;
} 
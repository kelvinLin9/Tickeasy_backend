import { UserRole } from '../models/user';

// 擴展 Express 的類型定義
declare global {
  namespace Express {
    // 擴展 User 接口
    interface User {
      id: string;
      role: string | UserRole;
      email: string;
      [key: string]: any;
    }

    export interface Request {
      user?: User;
    }
  }
} 
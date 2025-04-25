import createHttpError from 'http-errors';
import jsonWebToken from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { handleErrorAsync } from './handleErrorAsync';
import { TokenPayload } from '../types';

// 更精確的使用者介面定義
interface User {
  id?: string;
  userId?: string;
  role: string;
}

// 電子郵件令牌載荷
interface EmailTokenPayload {
  code: string;
  iat: number;
  exp: number;
}

// 認證令牌載荷，使用從 types 導入的 TokenPayload
interface AuthTokenPayload extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * 生成 JWT 令牌
 * @param user 用戶數據
 * @returns JWT 令牌
 */
export const generateToken = (user: User): string => {
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_DAY) {
    throw new Error("Required JWT environment variables are not set.");
  }
  
  // 生成 payload，包括用戶 ID 和角色
  const payload: TokenPayload = {
    userId: user.userId || user.id || '', // 支持兩種屬性名稱，但確保有值
    role: user.role,
  };
  
  // 簽名 token
  return jsonWebToken.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY || '7d'
  } as SignOptions);
};

/**
 * 驗證 JWT 令牌
 * @param token JWT 令牌
 * @returns 解碼後的載荷
 */
export const verifyToken = (token: string): EmailTokenPayload | AuthTokenPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }
  try {
    const decoded = jsonWebToken.verify(token, process.env.JWT_SECRET) as EmailTokenPayload | AuthTokenPayload;
    
    // 檢查是否為驗證碼 token
    if ('code' in decoded) {
      // 檢查是否過期
      if (decoded.exp * 1000 < Date.now()) {
        throw createHttpError(400, '驗證碼已過期');
      }
      return decoded;
    }
    
    // 檢查是否為認證 token
    if (!('userId' in decoded) || !('role' in decoded)) {
      throw createHttpError(401, '無效的 Token 格式');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      throw error;
    }
    throw createHttpError(401, '無效的 Token');
  }
};

/**
 * 生成電子郵件驗證令牌
 * @returns 驗證碼和令牌
 */
export const generateEmailToken = (): { code: string; token: string } => {
  const code = generateRandomCode();
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }
  const token = jsonWebToken.sign({ code }, process.env.JWT_SECRET, {
    expiresIn: 600 // 10 minutes
  });

  return { code, token };
};

/**
 * 生成隨機驗證碼
 * @returns 6位數字驗證碼
 */
const generateRandomCode = (): string => {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
};

// 重新導出
export { handleErrorAsync };

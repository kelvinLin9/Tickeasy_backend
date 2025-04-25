import jwt from 'jsonwebtoken';
import { User as UserEntity, UserRole } from '../models/user';
import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../types/auth/jwt';
import { AppDataSource } from '../config/database';

/**
 * 驗證用戶是否已登入的中間件
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 獲取Authorization頭
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'failed',
        message: '未提供認證令牌',
      });
    }

    // 獲取令牌
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'failed',
        message: '未提供認證令牌',
      });
    }

    // 驗證令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as TokenPayload;
    if (!decoded.userId) {
      return res.status(401).json({
        status: 'failed',
        message: '無效的認證令牌',
      });
    }

    // 查找用戶
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({ where: { userId: decoded.userId } });
    if (!user) {
      return res.status(401).json({
        status: 'failed',
        message: '用戶不存在',
      });
    }

    // 在請求對象中設置用戶信息
    req.user = {
      userId: user.userId,
      role: user.role,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: 'failed',
        message: '無效的認證令牌',
      });
    }
    next(error);
  }
};

/**
 * 可選的身份驗證中間件
 * 如果提供了令牌則驗證，未提供則跳過但不阻止請求
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 獲取Authorization頭
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    // 獲取令牌
    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    // 驗證令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as TokenPayload;
    if (!decoded.userId) {
      return next();
    }

    // 查找用戶
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({ where: { userId: decoded.userId } });
    if (!user) {
      return next();
    }

    // 在請求對象中設置用戶信息
    req.user = {
      userId: user.userId,
      role: user.role,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified
    };

    next();
  } catch (error) {
    // 對於可選驗證，忽略令牌錯誤
    next();
  }
};

/**
 * 驗證用戶是否為管理員的中間件
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'failed',
      message: '請先登入',
    });
  }

  // 簡單比較字符串值，避免類型問題
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'failed',
      message: '需要管理員權限',
    });
  }

  next();
};

/**
 * 驗證組織管理者權限的中間件
 */
export const isOrganizer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'failed',
      message: '請先登入',
    });
  }

  // 使用簡單字符串比較
  const role = String(req.user.role);
  if (role !== 'admin' && role !== 'organizer') {
    return res.status(403).json({
      status: 'failed',
      message: '需要組織管理員權限',
    });
  }

  next();
};

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await isAuthenticated(req, res, () => {
      if (req.user) {
        const role = String(req.user.role);
        if (role !== 'admin' && role !== 'superuser') {
          return res.status(403).json({ 
            status: 'failed',
            message: '權限不足',
          });
        }
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ 
      status: 'failed',
      message: '認證失敗',
    });
  }
};

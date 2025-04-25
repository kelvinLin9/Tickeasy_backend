import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, UserRole } from '../models/user';
import { verifyToken, generateToken, handleErrorAsync } from '../utils';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { IsNull, Not, MoreThan } from 'typeorm';
import { AppDataSource } from '../config/database';
import { 
  ApiResponse, 
  TokenPayload,
  ErrorResponse,
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  GoogleRequestUser,
  AuthResponseData,
  VerificationResponseData,
  UserData,
  GoogleUserResponseData
} from '../types';

// Google 登入相關介面 - 保留原有介面以維持相容性
interface GoogleRequest extends Omit<Request, 'user'> {
  user?: GoogleRequestUser;
  query: {
    state?: string;
    [key: string]: string | undefined;
  };
}

// 註冊新用戶
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, nickname, phone, birthday } = req.body as RegisterRequest;

    // 檢查必要參數
    if (!email) {
      throw createHttpError(400, 'Email 為必填欄位');
    }
    if (!password) {
      throw createHttpError(400, '密碼為必填欄位');
    }
    if (!name) {
      throw createHttpError(400, '姓名為必填欄位');
    }
    
    // 驗證電子郵件長度
    if (email.length < 5 || email.length > 100) {
      throw createHttpError(400, 'Email 長度必須在5到100個字元之間');
    }
    
    // 驗證密碼格式：至少8碼，英文+數字混合
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw createHttpError(400, '密碼格式不正確，需至少8碼且包含英文和數字');
    }
    
    // 驗證姓名長度
    if (name.length < 2 || name.length > 50) {
      throw createHttpError(400, '姓名必須介於2到50個字符之間');
    }
    
    // 驗證暱稱長度（如果提供了暱稱）
    if (nickname && (nickname.length < 1 || nickname.length > 20)) {
      throw createHttpError(400, '暱稱長度必須在1到20個字元之間');
    }
    
    // 檢查 email 是否已經被註冊
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({
      where: { email }
    });

    if (existingUser) {
      throw createHttpError(409, '此 Email 已經被註冊');
    }

    // 創建新用戶
    const newUser = new User();
    newUser.email = email;
    newUser.password = password;
    newUser.name = name;
    newUser.nickname = nickname || '';
    newUser.phone = phone || '';
    newUser.birthday = birthday ? new Date(birthday) : null as unknown as Date;
    newUser.role = UserRole.USER;
    newUser.isEmailVerified = false;
    newUser.oauthProviders = [];
    
    await userRepository.save(newUser);

    // 生成驗證碼
    const { token, code } = await newUser.createVerificationToken();
    
    // 再次保存以更新驗證碼相關字段
    await userRepository.save(newUser);

    // 發送驗證郵件
    await sendVerificationEmail(email, code);

    // 生成 JWT
    const jwtToken = generateToken({
      userId: newUser.userId,
      role: newUser.role
    });

    const userData: UserData = {
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      nickname: newUser.nickname,
      phone: newUser.phone,
      birthday: newUser.birthday,
      isEmailVerified: newUser.isEmailVerified
    };

    res.status(201).json({
      status: 'success',
      message: '註冊成功，請檢查郵箱完成驗證',
      data: {
        token: jwtToken,
        user: userData
      }
    });
  } catch (err) {
    next(err);
  }
};

// 用戶登入
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // 檢查必要參數
    if (!email) {
      throw createHttpError(400, 'Email 為必填欄位');
    }
    
    if (!password) {
      throw createHttpError(400, '密碼為必填欄位');
    }

    // 查找用戶
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email },
      select: ['userId', 'email', 'password', 'role', 'name', 'nickname', 'phone', 'birthday', 'avatar', 'isEmailVerified']
    });

    if (!user || !(await user.comparePassword(password))) {
      throw createHttpError(401, 'Email 或密碼不正確');
    }

    // 生成 JWT
    const token = generateToken({
      userId: user.userId,
      role: user.role
    });

    // 移除敏感字段
    const userData: UserData = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
      nickname: user.nickname,
      phone: user.phone,
      birthday: user.birthday,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    };

    res.status(200).json({
      status: 'success',
      message: '登入成功',
      data: {
        token,
        user: userData
      }
    });
  } catch (err) {
    // 確保API返回適當的錯誤格式
    if (err instanceof Error) {
      if (err.name === 'EntityPropertyNotFoundError') {
        return res.status(500).json({
          status: 'failed',
          message: 'Email 或密碼不正確'
        });
      }
    }
    next(err);
  }
};

// Google 登入
export const googleLogin = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
  const googleReq = req as GoogleRequest;

  // 檢查必要的用戶數據
  if (!googleReq.user) {
    return res.status(400).json({
      status: 'failed',
      message: '未收到 Google 用戶資料'
    });
  }
  
  if (!googleReq.user.user) {
    return res.status(400).json({
      status: 'failed',
      message: '無效的 Google 用戶資料格式'
    });
  }
  
  if (!googleReq.user.user.userId) {
    return res.status(400).json({
      status: 'failed',
      message: '未找到用戶識別碼'
    });
  }

  // 生成 token，包含用戶 ID 和角色
  const token = generateToken({
    userId: googleReq.user.user.userId,
    role: googleReq.user.user.role || 'user'  // 確保有默認角色
  });

  // 準備返回的用戶資料
  const userData = {
    userId: googleReq.user.user.userId,
    name: googleReq.user.user.name,
    email: googleReq.user.user.email,
    photo: googleReq.user.user.photo,
    role: googleReq.user.user.role,
    oauthProviders: googleReq.user.user.oauthProviders,
    phone: googleReq.user.user.phone,
    address: googleReq.user.user.address,
    birthday: googleReq.user.user.birthday,
    gender: googleReq.user.user.gender,
    intro: googleReq.user.user.intro,
    facebook: googleReq.user.user.facebook,
    instagram: googleReq.user.user.instagram,
    discord: googleReq.user.user.discord
  };

  // 如果是 POST 請求 (直接從前端發來的)
  if (req.method === 'POST') {
    return res.json({
      status: 'success',
      message: '登入成功',
      data: {
        token,
        user: userData
      }
    });
  }

  // 如果是 GET 請求 (來自 Google 重定向)
  const redirectUrl = googleReq.query.state || process.env.FRONTEND_URL || 'http://localhost:3010/callback';
  res.redirect(`${redirectUrl}?token=${token}`);
});

// 驗證電子郵件
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body as VerifyEmailRequest;

    // 檢查必要參數
    if (!email) {
      throw createHttpError(400, 'Email 為必填欄位');
    }
    
    if (!code) {
      throw createHttpError(400, '驗證碼為必填欄位');
    }

    // 查找用戶
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { 
        email,
        verificationToken: Not(IsNull()),
        verificationTokenExpires: MoreThan(new Date())
      }
    });

    if (!user) {
      throw createHttpError(400, '驗證碼無效或已過期');
    }

    // 檢查驗證碼
    if (user.verificationToken !== code) {
      throw createHttpError(400, '驗證碼不正確');
    }

    // 更新用戶狀態
    user.isEmailVerified = true;
    user.verificationToken = '';
    user.verificationTokenExpires = new Date(0);
    await userRepository.save(user);

    const responseData: VerificationResponseData = {
      isEmailVerified: true
    };

    res.status(200).json({
      status: 'success',
      message: 'Email 驗證成功',
      data: responseData
    });
  } catch (err) {
    next(err);
  }
};

// 重新發送驗證碼
export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as ResendVerificationRequest;

    // 檢查必要參數
    if (!email) {
      throw createHttpError(400, 'Email 為必填欄位');
    }

    // 查找用戶
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw createHttpError(404, '找不到使用者');
    }

    if (user.isEmailVerified) {
      throw createHttpError(400, '此 Email 已經驗證過了');
    }

    // 檢查是否在10分鐘內已經發送過驗證郵件
    const lastAttempt = user.lastVerificationAttempt;
    if (lastAttempt && new Date().getTime() - lastAttempt.getTime() < 10 * 60 * 1000) {
      const remainingSeconds = Math.ceil((10 * 60 * 1000 - (new Date().getTime() - lastAttempt.getTime())) / 1000);
      throw createHttpError(429, `請稍後再試，${remainingSeconds} 秒後可重新發送`);
    }

    // 生成新的驗證碼
    const code = Array(6).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    
    // 直接更新用戶數據
    user.verificationToken = code;
    user.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10分鐘
    user.lastVerificationAttempt = new Date();
    
    // 保存到數據庫
    await userRepository.save(user);

    // 發送驗證郵件
    await sendVerificationEmail(email, code);

    res.status(200).json({
      status: 'success',
      message: '驗證郵件已發送，請檢查您的郵箱'
    });
  } catch (err) {
    next(err);
  }
};

// 請求密碼重置
export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as RequestPasswordResetRequest;

    // 檢查必要參數
    if (!email) {
      throw createHttpError(400, 'Email 為必填欄位');
    }

    // 查找用戶
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw createHttpError(404, '找不到使用者');
    }

    // 檢查是否在10分鐘內已經發送過重置郵件
    const lastAttempt = user.lastPasswordResetAttempt;
    if (lastAttempt && new Date().getTime() - lastAttempt.getTime() < 10 * 60 * 1000) {
      const remainingSeconds = Math.ceil((10 * 60 * 1000 - (new Date().getTime() - lastAttempt.getTime())) / 1000);
      throw createHttpError(429, `請等 ${remainingSeconds} 秒後再試`);
    }

    // 生成密碼重置碼
    const { token, code } = await user.createPasswordResetToken();
    
    // 保存更新後的用戶數據
    await userRepository.save(user);

    // 發送密碼重置郵件
    await sendPasswordResetEmail(email, code);

    res.status(200).json({
      status: 'success',
      message: '密碼重置郵件已發送，請檢查您的郵箱'
    });
  } catch (err) {
    next(err);
  }
};

// 重置密碼
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, newPassword } = req.body as ResetPasswordRequest;

    // 檢查必要參數
    if (!email) {
      throw createHttpError(400, 'Email 為必填欄位');
    }
    
    if (!code) {
      throw createHttpError(400, '驗證碼為必填欄位');
    }
    
    if (!newPassword) {
      throw createHttpError(400, '新密碼為必填欄位');
    }

    // 查找用戶
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { 
        email,
        passwordResetToken: Not(IsNull()),
        passwordResetExpires: MoreThan(new Date())
      }
    });

    if (!user) {
      throw createHttpError(400, '重置碼無效或已過期');
    }

    // 檢查重置碼
    if (user.passwordResetToken !== code) {
      throw createHttpError(400, '重置碼不正確');
    }

    // 更新密碼
    user.password = newPassword;
    user.passwordResetToken = '';
    user.passwordResetExpires = new Date(0);
    await userRepository.save(user);

    res.status(200).json({
      status: 'success',
      message: '密碼重置成功，請使用新密碼登入',
    });
  } catch (err) {
    next(err);
  }
}; 
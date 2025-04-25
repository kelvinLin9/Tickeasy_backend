import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/user';
import { ApiResponse, UpdateProfileRequest, UserProfileResponse, UserProfileData } from '../types';
import { handleErrorAsync } from '../utils';

// 顯式擴展 Request 類型以確保在此文件中識別 req.user
interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

/**
 * 獲取用戶個人資料
 */
export const getUserProfile = handleErrorAsync(async (req: AuthenticatedRequest, res: Response<ApiResponse<UserProfileResponse>>, next: NextFunction) => {
  // req.user 由 isAuth 中間件設置，包含 id, email, role
  const authenticatedUser = req.user;
  
  if (!authenticatedUser || !authenticatedUser.id) {
    return res.status(401).json({
      status: 'failed',
      message: '未授權'
    });
  }
  
  const userId = authenticatedUser.id;

  // 使用 TypeORM 查找用戶，並只選擇指定的欄位
  const userRepository = AppDataSource.getRepository(User);
  const selectedUser = await userRepository.findOne({
    where: { userId: userId },
    select: [
      "userId",
      "email",
      "name",
      "nickname",
      "role",
      "phone",
      "birthday",
      "gender",
      "preferredRegions",
      "preferredEventTypes",
      "country",
      "address",
      "avatar",
      "isEmailVerified",
      "oauthProviders",
      "searchHistory"
    ]
  });

  if (!selectedUser) {
    return res.status(404).json({
      status: 'failed',
      message: '找不到用戶資料'
    });
  }

  // 返回只包含選定欄位的用戶資料
  return res.status(200).json({
    status: 'success',
    message: '獲取用戶資料成功',
    data: {
      user: selectedUser as unknown as UserProfileData
    }
  });
});

/**
 * 更新用戶個人資料
 */
export const updateUserProfile = handleErrorAsync(async (req: AuthenticatedRequest, res: Response<ApiResponse<UserProfileResponse>>, next: NextFunction) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({
      status: 'failed',
      message: '未授權'
    });
  }
  
  // 從請求中獲取要更新的字段
  const { 
    name, 
    nickname, 
    phone, 
    birthday, 
    gender, 
    address, 
    country,
    preferredRegions, 
    preferredEventTypes 
  } = req.body as UpdateProfileRequest;
  
  // 查找用戶
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { userId } });
  
  if (!user) {
    return res.status(404).json({
      status: 'failed',
      message: '找不到用戶'
    });
  }
  
  // 更新用戶資料
  // 使用 xxx !== undefined 判斷更嚴謹，允許傳入空字符串或 null (如果業務邏輯允許)
  if (name !== undefined) user.name = name;
  if (nickname !== undefined) user.nickname = nickname;
  if (phone !== undefined) user.phone = phone;
  if (birthday !== undefined) user.birthday = birthday instanceof Date ? birthday : new Date(birthday);
  if (gender !== undefined) user.gender = gender;
  if (address !== undefined) user.address = address;
  if (country !== undefined) user.country = country;
  // 添加對 preferredRegions 和 preferredEventTypes 的更新
  if (preferredRegions !== undefined) user.preferredRegions = preferredRegions;
  if (preferredEventTypes !== undefined) user.preferredEventTypes = preferredEventTypes;
  
  // 保存更新
  await userRepository.save(user);
  
  // 返回更新後的用戶數據 (可以考慮返回完整的 user 對象，或只選擇部分字段)
  // 為了與 GET /profile 保持一致，也只選擇指定字段
  const updatedSelectedUser = await userRepository.findOne({
    where: { userId: userId },
    select: [
      "userId", "email", "name", "nickname", "role", "phone", "birthday",
      "gender", "preferredRegions", "preferredEventTypes", "country", 
      "address", "avatar", "isEmailVerified", "oauthProviders", "searchHistory"
    ]
  });

  if (!updatedSelectedUser) {
    return res.status(500).json({
      status: 'failed',
      message: '更新用戶後無法獲取資料'
    });
  }

  return res.status(200).json({
    status: 'success',
    message: '用戶資料更新成功',
    data: {
      user: updatedSelectedUser as unknown as UserProfileData
    }
  });
}); 
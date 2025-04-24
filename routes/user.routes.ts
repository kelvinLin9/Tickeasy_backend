import express from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { AppDataSource } from '../config/database';
import { User } from '../models/user';

// 臨時的 profile 處理函數
const getUserProfile = async (req: express.Request, res: express.Response) => {
  try {
    // req.user 由 isAuth 中間件設置，包含 id, email, role
    const authenticatedUser = (req as any).user;
    
    if (!authenticatedUser || !authenticatedUser.id) {
      return res.status(401).json({
        status: 'failed',
        message: '未授權'
      });
    }
    
    const userId = authenticatedUser.id;

    // 使用 TypeORM 查找用戶，並只選擇指定的欄位
    const userRepository = AppDataSource.getRepository(User);
    // 將 findOneBy 改為 findOne，並使用 select 選項
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
      data: {
        user: selectedUser // 現在返回的是只包含選定欄位的對象
      }
    });

  } catch (error) {
    console.error("獲取用戶資料時出錯:", error);
    return res.status(500).json({
      status: 'failed',
      message: '獲取用戶資料失敗'
    });
  }
};

// 更新用戶資料的處理函數
const updateUserProfile = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.id;
    
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
    } = req.body;
    
    // 查找用戶
    const userRepository = AppDataSource.getRepository(User);
    // 確保加載可能存在的關係，如果需要的話 (這裡可能不需要)
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
    if (birthday !== undefined) user.birthday = birthday;
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

    return res.status(200).json({
      status: 'success',
      message: '用戶資料更新成功',
      data: {
        user: updatedSelectedUser // 返回更新後、只包含選定字段的用戶對象
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      message: '更新用戶資料失敗'
    });
  }
};

const router = express.Router();

// 獲取用戶個人資料
router.get('/profile', isAuthenticated, getUserProfile);

// 更新用戶個人資料
router.put('/profile', isAuthenticated, updateUserProfile);

export default router; 
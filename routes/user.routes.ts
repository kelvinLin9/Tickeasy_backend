import express from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { AppDataSource } from '../config/database';
import { User } from '../models/user';

// 臨時的 profile 處理函數
const getUserProfile = async (req: express.Request, res: express.Response) => {
  try {
    // req.user 是由 isAuthenticated 中間件設置的
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        status: 'failed',
        message: '未授權'
      });
    }
    
    // 返回用戶資料
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          // 其他用戶資料可以根據需要添加
        }
      }
    });
  } catch (error) {
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
    const { name, nickname, phone, birthday, gender, address, country } = req.body;
    
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
    if (name) user.name = name;
    if (nickname) user.nickname = nickname;
    if (phone) user.phone = phone;
    if (birthday) user.birthday = birthday;
    if (gender) user.gender = gender;
    if (address) user.address = address;
    if (country) user.country = country;
    
    // 保存更新
    await userRepository.save(user);
    
    return res.status(200).json({
      status: 'success',
      message: '用戶資料更新成功',
      data: {
        user: {
          id: user.userId,
          name: user.name,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          birthday: user.birthday,
          gender: user.gender,
          address: user.address,
          country: user.country
        }
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
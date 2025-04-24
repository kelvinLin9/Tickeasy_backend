import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  googleLogin // 雖然暫不測試，但導入保持完整
} from '../controllers/auth';

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', register);

// POST /api/v1/auth/login
router.post('/login', login);

// POST /api/v1/auth/verify-email
router.post('/verify-email', verifyEmail);

// POST /api/v1/auth/resend-verification
router.post('/resend-verification', resendVerification);

// POST /api/v1/auth/request-password-reset
router.post('/request-password-reset', requestPasswordReset);

// POST /api/v1/auth/reset-password
router.post('/reset-password', resetPassword);

// Google 登入路由 (GET 和 POST) - 暫時保留，方便後續啟用
router.get('/google', googleLogin); // Passport 會處理重定向
router.post('/google/callback', googleLogin); // 處理 Google 回調

export default router; 
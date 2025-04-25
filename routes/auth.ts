import express, { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  googleLogin
} from '../controllers/auth';

const router: Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
// google login
router.get('/google', googleLogin); // Passport 會處理重定向
router.get('/google/callback', googleLogin); // 處理 Google 回調

export default router; 
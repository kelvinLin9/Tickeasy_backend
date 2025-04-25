/**
 * 認證相關響應類型定義
 */

// 基本用戶數據
export interface UserData {
  id: string;
  email: string;
  role: string;
  name: string;
  nickname?: string;
  phone?: string;
  birthday?: Date | string;
  avatar?: string;
  isEmailVerified: boolean;
}

// 認證響應數據
export interface AuthResponseData {
  token: string;
  user: UserData;
}

// 驗證響應數據
export interface VerificationResponseData {
  isEmailVerified: boolean;
}

// Google 用戶數據響應
export interface GoogleUserResponseData extends UserData {
  photo?: string;
  oauthProviders: string[];
  address?: string;
  gender?: string;
  intro?: string;
  facebook?: string;
  instagram?: string;
  discord?: string;
} 
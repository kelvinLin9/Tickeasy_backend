# API 
## BaseURL = `https://tickeasy-backend.onrender.com`
## 認證相關 API (前綴路徑：/api/v1/auth)

| 方法 | 路徑 | 功能 | 需要認證 |
|------|------|------|----------|
| POST | /register | 用戶註冊 | 否 |
| POST | /login | 用戶登入 | 否 |
| POST | /verify-email | 驗證電子郵件 | 否 |
| POST | /resend-verification | 重新發送驗證郵件 | 否 |
| POST | /request-password-reset | 請求重設密碼 | 否 |
| POST | /reset-password | 重設密碼 | 否 |
| GET | /google | Google 登入（OAuth） | 否 |

## 用戶相關 API (前綴路徑：/api/v1/users)

| 方法 | 路徑 | 功能 | 需要認證 |
|------|------|------|----------|
| GET | /profile | 獲取用戶個人資料 | 是 |
| PUT | /profile | 更新用戶個人資料 | 是 |

這些 API 已經配備了適當的中間件和錯誤處理，包括認證檢查、參數驗證等。系統使用 JWT 進行身份驗證，並且支持 Google OAuth 第三方登入。

API 返回格式遵循統一標準：
```json
{
  "status": "success" | "failed",
  "message": "操作結果訊息",
  "data": { ... } // 選擇性的數據內容
}
```

# Tickeasy 後端專案

這是一個使用 Express.js 和 TypeScript 構建的票務系統後端應用程式，提供一套完整的 API 服務，用於管理音樂會或活動的門票銷售與管理。

## 功能特點

- 用戶身份認證（本地和 Google OAuth 登入）
- 電子郵件驗證
- 帳號管理功能
- RESTful API 設計
- PostgreSQL 資料庫存儲
- TypeORM 物件關聯映射
- 安全性設計（Helmet 防護）
- API 參數驗證

## 技術棧

- **Node.js** + **Express**: 網頁應用框架
- **TypeScript**: 強型別的 JavaScript 超集
- **PostgreSQL**: 關聯式資料庫
- **TypeORM**: 物件關聯映射庫
- **JWT**: 使用者驗證
- **Passport.js**: 第三方身份驗證
- **Jest**: 單元測試框架

## 安裝與設定

### 先決條件

- Node.js (v14+)
- PostgreSQL
- npm 或 yarn

### 安裝步驟

1. 複製專案

   ```bash
   git clone <repository-url>
   cd tickeasy-backend
   ```

2. 安裝相依套件

   ```bash
   npm install
   ```

3. 環境變數設定
   建立 `.env` 檔案，並設定以下變數：

   ```
   PORT=3000
   NODE_ENV=development

   # 資料庫
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=tickeasy

   # JWT 設定
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d

   # Email 設定
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password

   # Google OAuth (選用)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
   ```

4. 執行資料庫遷移

   ```bash
   npm run migrate
   ```

5. 編譯 TypeScript
   ```bash
   npm run build
   ```

## 啟動應用程式

### 開發模式

```bash
npm run dev
```

### 生產模式

```bash
npm start
```

## API 文檔

### 基礎 URL

`https://tickeasy-backend.onrender.com` 或本地 `http://localhost:3000`

### 認證相關 API (前綴路徑：/api/v1/auth)

| 方法 | 路徑                    | 功能                 | 需要認證 |
| ---- | ----------------------- | -------------------- | -------- |
| POST | /register               | 用戶註冊             | 否       |
| POST | /login                  | 用戶登入             | 否       |
| POST | /verify-email           | 驗證電子郵件         | 否       |
| POST | /resend-verification    | 重新發送驗證郵件     | 否       |
| POST | /request-password-reset | 請求重設密碼         | 否       |
| POST | /reset-password         | 重設密碼             | 否       |
| GET  | /google                 | Google 登入（OAuth） | 否       |

### 用戶相關 API (前綴路徑：/api/v1/users)

| 方法 | 路徑     | 功能             | 需要認證 |
| ---- | -------- | ---------------- | -------- |
| GET  | /profile | 獲取用戶個人資料 | 是       |
| PUT  | /profile | 更新用戶個人資料 | 是       |

## 使用 Docker 部署

```bash
# 建立 Docker 映像
docker build -t tickeasy-backend .

# 運行容器
docker run -p 3000:3000 --env-file .env tickeasy-backend
```

## 測試

```bash
npm test
```

## 專案結構

```
tickeasy-backend/
├── bin/                  # 應用程式入口點
├── config/               # 設定檔案
├── controllers/          # 業務邏輯控制器
├── middlewares/          # 中間件
├── models/               # 資料模型 (TypeORM 實體)
├── routes/               # API 路由
├── types/                # TypeScript 類型定義
├── utils/                # 工具函數
├── views/                # 視圖 (可選，用於管理介面)
├── public/               # 靜態檔案
├── app.ts                # Express 應用程式設定
├── package.json          # 相依性管理
└── tsconfig.json         # TypeScript 設定
```

## 授權

本專案使用 ISC 授權協議。

---

如有任何問題或建議，請聯繫專案維護者。

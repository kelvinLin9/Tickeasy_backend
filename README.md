# Tickeasy 音樂會票務系統

使用 PostgreSQL 和 Express 構建的現代化音樂會票務預訂系統。

## 功能

- 用戶註冊和身份驗證 (JWT、Google OAuth)
- 音樂會瀏覽和進階搜索
- 票務預訂和金流整合
- 個人票券管理
- 管理員後台完整管理功能

## 技術棧

- **後端**：Node.js, Express, TypeScript
- **資料庫**：PostgreSQL, TypeORM
- **認證**：JWT, Google OAuth 2.0
- **容器化**：Docker, Docker Compose

## 安裝與運行

### 前置需求

- Node.js v14+
- PostgreSQL v12+
- Docker & Docker Compose (可選)

### 本地開發

1. 克隆倉庫

```bash
git clone https://github.com/yourusername/tickeasy-backend.git
cd tickeasy-backend
```

2. 安裝依賴

```bash
npm install
```

3. 環境配置

```bash
cp .env.example .env
# 編輯 .env 文件設置您的環境變數
```

4. 啟動資料庫 (使用 Docker)

```bash
docker-compose up -d
```

5. 運行遷移

```bash
npm run migrate
```

6. 啟動開發服務器

```bash
npm run dev
```

### 使用 Docker 部署

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## API 文檔

API 文檔使用 Swagger 生成，開發環境下可訪問：

```
http://localhost:3000/api-docs
```

## 數據庫模型

主要實體關係：

- 用戶 (Users)
- 音樂會 (Concerts)
- 場地 (Venues)
- 座位區域 (SeatSections)
- 票券 (Tickets)
- 訂單 (Orders)
- 支付記錄 (Payments)

## 貢獻指南

1. Fork 本倉庫
2. 創建新分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 創建 Pull Request

## 授權

[MIT](LICENSE)

import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

// 載入環境變數
dotenv.config();

// 模型和遷移檔案路徑
const modelsPath = [path.join(__dirname, '../models/**/*.{ts,js}')];
const migrationsPath = [path.join(__dirname, '../migrations/**/*.{ts,js}')];

// 資料庫連接配置
let dataSourceConfig: any = {
  type: 'postgres',
  synchronize: false, // 生產環境絕對不要設為 true
  logging: process.env.NODE_ENV === 'development',
  entities: modelsPath,
  migrations: migrationsPath,
  subscribers: [],
};

// 優先檢查 DATABASE_URL
if (process.env.DATABASE_URL) {
  dataSourceConfig = {
    ...dataSourceConfig,
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  // 本地開發環境設定
  dataSourceConfig = {
    ...dataSourceConfig,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'tickeasy',
  };
}

// 創建 DataSource 實例
export const AppDataSource = new DataSource(dataSourceConfig); 
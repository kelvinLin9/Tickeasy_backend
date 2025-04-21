/**
 * 資料庫配置文件
 * 
 * 使用: TypeORM (https://typeorm.io/)
 * 優勢:
 * - 原生 TypeScript 支持，類型定義完善
 * - 基於裝飾器的實體定義，符合物件導向設計
 * - 強大的關聯映射和查詢能力
 * - 靈活的遷移系統
 */

import { AppDataSource } from './data-source';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 連接到資料庫，並根據環境執行初始設定
 * 
 * 功能:
 * 1. 檢查並創建資料庫 (僅開發環境)
 * 2. 初始化 TypeORM 連接
 * 3. 根據配置執行遷移
 */
export const connectToDatabase = async () => {
  try {
    // 如果是本地開發環境，先檢查並創建資料庫
    if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
      await ensureDatabaseExists();
    }

    // 初始化 TypeORM 連接
    await AppDataSource.initialize();
    console.log('資料庫連接成功');

    // 根據環境變量決定是否執行遷移或同步
    if (process.env.NODE_ENV === 'development') {
      if (process.env.RESET_DB === 'true') {
        console.log('警告: 重設資料庫選項已啟用，但在 TypeORM 中應使用遷移來管理');
        // 在 TypeORM 中，推薦使用遷移而非 sync({ force: true })
        if (process.env.SYNC_DB === 'true') {
          // 僅在開發環境中使用同步，生產環境絕對不要啟用此選項
          AppDataSource.synchronize(true);
          console.log('資料庫已同步 (清除所有數據)');
        }
      } else if (process.env.RUN_MIGRATIONS === 'true') {
        // 執行所有待處理的遷移
        await AppDataSource.runMigrations();
        console.log('資料庫遷移已執行');
      }
    } else if (process.env.NODE_ENV === 'production' && process.env.RUN_MIGRATIONS === 'true') {
      // 生產環境下，僅在明確指定時執行遷移
      await AppDataSource.runMigrations();
      console.log('生產環境: 資料庫遷移已執行');
    }
  } catch (error) {
    console.error('資料庫連接失敗:', error);
    throw new Error('資料庫連接失敗');
  }
};

/**
 * 檢查資料庫是否存在，不存在則創建
 * (僅用於開發環境)
 */
async function ensureDatabaseExists() {
  const {
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_NAME = 'tickeasy',
    DB_USER = 'postgres',
    DB_PASSWORD,
  } = process.env;
  
  // 連接到默認資料庫以建立新資料庫
  const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    password: DB_PASSWORD,
    port: parseInt(DB_PORT, 10),
    database: 'postgres' // 連接到默認資料庫以建立新資料庫
  });

  try {
    // 檢查資料庫是否存在
    const checkDbResult = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`
    );

    // 如果資料庫不存在，則創建它
    if (checkDbResult.rows.length === 0) {
      console.log(`資料庫 ${DB_NAME} 不存在，正在創建...`);
      await pool.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`資料庫 ${DB_NAME} 創建成功`);
    }
  } catch (err) {
    console.error('檢查/創建資料庫時出錯:', err);
  } finally {
    await pool.end();
  }
}

export default AppDataSource; 
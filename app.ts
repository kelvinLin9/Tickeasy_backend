import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// 另外裝的
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import cors from 'cors';

// 資料庫連接
import { connectToDatabase } from './config/database';

// 確保模型初始化
import './models';

// 引入路由
import authRouter from './routes/auth';
import userRouter from './routes/user';

const app = express();

// 未捕獲的異常處理
process.on('uncaughtException', (err) => {
  console.error('未捕獲的異常:', err);
  process.exit(1);
});

// 未處理的 Promise 拒絕處理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', promise, '原因:', reason);
});

connectToDatabase()
  .then(() => console.log("資料庫連接成功"))
  .catch(err => {
    console.error("資料庫連接失敗:", err);
    console.error("錯誤詳情:", {
      message: err.message,
      code: err.code,
      syscall: err.syscall,
      hostname: err.hostname || '未提供'
    });
  });

// 中間件設置
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// 路由設置
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);


// 註冊錯誤處理中間件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('錯誤詳情:', err);
  
  // 開發環境顯示詳細錯誤信息，生產環境顯示友好錯誤信息
  const isDev = process.env.NODE_ENV === 'development';
  
  const statusCode = err.status || 500;
  
  // 處理特定類型的錯誤，提供友好的錯誤消息
  let message = err.message || '系統發生錯誤';
  
  // TypeORM 特定錯誤處理
  if (err.name === 'EntityPropertyNotFoundError') {
    message = '操作失敗，請稍後再試';
  }
  
  // 驗證錯誤
  if (err.name === 'ValidationError') {
    message = '提交的數據格式不正確';
  }
  
  res.status(statusCode).json({
    status: 'failed',
    message,
    // 只在開發環境下添加詳細錯誤信息
    ...(isDev && { details: err.stack })
  });
});

// 註冊 404 處理中間件
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'failed',
    message: '找不到該資源',
  });
});

// view engine setup 之後研究
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

export default app;

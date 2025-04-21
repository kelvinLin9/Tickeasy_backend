import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// 另外裝的
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import cors from 'cors';
import { connectToDatabase } from './config/database';

// 確保模型初始化
import './models';

// 引入路由
// 注釋掉未實現的路由
// import swaggerUi from 'swagger-ui-express';
// import specs from './config/swagger';
// import authRouter from './routes/auth.routes';
// import userRouter from './routes/user.routes';
// import verifyRouter from './routes/verify.routes';
// import adminRouter from './routes/admin.routes';
// import organizationRouter from './routes/organization.routes';
// import orderRouter from './routes/order.routes';
// import paymentRouter from './routes/payment.routes';
// import ticketRouter from './routes/ticket.routes';
// import ticketTypeRouter from './routes/ticketType.routes';

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

// 資料庫連接
connectToDatabase()
  .then(() => console.log("資料庫連接成功"))
  .catch(err => console.log("資料庫連接失敗:", err));

// 中間件設置
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Swagger UI - 暫時注釋掉
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 路由設置 - 暫時注釋掉未實現的路由
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/verify', verifyRouter);
// app.use('/api/v1/admin', adminRouter);
// app.use('/api/v1/organizations', organizationRouter);
// app.use('/api/v1/orders', orderRouter);
// app.use('/api/v1/payments', paymentRouter);
// app.use('/api/v1/ticket', ticketRouter);
// app.use('/api/v1/ticket-types', ticketTypeRouter);

// 註冊錯誤處理中間件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: 'failed',
    message: err.message || '系統發生錯誤',
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

import { Request, Response, NextFunction } from 'express';

/**
 * 異步錯誤處理包裝器
 * 用於捕獲異步路由處理函數中拋出的錯誤
 * @param fn 異步函數
 * @returns 包裝後的異步函數
 */
export const handleErrorAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error) => {
      next(error);
    });
  };
}; 
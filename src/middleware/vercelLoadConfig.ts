import { NextFunction, Request, Response } from 'express';

import { Config } from '@/config/config';

/**
 * vercel 环境下每次调用, 以通过 vercel api 获取最新环境变量
 * @param req
 * @param res
 * @param next
 */
export const vercelLoadMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.DAO_TOKEN && process.env.DAO_PROJECT_NAME) {
    await Config.getConfig().load();
  }
  return next();
};

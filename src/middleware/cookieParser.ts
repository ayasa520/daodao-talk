import { NextFunction, Request, Response } from 'express';
import cookieParser, { CookieParseOptions } from 'cookie-parser';

import { Config } from '@/config/config';
import logger from '@/utils/logger';

export function getCookieParser(
  secretAttribute: string,
  options?: CookieParseOptions
) {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info('中间件 cookie');
    const secretVal = Config.getConfig().get(secretAttribute);
    // 没有设置, 直接 next
    if (secretVal) {
      logger.info(`设置 secret ${secretVal}`);
      return cookieParser(secretVal, options)(req, res, next);
    }
    logger.info('未设置 secret');
    return next();
  };
}

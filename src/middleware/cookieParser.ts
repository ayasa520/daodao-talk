import express from 'express';
import _cookieParser, { CookieParseOptions } from 'cookie-parser';
import { BaseMiddleware } from 'inversify-express-utils';
import { inject } from 'inversify';

import { Config } from '@/config/config';
import logger from '@/utils/logger';
import TYPES from '@/constants/TYPES';

export function cookieParser(secretConfigKey: symbol): symbol {
  return secretConfigKey;
}

export class CookieParserMiddleware extends BaseMiddleware {
  public constructor(
    public configurer: Config,
    private secretConfigKey: symbol,
    private options?: CookieParseOptions
  ) {
    super();
  }

  public handler(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    logger.info('中间件 cookie');
    const secretVal = this.configurer.get(this.secretConfigKey.description as string);
    // 没有设置, 直接 next
    if (secretVal) {
      logger.info(`设置 secret ${secretVal}`);
      return _cookieParser(secretVal, this.options)(req, res, next);
    }
    logger.info('未设置 secret');
    return next();
  }
}

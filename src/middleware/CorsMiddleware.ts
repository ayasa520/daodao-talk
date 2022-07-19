import express from 'express';
import _cors from 'cors';
import { BaseMiddleware } from 'inversify-express-utils';

import { Config } from '@/config/Config';
import logger from '@/utils/logger';

export function corsMiddleware(originConfigKey: symbol): symbol {
  return originConfigKey;
}

export class CorsMiddleware extends BaseMiddleware {
  public constructor(
    private readonly configurer: Config,
    private originConfigKey: symbol
  ) {
    super();
  }

  public handler(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    const domain = this.configurer.get(
      this.originConfigKey.description as string
    );
    if (domain) {
      logger.info('有 domain 设置');
      return _cors({ origin: domain })(req, res, next);
    }
    logger.info('无 domain 设置');
    return next();
  }
}

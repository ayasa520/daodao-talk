import express from 'express';
import { BaseMiddleware } from 'inversify-express-utils';
import { injectable } from 'inversify';

import { Config } from '@/config/config';
import logger from '@/utils/logger';

@injectable()
export class VercelMiddleware extends BaseMiddleware {
  public constructor(private configurer: Config) {
    super();
  }

  public async handler(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    if (process.env.DAO_TOKEN && process.env.DAO_PROJECT_NAME) {
      logger.info('每次load');
      await this.configurer.load();
    }
    return next();
  }
}

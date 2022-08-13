import express from 'express';
import { BaseMiddleware } from 'inversify-express-utils';
import { injectable } from 'inversify';

import { Config } from '@/config/Config';
import logger from '@/utils/logger';

/**
 * vercel 环境生效. 这个中间件在每次响应请求前重新读取配置并连接数据库, 因为 serverless 的特性, 读入 configMap 的配置无法
 * 长期存在, 所以需要这样做
 */
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

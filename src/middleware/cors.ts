import { NextFunction, Request, Response } from 'express';
import cors from 'cors';

import { Config } from '@/config/config';
import logger from '@/utils/logger';

export function getCors(domainAttribute: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // options?: cors.CorsOptions | cors.CorsOptionsDelegate<cors.CorsRequest>
    const domain = Config.getConfig().get(domainAttribute);
    if (domain) {
      logger.info('有 domain 设置');
      return cors({ origin: domain })(req, res, next);
    }
    logger.info('无 domain 设置');
    return next();
  };
}

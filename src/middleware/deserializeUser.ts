import express from 'express';
import { get } from 'lodash';
import { inject, injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';

import logger from '@/utils/logger';
import TYPES from '@/constants/TYPES';
import { Config } from '@/config/config';
import { SessionService } from '@/service/SessionService';
import { JwtUtils } from '@/utils/jwt.utils';

// 从 token 中解码出用户信息
@injectable()
export class DeserializeUser extends BaseMiddleware {
  public constructor(
    @inject(TYPES.Configurer) private configurer: Config,
    @inject(TYPES.SessionService) private sessionService: SessionService,
    @inject(TYPES.JwtUtils) private jwtUtils: JwtUtils
  ) {
    super();
  }

  public async handler(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    const accessToken: string = get(req.signedCookies, 'accessToken');
    const refreshToken: string = get(req.signedCookies, 'refreshToken');

    // 用户没有携带 token, 直接执行下一个中间件. 如果下一个需要用到 token 解码出的 user 才返回报错
    if (!accessToken) {
      return next();
    }

    const { valid, expired, decoded } = this.jwtUtils.verifyJwt(accessToken);
    if (valid) {
      res.locals.user = decoded;
      return next();
    }

    if (expired && refreshToken) {
      const newAccessToken = await this.sessionService.refreshAccessToken(
        refreshToken
      );
      if (newAccessToken) {
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          signed: true,
        });
        const result = this.jwtUtils.verifyJwt(newAccessToken);
        res.locals.user = result.decoded;
        logger.info(res.locals.user);
      }
      return next();
    }
    return next();
  }
}
